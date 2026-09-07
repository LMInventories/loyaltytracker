import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBusinessAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional().or(z.literal("")),
  startsAt: z.string().datetime().nullable().optional().or(z.literal("")),
  endsAt: z.string().datetime().nullable().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/offers/[id]">,
) {
  const admin = await requireBusinessAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { id } = await ctx.params;
  const existing = await prisma.specialOffer.findUnique({ where: { id } });
  if (!existing || existing.businessId !== admin.businessId) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const offer = await prisma.specialOffer.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description || null } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
      ...(data.startsAt !== undefined
        ? { startsAt: data.startsAt ? new Date(data.startsAt) : null }
        : {}),
      ...(data.endsAt !== undefined ? { endsAt: data.endsAt ? new Date(data.endsAt) : null } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });

  return NextResponse.json({ offer });
}
