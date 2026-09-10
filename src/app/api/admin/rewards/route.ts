import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBusinessAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { expiresAtFor } from "@/lib/rewards";
import { rewardUnlockedEmailHtml, sendEmailIfOptedIn } from "@/lib/email";

const requestSchema = z.object({
  userId: z.string().min(1),
  schemeId: z.string().min(1),
  rewardTierId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const admin = await requireBusinessAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  if (isRateLimited(`admin-grant-reward:${admin.businessId}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a moment and try again." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { userId, schemeId, rewardTierId } = parsed.data;

  // Only a customer who already has a balance at this business can be
  // granted a reward here — this is the same set of people listed on the
  // admin Customers page the form is embedded in, not an arbitrary user id.
  const customer = await prisma.loyaltyBalance.findFirst({
    where: { userId, businessId: admin.businessId },
  });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const scheme = await prisma.loyaltyScheme.findUnique({
    where: { id: schemeId },
    include: { rewardTiers: true, business: true },
  });
  if (!scheme || scheme.businessId !== admin.businessId || !scheme.isActive) {
    return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
  }

  let rewardText: string;
  let resolvedTierId: string | null = null;

  if (scheme.type === "POINTS") {
    const tier = rewardTierId ? scheme.rewardTiers.find((t) => t.id === rewardTierId) : undefined;
    if (!tier) {
      return NextResponse.json({ error: "Reward tier not found" }, { status: 400 });
    }
    rewardText = tier.rewardText;
    resolvedTierId = tier.id;
  } else {
    if (!scheme.stampRewardText) {
      return NextResponse.json(
        { error: "This scheme has no reward configured" },
        { status: 400 },
      );
    }
    rewardText = scheme.stampRewardText;
  }

  const redemption = await prisma.rewardRedemption.create({
    data: {
      userId,
      businessId: admin.businessId,
      schemeId: scheme.id,
      rewardTierId: resolvedTierId,
      rewardText,
      expiresAt: expiresAtFor(scheme.rewardExpiryDays),
    },
  });

  void sendEmailIfOptedIn(userId, {
    subject: `You've been granted a reward at ${scheme.business.name}`,
    html: rewardUnlockedEmailHtml(scheme.business.name, rewardText, redemption.expiresAt),
  });

  return NextResponse.json({ redemption }, { status: 201 });
}
