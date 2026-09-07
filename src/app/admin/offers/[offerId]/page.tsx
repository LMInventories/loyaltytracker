import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OfferForm } from "@/components/admin/OfferForm";

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const session = await auth();
  const businessId = session!.user.businessId!;

  const offer = await prisma.specialOffer.findUnique({ where: { id: offerId } });
  if (!offer || offer.businessId !== businessId) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900">{offer.title}</h1>
      <OfferForm
        offer={{
          id: offer.id,
          title: offer.title,
          description: offer.description,
          imageUrl: offer.imageUrl,
          startsAt: offer.startsAt?.toISOString() ?? null,
          endsAt: offer.endsAt?.toISOString() ?? null,
          isActive: offer.isActive,
        }}
      />
    </main>
  );
}
