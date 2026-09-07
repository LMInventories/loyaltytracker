import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StampProgress, PointsProgress } from "@/components/shared/LoyaltyProgress";

export default async function MyCardsPage() {
  const session = await auth();

  const balances = await prisma.loyaltyBalance.findMany({
    where: { userId: session!.user.id },
    include: {
      business: true,
      scheme: { include: { rewardTiers: { orderBy: { threshold: "asc" } } } },
    },
    orderBy: [{ business: { name: "asc" } }, { scheme: { name: "asc" } }],
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="font-display text-2xl font-semibold text-ink">My cards</h1>

      {balances.length === 0 ? (
        <p className="text-ink-soft">
          Scan a QR code at a business to start a loyalty card here.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {balances.map((balance) => (
            <li key={balance.id}>
              <Link
                href={`/me/${balance.businessId}`}
                className="flex flex-col gap-3 border border-line bg-surface p-5 hover:border-stamp"
              >
                <div>
                  <p className="text-sm text-ink-soft">{balance.business.name}</p>
                  <h2 className="font-medium text-ink">{balance.scheme.name}</h2>
                </div>
                {balance.scheme.type === "STAMPS" && balance.scheme.stampsRequired ? (
                  <StampProgress
                    total={balance.scheme.stampsRequired}
                    filled={balance.stamps}
                    rewardText={balance.scheme.stampRewardText}
                  />
                ) : (
                  <PointsProgress points={balance.points} tiers={balance.scheme.rewardTiers} />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
