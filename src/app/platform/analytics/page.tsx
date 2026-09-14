import { prisma } from "@/lib/prisma";
import { redemptionCounts, scanCounts, topBusinessesByScans } from "@/lib/analytics";

export default async function PlatformAnalyticsPage() {
  const [totalBusinesses, activeBusinesses, distinctCustomers, scans, redemptions, topBusinessGroups] =
    await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.loyaltyBalance.findMany({ distinct: ["userId"], select: { userId: true } }),
      scanCounts(),
      redemptionCounts(),
      topBusinessesByScans({ days: 7, take: 10 }),
    ]);

  const topBusinesses = await prisma.business.findMany({
    where: { id: { in: topBusinessGroups.map((g) => g.businessId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(topBusinesses.map((b) => [b.id, b.name]));

  const stats = [
    { label: "Total businesses", value: totalBusinesses },
    { label: "Active businesses", value: activeBusinesses },
    { label: "Total customers", value: distinctCustomers.length },
    { label: "Scans (7d)", value: scans.d7 },
    { label: "Scans (30d)", value: scans.d30 },
    { label: "Redemptions (7d)", value: redemptions.d7 },
    { label: "Redemptions (30d)", value: redemptions.d30 },
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
        <h2 className="font-medium text-zinc-900">Most active businesses this week</h2>
        {topBusinessGroups.length === 0 ? (
          <p className="text-sm text-zinc-500">No scans in the last 7 days.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white">
            {topBusinessGroups.map((group) => (
              <li
                key={group.businessId}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="text-zinc-900">
                  {nameById.get(group.businessId) ?? "Unknown business"}
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
