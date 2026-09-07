import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const business = await prisma.business.findUnique({
    where: { slug, isActive: true },
    include: {
      schemes: {
        where: { isActive: true },
        include: { rewardTiers: { orderBy: { threshold: "asc" } } },
      },
      offers: { where: { isActive: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!business) notFound();

  const balances = session?.user
    ? await prisma.loyaltyBalance.findMany({
        where: { userId: session.user.id, businessId: business.id },
      })
    : [];

  const balanceByScheme = new Map(balances.map((b) => [b.schemeId, b]));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-4">
        <Link href="/" className="text-sm text-ink-soft hover:text-ink">
          ← Back to directory
        </Link>
        <div>
          {business.category && (
            <p className="text-sm text-ink-soft">{business.category}</p>
          )}
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {business.name}
          </h1>
          {business.address && (
            <p className="mt-1 text-sm text-ink-soft">{business.address}</p>
          )}
        </div>
        {business.description && <p className="text-ink">{business.description}</p>}
        {business.schemes.length > 0 && (
          <Link
            href={`/businesses/${business.slug}/scan`}
            className="inline-flex w-fit items-center gap-2 rounded-sm bg-stamp px-5 py-2.5 text-sm font-medium text-surface hover:bg-stamp/90"
          >
            Scan QR to earn
          </Link>
        )}
      </div>

      {business.schemes.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold text-ink">Loyalty</h2>
          <ul className="flex flex-col gap-4">
            {business.schemes.map((scheme) => {
              const balance = balanceByScheme.get(scheme.id);

              return (
                <li
                  key={scheme.id}
                  className="flex flex-col gap-3 border border-line bg-surface p-5"
                >
                  <h3 className="font-medium text-ink">{scheme.name}</h3>

                  {scheme.type === "STAMPS" && scheme.stampsRequired && (
                    <StampProgress
                      total={scheme.stampsRequired}
                      filled={balance?.stamps ?? 0}
                      rewardText={scheme.stampRewardText}
                    />
                  )}

                  {scheme.type === "POINTS" && (
                    <PointsProgress
                      points={balance?.points ?? 0}
                      tiers={scheme.rewardTiers}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {business.offers.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold text-ink">
            Special offers
          </h2>
          <ul className="flex flex-col gap-4">
            {business.offers.map((offer) => (
              <li
                key={offer.id}
                className="flex flex-col gap-1 border border-line bg-awning-soft p-5"
              >
                <h3 className="font-medium text-ink">{offer.title}</h3>
                {offer.description && (
                  <p className="text-sm text-ink-soft">{offer.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function StampProgress({
  total,
  filled,
  rewardText,
}: {
  total: number;
  filled: number;
  rewardText: string | null;
}) {
  const clampedFilled = Math.min(filled, total);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={
              i < clampedFilled
                ? "flex h-7 w-7 items-center justify-center rounded-full border border-stamp bg-stamp text-xs text-surface"
                : "flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-line text-xs text-ink-soft"
            }
          >
            {i < clampedFilled ? "●" : ""}
          </span>
        ))}
      </div>
      <p className="font-number text-sm text-ink-soft">
        {clampedFilled} / {total} stamps
        {rewardText ? ` — ${rewardText}` : ""}
      </p>
    </div>
  );
}

function PointsProgress({
  points,
  tiers,
}: {
  points: number;
  tiers: { id: string; threshold: number; rewardText: string }[];
}) {
  const nextTier = tiers.find((tier) => tier.threshold > points);
  const target = nextTier?.threshold ?? tiers.at(-1)?.threshold ?? points;
  const pct = target > 0 ? Math.min(100, Math.round((points / target) * 100)) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-stamp-soft">
        <div className="h-full bg-stamp" style={{ width: `${pct}%` }} />
      </div>
      <p className="font-number text-sm text-ink-soft">
        {points} pts
        {nextTier
          ? ` — ${nextTier.threshold - points} to go for ${nextTier.rewardText}`
          : tiers.length > 0
            ? " — top reward unlocked"
            : ""}
      </p>
    </div>
  );
}
