import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { geocodePostcode } from "@/lib/geocode";

const requestSchema = z.object({
  postcode: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  if (isRateLimited(`set-postcode:${session.user.id}`, 10, 15 * 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a while and try again." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const location = await geocodePostcode(parsed.data.postcode);
  if (!location) {
    return NextResponse.json(
      { error: "We couldn't find that postcode. Check it and try again." },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      postcode: parsed.data.postcode.trim().toUpperCase(),
      latitude: location.latitude,
      longitude: location.longitude,
    },
  });

  return NextResponse.json({ ok: true });
}
