import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { availableRewardWhere } from "@/lib/rewards";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You need to sign in first" }, { status: 401 });
  }

  const { id } = await params;
  const now = new Date();

  // Atomic single-use claim, same pattern as QrToken redemption: only one
  // concurrent request can flip redeemedAt from null.
  const claim = await prisma.rewardRedemption.updateMany({
    where: { id, userId: session.user.id, ...availableRewardWhere(now) },
    data: { redeemedAt: now },
  });

  if (claim.count !== 1) {
    return NextResponse.json(
      { error: "This reward has already been redeemed or has expired" },
      { status: 409 },
    );
  }

  return NextResponse.json({ redeemedAt: now.toISOString() });
}
