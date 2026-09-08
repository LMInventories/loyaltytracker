import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { expiresAtFor } from "@/lib/rewards";

const requestSchema = z.object({
  code: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You need to sign in first" }, { status: 401 });
  }

  if (isRateLimited(`redeem:${session.user.id}`, 20, 60_000)) {
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
  const userId = session.user.id;
  const now = new Date();

  // Atomic single-use claim: only one concurrent request can flip
  // redeemedAt from null, so a double-scan is rejected here.
  const claim = await prisma.qrToken.updateMany({
    where: { code, redeemedAt: null, expiresAt: { gt: now } },
    data: { redeemedAt: now, redeemedById: userId },
  });

  if (claim.count !== 1) {
    return NextResponse.json(
      { error: "This code has already been used or has expired" },
      { status: 409 },
    );
  }

  const token = await prisma.qrToken.findUniqueOrThrow({
    where: { code },
    include: {
      scheme: { include: { rewardTiers: { orderBy: { threshold: "asc" } } } },
      business: true,
    },
  });

  const pointsDelta =
    token.scheme.type === "POINTS" ? (token.pointsValue ?? token.scheme.pointsPerScan ?? 0) : 0;
  const stampsDelta =
    token.scheme.type === "STAMPS" ? (token.stampsValue ?? 1) : 0;

  const previousBalance = await prisma.loyaltyBalance.findUnique({
    where: { userId_schemeId: { userId, schemeId: token.schemeId } },
  });
  const previousPoints = previousBalance?.points ?? 0;

  const { balance, unlockedRewards } = await prisma.$transaction(async (tx) => {
    const balance = await tx.loyaltyBalance.upsert({
      where: { userId_schemeId: { userId, schemeId: token.schemeId } },
      create: {
        userId,
        businessId: token.businessId,
        schemeId: token.schemeId,
        points: pointsDelta,
        stamps: stampsDelta,
      },
      update: {
        points: { increment: pointsDelta },
        stamps: { increment: stampsDelta },
      },
    });

    await tx.loyaltyTransaction.create({
      data: {
        userId,
        businessId: token.businessId,
        schemeId: token.schemeId,
        qrTokenId: token.id,
        pointsDelta,
        stampsDelta,
      },
    });

    const expiresAt = expiresAtFor(token.scheme.rewardExpiryDays);
    const unlockedRewards: { id: string; rewardText: string; expiresAt: Date | null }[] = [];

    if (token.scheme.type === "POINTS") {
      for (const tier of token.scheme.rewardTiers) {
        if (tier.threshold > previousPoints && tier.threshold <= balance.points) {
          const redemption = await tx.rewardRedemption.create({
            data: {
              userId,
              businessId: token.businessId,
              schemeId: token.schemeId,
              rewardTierId: tier.id,
              rewardText: tier.rewardText,
              expiresAt,
            },
          });
          unlockedRewards.push(redemption);
        }
      }
    } else if (
      token.scheme.type === "STAMPS" &&
      token.scheme.stampsRequired &&
      token.scheme.stampRewardText &&
      balance.stamps >= token.scheme.stampsRequired
    ) {
      // The card resets as soon as it's full — a reward is granted and the
      // stamp count drops back to the leftover (usually 0), so the customer
      // immediately starts working toward the next one. The reward itself
      // stays on the account, independent of the reset counter, until it's
      // redeemed or expires.
      const rewardsToGrant = Math.floor(balance.stamps / token.scheme.stampsRequired);
      const remainder = balance.stamps % token.scheme.stampsRequired;

      for (let i = 0; i < rewardsToGrant; i++) {
        const redemption = await tx.rewardRedemption.create({
          data: {
            userId,
            businessId: token.businessId,
            schemeId: token.schemeId,
            rewardText: token.scheme.stampRewardText,
            expiresAt,
          },
        });
        unlockedRewards.push(redemption);
      }

      await tx.loyaltyBalance.update({
        where: { userId_schemeId: { userId, schemeId: token.schemeId } },
        data: { stamps: remainder },
      });
      balance.stamps = remainder;
    }

    return { balance, unlockedRewards };
  });

  return NextResponse.json({
    business: { name: token.business.name, slug: token.business.slug },
    scheme: { name: token.scheme.name, type: token.scheme.type },
    balance: { points: balance.points, stamps: balance.stamps },
    unlockedRewards: unlockedRewards.map((r) => ({
      id: r.id,
      rewardText: r.rewardText,
      expiresAt: r.expiresAt,
    })),
  });
}
