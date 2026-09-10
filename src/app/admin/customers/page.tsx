import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GrantRewardForm } from "@/components/admin/GrantRewardForm";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  const businessId = session!.user.businessId!;
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

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
  const customers = [...customerMap.values()];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900">Customers</h1>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by name or email…"
          className="w-full max-w-sm rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
        />
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Search
        </button>
      </form>

      {customers.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {query ? `No customers match "${query}".` : "No customers yet."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white">
          {customers.map(({ user, balances: userBalances }) => {
            const lastScan = lastScanByUser.get(user.id);
            const earned = earnedByUser.get(user.id) ?? 0;
            const redeemed = redeemedByUser.get(user.id) ?? 0;

            return (
              <li key={user.id} className="flex flex-col gap-1 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-zinc-900">{user.name ?? user.email}</p>
                  <p className="text-zinc-500">
                    {lastScan
                      ? `Last scan ${lastScan.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : "No scans yet"}
                  </p>
                </div>
                <p className="text-zinc-500">{user.email}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-zinc-700">
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
