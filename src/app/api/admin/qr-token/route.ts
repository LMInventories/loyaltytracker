import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60_000;

const requestSchema = z.object({
  schemeId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "BUSINESS_ADMIN" || !session.user.businessId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const scheme = await prisma.loyaltyScheme.findUnique({
    where: { id: parsed.data.schemeId },
  });

  if (!scheme || scheme.businessId !== session.user.businessId || !scheme.isActive) {
    return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
  }

  const code = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  const token = await prisma.qrToken.create({
    data: {
      code,
      businessId: scheme.businessId,
      schemeId: scheme.id,
      expiresAt,
    },
  });

  return NextResponse.json({ code: token.code, expiresAt: token.expiresAt });
}
