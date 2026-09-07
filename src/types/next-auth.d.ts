import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "CUSTOMER" | "BUSINESS_ADMIN";
    businessId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "BUSINESS_ADMIN";
      businessId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "CUSTOMER" | "BUSINESS_ADMIN";
    businessId: string | null;
  }
}
