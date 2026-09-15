import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function offerStatus(offer: { isActive: boolean; endsAt: Date | null }) {
  if (!offer.isActive) return "inactive";
  if (offer.endsAt && offer.endsAt.getTime() < Date.now()) return "expired";
  return "active";
}

export default async function AdminOffersPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;

  const offers = await prisma.specialOffer.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Special offers</h1>
        <Link
          href="/admin/offers/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          New offer
        </Link>
      </div>

      {offers.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No offers yet. Add one to advertise a promotion to customers.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {offers.map((offer) => (
            <li key={offer.id}>
              <Link
                href={`/admin/offers/${offer.id}`}
                className="flex items-center justify-between rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 hover:border-zinc-400 dark:hover:border-zinc-600"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{offer.title}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{offerStatus(offer)}</p>
                </div>
                <span className="text-sm text-zinc-400 dark:text-zinc-500">Edit →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
