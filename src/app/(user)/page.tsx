import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { BusinessLogo } from "@/components/shared/BusinessLogo";
import { MapPinIcon } from "@/components/shared/MapPinIcon";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

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
    },
    include: {
      schemes: { where: { isActive: true }, select: { id: true, name: true } },
      offers: { where: { isActive: true }, select: { id: true, title: true } },
    },
    orderBy: { name: "asc" },
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

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by name or category…"
          className="w-full max-w-sm rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-stamp focus:ring-2 focus:ring-stamp/40"
        />
        <button
          type="submit"
          className="rounded-sm border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-stamp"
        >
          Search
        </button>
      </form>

      {businesses.length === 0 ? (
        <p className="text-ink-soft">
          {query
            ? `No businesses match "${query}".`
            : "No businesses have joined the scheme yet."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {businesses.map((business) => (
            <li key={business.id}>
              <Link
                href={`/businesses/${business.slug}`}
                className="group flex h-full flex-col gap-3 border border-line bg-surface p-5 transition-colors hover:border-stamp"
              >
                <div className="flex items-center gap-3">
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
                  <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                    <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                    {business.address}
                  </p>
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
