import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  code: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You need to sign in first" }, { status: 401 });
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
  const previousStamps = previousBalance?.stamps ?? 0;

  const [balance] = await prisma.$transaction([
    prisma.loyaltyBalance.upsert({
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
    }),
    prisma.loyaltyTransaction.create({
      data: {
        userId,
        businessId: token.businessId,
        schemeId: token.schemeId,
        qrTokenId: token.id,
        pointsDelta,
        stampsDelta,
      },
    }),
  ]);

  const unlockedRewards: string[] = [];

  if (token.scheme.type === "POINTS") {
    for (const tier of token.scheme.rewardTiers) {
      if (tier.threshold > previousPoints && tier.threshold <= balance.points) {
        unlockedRewards.push(tier.rewardText);
      }
    }
  } else if (
    token.scheme.type === "STAMPS" &&
    token.scheme.stampsRequired &&
    token.scheme.stampRewardText &&
    previousStamps < token.scheme.stampsRequired &&
    balance.stamps >= token.scheme.stampsRequired
  ) {
    unlockedRewards.push(token.scheme.stampRewardText);
  }

  return NextResponse.json({
    business: { name: token.business.name, slug: token.business.slug },
    scheme: { name: token.scheme.name, type: token.scheme.type },
    balance: { points: balance.points, stamps: balance.stamps },
    unlockedRewards,
  });
}
