import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { requirePlatformAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const schemeSchema = z.discriminatedUnion("type", [
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

const createSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  category: z.string().optional(),
  address: z.string().optional(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  scheme: schemeSchema,
});

export async function POST(request: Request) {
  const platformAdmin = await requirePlatformAdmin();
  if (!platformAdmin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  const existingSlug = await prisma.business.findUnique({ where: { slug: data.slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "That URL is already taken" }, { status: 409 });
  }
  const existingEmail = await prisma.user.findUnique({ where: { email: data.adminEmail } });
  if (existingEmail) {
    return NextResponse.json({ error: "That email is already in use" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(data.adminPassword, 12);
  const scheme = data.scheme;

  const business = await prisma.business.create({
    data: {
      name: data.name,
      slug: data.slug,
      category: data.category || null,
      address: data.address || null,
      admins: {
        create: {
          email: data.adminEmail,
          passwordHash,
          role: "BUSINESS_ADMIN",
        },
      },
      schemes: {
        create: [
          {
            name: scheme.name,
            type: scheme.type,
            pointsPerScan: scheme.type === "POINTS" ? scheme.pointsPerScan : null,
            stampsRequired: scheme.type === "STAMPS" ? scheme.stampsRequired : null,
            stampRewardText: scheme.type === "STAMPS" ? scheme.stampRewardText : null,
          },
        ],
      },
    },
  });

  return NextResponse.json({ business }, { status: 201 });
}
