import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBusinessAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  startsAt: z.string().datetime().optional().or(z.literal("")),
  endsAt: z.string().datetime().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const admin = await requireBusinessAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const offer = await prisma.specialOffer.create({
    data: {
      businessId: admin.businessId,
      title: data.title,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    },
  });

  return NextResponse.json({ offer }, { status: 201 });
}
