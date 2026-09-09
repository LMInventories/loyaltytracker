import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { availableRewardWhere } from "@/lib/rewards";

const requestSchema = z.object({
  code: z.string().min(1),
});

class ClaimFailedError extends Error {
  constructor(public readonly reason: "code" | "reward") {
    super(reason);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You need to sign in first" }, { status: 401 });
  }

  if (isRateLimited(`reward-redeem:${session.user.id}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a moment and try again." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
  }

  const { code } = parsed.data;
  const { id } = await params;
  const userId = session.user.id;
  const now = new Date();

  const reward = await prisma.rewardRedemption.findFirst({
    where: { id, userId, ...availableRewardWhere(now) },
    select: { businessId: true },
  });

  if (!reward) {
    return NextResponse.json(
      { error: "This reward has already been redeemed or has expired" },
      { status: 409 },
    );
  }

  // The scanned code is the business's live "scan to earn" QrToken, reused
  // here purely as proof the customer is at the counter right now — this
  // claim never touches LoyaltyBalance/LoyaltyTransaction, only the earn
  // flow (/api/redeem) does that. Claiming the token and the reward happen
  // in one transaction so a code can't be "spent" on a reward claim that
  // then fails (and vice versa).
  try {
    await prisma.$transaction(async (tx) => {
      const tokenClaim = await tx.qrToken.updateMany({
        where: { code, businessId: reward.businessId, redeemedAt: null, expiresAt: { gt: now } },
        data: { redeemedAt: now, redeemedById: userId },
      });
      if (tokenClaim.count !== 1) throw new ClaimFailedError("code");

      const rewardClaim = await tx.rewardRedemption.updateMany({
        where: { id, userId, ...availableRewardWhere(now) },
        data: { redeemedAt: now },
      });
      if (rewardClaim.count !== 1) throw new ClaimFailedError("reward");
    });
  } catch (err) {
    if (err instanceof ClaimFailedError) {
      return NextResponse.json(
        {
          error:
            err.reason === "code"
              ? "This code has already been used or has expired"
              : "This reward has already been redeemed or has expired",
        },
        { status: 409 },
      );
    }
    throw err;
  }

  return NextResponse.json({ redeemedAt: now.toISOString() });
}
