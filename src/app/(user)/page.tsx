import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusinessLogo } from "@/components/shared/BusinessLogo";
import { MapPinIcon } from "@/components/shared/MapPinIcon";
import { SortSelect } from "@/components/shared/SortSelect";
import { CategorySelect } from "@/components/shared/CategorySelect";
import { mapsUrlFor } from "@/lib/maps";
import { activeOfferWhere, availableRewardWhere } from "@/lib/rewards";
import { formatMiles, milesBetween } from "@/lib/distance";

const SORT_VALUES = ["name", "distance", "recent"] as const;
type Sort = (typeof SORT_VALUES)[number];

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>;
}) {
  const { q, sort: sortParam, category: categoryParam } = await searchParams;
  const query = q?.trim() ?? "";
  const sort: Sort = SORT_VALUES.includes(sortParam as Sort) ? (sortParam as Sort) : "name";
  const category = categoryParam?.trim() ?? "";

  const session = await auth();

  const [availableRewardCount, customerLocation, categoryRows] = await Promise.all([
    session?.user
      ? prisma.rewardRedemption.count({
          where: { userId: session.user.id, ...availableRewardWhere() },
        })
      : Promise.resolve(0),
    session?.user
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { latitude: true, longitude: true },
        })
      : Promise.resolve(null),
    prisma.business.findMany({
      where: { isActive: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const categories = categoryRows.map((row) => row.category!).filter(Boolean);

  const hasCustomerLocation =
    customerLocation?.latitude != null && customerLocation?.longitude != null;

  const businesses = await prisma.business.findMany({
    where: {
      isActive: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
    },
    include: {
      schemes: { where: { isActive: true }, select: { id: true, name: true } },
      offers: { where: activeOfferWhere(), select: { id: true, title: true } },
    },
  });

  const businessesWithDistance = businesses.map((business) => ({
    ...business,
    distanceMiles:
      hasCustomerLocation && business.latitude != null && business.longitude != null
        ? milesBetween(
            { latitude: customerLocation!.latitude!, longitude: customerLocation!.longitude! },
            { latitude: business.latitude, longitude: business.longitude },
          )
        : null,
  }));

  const sorted = [...businessesWithDistance].sort((a, b) => {
    if (sort === "recent") return b.createdAt.getTime() - a.createdAt.getTime();
    if (sort === "distance") {
      if (a.distanceMiles === null && b.distanceMiles === null) return a.name.localeCompare(b.name);
      if (a.distanceMiles === null) return 1;
      if (b.distanceMiles === null) return -1;
      return a.distanceMiles - b.distanceMiles;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Local rewards, one stamp at a time.
        </h1>
        <p className="max-w-md text-ink-soft">
          Browse the businesses on the scheme and see what you can earn.
        </p>
      </div>

      {availableRewardCount > 0 && (
        <Link
          href="/me"
          className="flex items-center justify-between border border-stamp bg-stamp-soft px-5 py-4 text-sm font-medium text-ink transition-colors hover:border-stamp/70"
        >
          <span>
            ★ You have {availableRewardCount} reward{availableRewardCount === 1 ? "" : "s"} ready
            to redeem
          </span>
          <span className="text-ink-soft">View →</span>
        </Link>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name or category…"
            className="w-full max-w-sm rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-stamp focus:ring-2 focus:ring-stamp/40"
          />
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="category" value={category} />
          <button
            type="submit"
            className="rounded-sm border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-stamp"
          >
            Search
          </button>
        </form>
        <SortSelect value={sort} />
        <CategorySelect value={category} categories={categories} />
      </div>

      {sort === "distance" && !hasCustomerLocation && (
        <p className="text-sm text-ink-soft">
          <Link href="/account" className="underline">
            Set your postcode
          </Link>{" "}
          to sort by distance — showing A–Z for now.
        </p>
      )}

      {sorted.length === 0 ? (
        <p className="text-ink-soft">
          {query
            ? `No businesses match "${query}".`
            : "No businesses have joined the scheme yet."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {sorted.map((business) => (
            <li
              key={business.id}
              className="group relative flex h-full flex-col gap-3 border border-line bg-surface p-5 transition-colors hover:border-stamp"
            >
              {business.address && (
                <a
                  href={mapsUrlFor(business.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${business.name}'s address in maps`}
                  className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-stamp-soft text-stamp transition-colors hover:bg-stamp hover:text-surface"
                >
                  <MapPinIcon className="h-5 w-5" />
                </a>
              )}
              <Link
                href={`/businesses/${business.slug}`}
                className="absolute inset-0"
                aria-label={business.name}
              />
              <div className="pointer-events-none flex h-full flex-col gap-3">
                <div className="flex items-center gap-3 pr-10">
                  <BusinessLogo name={business.name} logoUrl={business.logoUrl} />
                  <div>
                    {business.category && (
                      <p className="text-sm text-ink-soft">{business.category}</p>
                    )}
                    <h2 className="font-display text-lg font-semibold text-ink group-hover:text-stamp">
                      {business.name}
                    </h2>
                  </div>
                </div>
                {business.address && (
                  <p className="text-sm text-ink-soft">{business.address}</p>
                )}
                {business.distanceMiles !== null && (
                  <p className="text-sm text-ink-soft">{formatMiles(business.distanceMiles)}</p>
                )}
                <div className="mt-auto flex flex-col gap-1 pt-2 text-sm">
                  {business.schemes.map((scheme) => (
                    <span key={scheme.id} className="text-ink">
                      ● {scheme.name}
                    </span>
                  ))}
                  {business.offers.map((offer) => (
                    <span key={offer.id} className="text-awning">
                      ★ {offer.title}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
