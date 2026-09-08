import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { sendEmailIfOptedIn, welcomeEmailHtml } from "@/lib/email";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        // Google-only accounts have no passwordHash — reject credential
        // sign-in for them instead of comparing against nothing.
        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          businessId: user.businessId,
        };
      },
    }),
  ],
  events: {
    // Only fires for adapter-provisioned users, i.e. Google sign-in — the
    // credentials register route bypasses the adapter entirely and sends
    // its own welcome email, so this never double-fires for the same user.
    createUser: async ({ user }) => {
      if (user.id) {
        void sendEmailIfOptedIn(user.id, {
          subject: "Welcome to Local Loyalty",
          html: welcomeEmailHtml(user.name ?? null),
        });
      }
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.businessId = user.businessId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "CUSTOMER" | "BUSINESS_ADMIN" | "PLATFORM_ADMIN";
        session.user.businessId = token.businessId as string | null;
      }
      return session;
    },
  },
});
