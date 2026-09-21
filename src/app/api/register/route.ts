import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { sendEmailIfOptedIn, welcomeEmailHtml } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  // bcrypt only uses the first 72 bytes; the cap also stops huge-body hashing DoS.
  password: z.string().min(8).max(72),
  name: z.string().trim().min(1).max(100).optional(),
});

export async function POST(request: Request) {
  if (isRateLimited(`register:${getClientIp(request)}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a moment and try again." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: "CUSTOMER",
    },
    select: { id: true, email: true, name: true },
  });

  void sendEmailIfOptedIn(user.id, {
    subject: "Welcome to Local Loyalty",
    html: welcomeEmailHtml(user.name),
  });

  return NextResponse.json({ user }, { status: 201 });
}
