import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBusinessAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  pointsPerScan: z.coerce.number().int().min(1).optional(),
  stampsRequired: z.coerce.number().int().min(1).optional(),
  stampRewardText: z.string().min(1).optional(),
  stampRewardImageUrl: z.string().url().nullable().optional(),
});

async function loadOwnedScheme(id: string, businessId: string) {
  const scheme = await prisma.loyaltyScheme.findUnique({ where: { id } });
  if (!scheme || scheme.businessId !== businessId) return null;
  return scheme;
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/schemes/[id]">,
) {
  const admin = await requireBusinessAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await ctx.params;
  const existing = await loadOwnedScheme(id, admin.businessId);
  if (!existing) return NextResponse.json({ error: "Scheme not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const scheme = await prisma.loyaltyScheme.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ scheme });
}
