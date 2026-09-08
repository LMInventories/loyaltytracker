import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StampProgress, PointsProgress } from "@/components/shared/LoyaltyProgress";

export default async function MyCardDetailPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const session = await auth();

  const balances = await prisma.loyaltyBalance.findMany({
    where: { userId: session!.user.id, businessId },
    include: {
      business: true,
      scheme: { include: { rewardTiers: { orderBy: { threshold: "asc" } } } },
    },
  });

  if (balances.length === 0) notFound();

  const business = balances[0].business;

  const transactions = await prisma.loyaltyTransaction.findMany({
    where: { userId: session!.user.id, businessId },
    include: { scheme: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Link href="/me" className="text-sm text-ink-soft hover:text-ink">
          ← My cards
        </Link>
        <h1 className="font-display text-2xl font-semibold text-ink">{business.name}</h1>
        <div className="flex gap-4">
          <Link href={`/businesses/${business.slug}`} className="text-sm text-ink-soft underline">
            View business page
          </Link>
          <Link href={`/businesses/${business.slug}/rewards`} className="text-sm text-ink underline">
            Rewards
          </Link>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        {balances.map((balance) => (
          <div key={balance.id} className="flex flex-col gap-3 border border-line bg-surface p-5">
            <h2 className="font-medium text-ink">{balance.scheme.name}</h2>
            {balance.scheme.type === "STAMPS" && balance.scheme.stampsRequired ? (
              <StampProgress
                total={balance.scheme.stampsRequired}
                filled={balance.stamps}
                rewardText={balance.scheme.stampRewardText}
              />
            ) : (
              <PointsProgress points={balance.points} tiers={balance.scheme.rewardTiers} />
            )}
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-ink">History</h2>
        {transactions.length === 0 ? (
          <p className="text-ink-soft">No scans yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line border border-line bg-surface">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-ink">{tx.scheme.name}</p>
                  <p className="text-ink-soft">
                    {tx.createdAt.toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="font-number text-ink">
                  {tx.pointsDelta > 0 && `+${tx.pointsDelta} pts`}
                  {tx.stampsDelta > 0 && `+${tx.stampsDelta} stamp`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
