import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function sevenDaysAgo() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;

  const [business, activeSchemes, activeOffers, redemptionsThisWeek, recentTransactions] =
    await Promise.all([
      prisma.business.findUnique({ where: { id: businessId } }),
      prisma.loyaltyScheme.count({ where: { businessId, isActive: true } }),
      prisma.specialOffer.count({ where: { businessId, isActive: true } }),
      prisma.loyaltyTransaction.count({
        where: { businessId, createdAt: { gte: sevenDaysAgo() } },
      }),
      prisma.loyaltyTransaction.findMany({
        where: { businessId },
        include: { user: true, scheme: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const stats = [
    { label: "Active schemes", value: activeSchemes },
    { label: "Active offers", value: activeOffers },
    { label: "Scans this week", value: redemptionsThisWeek },
  ];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">{business?.name ?? "Dashboard"}</h1>
        <Link
          href="/admin/qr"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Show QR code to a customer
        </Link>
      </div>

      <dl className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-zinc-200 bg-white px-4 py-3">
            <dt className="text-sm text-zinc-500">{stat.label}</dt>
            <dd className="text-2xl font-semibold text-zinc-900">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-zinc-900">Recent activity</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-zinc-500">No scans yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white">
            {recentTransactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-zinc-900">{tx.user.name ?? tx.user.email}</p>
                  <p className="text-zinc-500">{tx.scheme.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-900">
                    {tx.pointsDelta > 0 && `+${tx.pointsDelta} pts`}
                    {tx.stampsDelta > 0 && `+${tx.stampsDelta} stamp`}
                  </p>
                  <p className="text-zinc-500">
                    {tx.createdAt.toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
