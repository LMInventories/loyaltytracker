import { NextResponse } from "next/server";
import { z } from "zod";

import { requireBusinessAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { geocodePostcode } from "@/lib/geocode";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only")
    .optional(),
  description: z.string().nullable().optional(),
  logoUrl: z.string().url().nullable().optional().or(z.literal("")),
  address: z.string().nullable().optional(),
  postcode: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
});

export async function PATCH(request: Request) {
  const admin = await requireBusinessAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  let locationUpdate:
    | { postcode: string | null; latitude: number | null; longitude: number | null }
    | undefined;

  if (data.postcode !== undefined) {
    const trimmed = (data.postcode ?? "").trim();
    if (!trimmed) {
      locationUpdate = { postcode: null, latitude: null, longitude: null };
    } else {
      const location = await geocodePostcode(trimmed);
      if (!location) {
        return NextResponse.json(
          { error: "We couldn't find that postcode. Check it and try again." },
          { status: 400 },
        );
      }
      locationUpdate = {
        postcode: trimmed.toUpperCase(),
        latitude: location.latitude,
        longitude: location.longitude,
      };
    }
  }

  try {
    const business = await prisma.business.update({
      where: { id: admin.businessId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl || null } : {}),
        ...(data.address !== undefined ? { address: data.address || null } : {}),
        ...(data.category !== undefined ? { category: data.category || null } : {}),
        ...(locationUpdate ?? {}),
      },
    });
    return NextResponse.json({ business });
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "P2002") {
      return NextResponse.json({ error: "That URL is already taken" }, { status: 409 });
    }
    throw err;
  }
}
