import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBusinessAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const createSchema = z.discriminatedUnion("type", [
  z.object({
    name: z.string().min(1),
    type: z.literal("POINTS"),
    pointsPerScan: z.coerce.number().int().min(1),
  }),
  z.object({
    name: z.string().min(1),
    type: z.literal("STAMPS"),
    stampsRequired: z.coerce.number().int().min(1),
    stampRewardText: z.string().min(1),
  }),
]);

export async function POST(request: Request) {
  const admin = await requireBusinessAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const scheme = await prisma.loyaltyScheme.create({
    data: {
      businessId: admin.businessId,
      name: data.name,
      type: data.type,
      pointsPerScan: data.type === "POINTS" ? data.pointsPerScan : null,
      stampsRequired: data.type === "STAMPS" ? data.stampsRequired : null,
      stampRewardText: data.type === "STAMPS" ? data.stampRewardText : null,
    },
  });

  return NextResponse.json({ scheme }, { status: 201 });
}
