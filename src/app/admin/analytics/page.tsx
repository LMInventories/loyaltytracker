import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  daysAgo,
  newVsReturningCustomers,
  redemptionCounts,
  scanCounts,
  topSchemesByScans,
} from "@/lib/analytics";

export default async function AdminAnalyticsPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;

  const [
    distinctCustomers,
    scans,
    redemptions,
    { newCustomers, returning },
    activeOffers,
    offersThisMonth,
    topSchemeGroups,
  ] = await Promise.all([
    prisma.loyaltyBalance.findMany({
      where: { businessId },
      distinct: ["userId"],
      select: { userId: true },
    }),
    scanCounts({ businessId }),
    redemptionCounts({ businessId }),
    newVsReturningCustomers(businessId, 30),
    prisma.specialOffer.count({ where: { businessId, isActive: true } }),
    prisma.specialOffer.count({
      where: { businessId, createdAt: { gte: daysAgo(30) } },
    }),
    topSchemesByScans({ where: { businessId }, days: 7, take: 10 }),
  ]);

  const topSchemes = await prisma.loyaltyScheme.findMany({
    where: { id: { in: topSchemeGroups.map((g) => g.schemeId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(topSchemes.map((s) => [s.id, s.name]));

  const stats = [
    { label: "Total customers", value: distinctCustomers.length },
    { label: "Scans (7d)", value: scans.d7 },
    { label: "Scans (30d)", value: scans.d30 },
    { label: "Redemptions (7d)", value: redemptions.d7 },
    { label: "Redemptions (30d)", value: redemptions.d30 },
    { label: "New customers (30d)", value: newCustomers },
    { label: "Returning customers (30d)", value: returning },
    { label: "Active offers", value: activeOffers },
    { label: "Offers created (30d)", value: offersThisMonth },
  ];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900">Analytics</h1>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-zinc-200 bg-white px-4 py-3">
            <dt className="text-sm text-zinc-500">{stat.label}</dt>
            <dd className="text-2xl font-semibold text-zinc-900">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-zinc-900">Top schemes this week</h2>
        {topSchemeGroups.length === 0 ? (
          <p className="text-sm text-zinc-500">No scans in the last 7 days.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white">
            {topSchemeGroups.map((group) => (
              <li
                key={group.schemeId}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="text-zinc-900">
                  {nameById.get(group.schemeId) ?? "Unknown scheme"}
                </span>
                <span className="text-zinc-500">{group._count._all} scans</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
