import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { daysAgo } from "@/lib/analytics";
import { GrantRewardForm } from "@/components/admin/GrantRewardForm";

const WINBACK_THRESHOLD_DAYS = Number(process.env.WINBACK_THRESHOLD_DAYS ?? 30);

function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const session = await auth();
  const businessId = session!.user.businessId!;
  const { q, view } = await searchParams;
  const query = q?.trim() ?? "";
  const showLapsedOnly = view === "lapsed";

  const balances = await prisma.loyaltyBalance.findMany({
    where: {
      businessId,
      ...(query
        ? {
            user: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            },
          }
        : {}),
    },
    include: { user: true, scheme: true },
    orderBy: { updatedAt: "desc" },
  });

  const [lastScans, earnedCounts, redeemedCounts, schemes] = await Promise.all([
    prisma.loyaltyTransaction.groupBy({
      by: ["userId"],
      where: { businessId },
      _max: { createdAt: true },
    }),
    prisma.rewardRedemption.groupBy({
      by: ["userId"],
      where: { businessId },
      _count: { _all: true },
    }),
    prisma.rewardRedemption.groupBy({
      by: ["userId"],
      where: { businessId, redeemedAt: { not: null } },
      _count: { _all: true },
    }),
    prisma.loyaltyScheme.findMany({
      where: { businessId, isActive: true },
      include: { rewardTiers: { orderBy: { threshold: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const lastScanByUser = new Map(lastScans.map((r) => [r.userId, r._max.createdAt]));
  const earnedByUser = new Map(earnedCounts.map((r) => [r.userId, r._count._all]));
  const redeemedByUser = new Map(redeemedCounts.map((r) => [r.userId, r._count._all]));

  // Only schemes with an actual reward configured can be granted manually —
  // a POINTS scheme needs at least one tier, a STAMPS scheme needs its
  // single reward text set.
  const grantableSchemes = schemes.filter((scheme) =>
    scheme.type === "POINTS" ? scheme.rewardTiers.length > 0 : Boolean(scheme.stampRewardText),
  );

  // Group balances by customer — one customer can have balances across
  // multiple schemes at this business.
  const customerMap = new Map<
    string,
    { user: (typeof balances)[number]["user"]; balances: (typeof balances)[number][] }
  >();
  for (const balance of balances) {
    const existing = customerMap.get(balance.userId);
    if (existing) {
      existing.balances.push(balance);
    } else {
      customerMap.set(balance.userId, { user: balance.user, balances: [balance] });
    }
  }
  const allCustomers = [...customerMap.values()];

  const cutoff = daysAgo(WINBACK_THRESHOLD_DAYS);
  const customers = showLapsedOnly
    ? allCustomers
        .filter((c) => {
          const lastScan = lastScanByUser.get(c.user.id);
          return !lastScan || lastScan < cutoff;
        })
        .sort((a, b) => {
          const aTime = lastScanByUser.get(a.user.id)?.getTime() ?? 0;
          const bTime = lastScanByUser.get(b.user.id)?.getTime() ?? 0;
          return aTime - bTime;
        })
    : allCustomers;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Customers</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name or email…"
            className="w-full max-w-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-700"
          />
          {showLapsedOnly && <input type="hidden" name="view" value="lapsed" />}
          <button
            type="submit"
            className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Search
          </button>
        </form>

        <Link
          href={{
            pathname: "/admin/customers",
            query: { ...(query ? { q: query } : {}), ...(showLapsedOnly ? {} : { view: "lapsed" }) },
          }}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300 underline hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {showLapsedOnly
            ? "Show all customers"
            : `Show customers lapsed ${WINBACK_THRESHOLD_DAYS}+ days`}
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {query
            ? `No customers match "${query}".`
            : showLapsedOnly
              ? `No customers have gone ${WINBACK_THRESHOLD_DAYS}+ days without a scan.`
              : "No customers yet."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {customers.map(({ user, balances: userBalances }) => {
            const lastScan = lastScanByUser.get(user.id);
            const earned = earnedByUser.get(user.id) ?? 0;
            const redeemed = redeemedByUser.get(user.id) ?? 0;

            return (
              <li key={user.id} className="flex flex-col gap-1 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{user.name ?? user.email}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {!lastScan
                      ? "No scans yet"
                      : showLapsedOnly
                        ? `${daysSince(lastScan)} days since last scan`
                        : `Last scan ${lastScan.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}`}
                  </p>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400">{user.email}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-zinc-700 dark:text-zinc-300">
                  {userBalances.map((balance) => (
                    <span key={balance.id}>
                      {balance.scheme.name}:{" "}
                      {balance.scheme.type === "STAMPS"
                        ? `${balance.stamps} stamps`
                        : `${balance.points} pts`}
                    </span>
                  ))}
                  <span>
                    {earned} reward{earned === 1 ? "" : "s"} earned, {redeemed} redeemed
                  </span>
                </div>
                <div className="mt-1">
                  <GrantRewardForm customerId={user.id} schemes={grantableSchemes} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
