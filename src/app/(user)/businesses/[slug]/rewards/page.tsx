import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RewardCard } from "@/components/shared/RewardCard";
import { rewardStatus } from "@/lib/rewards";

export default async function BusinessRewardsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const business = await prisma.business.findUnique({
    where: { slug, isActive: true },
  });

  if (!business) notFound();

  const redemptions = await prisma.rewardRedemption.findMany({
    where: { userId: session!.user.id, businessId: business.id },
    orderBy: { unlockedAt: "desc" },
  });

  const now = new Date();
  const available = redemptions.filter((r) => rewardStatus(r, now) === "available");
  const history = redemptions.filter((r) => rewardStatus(r, now) !== "available");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Link href={`/businesses/${business.slug}`} className="text-sm text-ink-soft hover:text-ink">
          ← {business.name}
        </Link>
        <h1 className="font-display text-2xl font-semibold text-ink">Rewards</h1>
      </div>

      <section className="flex flex-col gap-4">
        {available.length === 0 ? (
          <p className="text-ink-soft">
            Nothing ready to redeem yet — keep earning stamps or points to unlock a reward.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {available.map((reward) => (
              <li key={reward.id}>
                <RewardCard
                  reward={{
                    id: reward.id,
                    rewardText: reward.rewardText,
                    expiresAt: reward.expiresAt?.toISOString() ?? null,
                  }}
                  businessName={business.name}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {history.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold text-ink">History</h2>
          <ul className="flex flex-col divide-y divide-line border border-line bg-surface">
            {history.map((reward) => (
              <li key={reward.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-ink">{reward.rewardText}</p>
                  <p className="text-ink-soft">
                    {rewardStatus(reward, now) === "redeemed"
                      ? `Redeemed ${reward.redeemedAt!.toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : "Expired"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
