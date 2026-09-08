import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function PlatformDashboardPage() {
  const businesses = await prisma.business.findMany({
    include: { admins: true, schemes: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Businesses</h1>
        <Link
          href="/platform/businesses/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Add business
        </Link>
      </div>

      {businesses.length === 0 ? (
        <p className="text-sm text-zinc-500">No businesses yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 border border-zinc-200 bg-white">
          {businesses.map((business) => (
            <li key={business.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-zinc-900">{business.name}</p>
                <p className="text-zinc-500">/businesses/{business.slug}</p>
              </div>
              <div className="text-right text-zinc-500">
                <p>{business.admins[0]?.email ?? "No admin login"}</p>
                <p>
                  {business.schemes.length} scheme{business.schemes.length === 1 ? "" : "s"} ·{" "}
                  {business.createdAt.toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
