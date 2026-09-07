import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBusinessAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const tiersSchema = z.object({
  tiers: z
    .array(
      z.object({
        threshold: z.coerce.number().int().min(1),
        rewardText: z.string().min(1),
      }),
    )
    .max(20),
});

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/admin/schemes/[id]/reward-tiers">,
) {
  const admin = await requireBusinessAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await ctx.params;
  const scheme = await prisma.loyaltyScheme.findUnique({ where: { id } });
  if (!scheme || scheme.businessId !== admin.businessId) {
    return NextResponse.json({ error: "Scheme not found" }, { status: 404 });
  }
  if (scheme.type !== "POINTS") {
    return NextResponse.json(
      { error: "Reward tiers only apply to points schemes" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = tiersSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const sorted = [...parsed.data.tiers].sort((a, b) => a.threshold - b.threshold);

  await prisma.$transaction([
    prisma.rewardTier.deleteMany({ where: { schemeId: id } }),
    prisma.rewardTier.createMany({
      data: sorted.map((tier, index) => ({
        schemeId: id,
        threshold: tier.threshold,
        rewardText: tier.rewardText,
        sortOrder: index,
      })),
    }),
  ]);

  const tiers = await prisma.rewardTier.findMany({
    where: { schemeId: id },
    orderBy: { threshold: "asc" },
  });

  return NextResponse.json({ tiers });
}
