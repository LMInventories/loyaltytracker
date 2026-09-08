import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "BUSINESS_ADMIN" || !session.user.businessId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;

  const token = await prisma.qrToken.findUnique({
    where: { id },
    select: { businessId: true, redeemedAt: true },
  });

  if (!token || token.businessId !== session.user.businessId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ redeemed: token.redeemedAt !== null });
}
