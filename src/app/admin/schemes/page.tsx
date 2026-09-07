import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminSchemesPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;

  const schemes = await prisma.loyaltyScheme.findMany({
    where: { businessId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Loyalty schemes</h1>
        <Link
          href="/admin/schemes/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          New scheme
        </Link>
      </div>

      {schemes.length === 0 ? (
        <p className="text-zinc-600">
          You don&apos;t have any schemes yet. Create one so customers have
          something to earn toward.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {schemes.map((scheme) => (
            <li key={scheme.id}>
              <Link
                href={`/admin/schemes/${scheme.id}`}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3 hover:border-zinc-400"
              >
                <div>
                  <p className="font-medium text-zinc-900">{scheme.name}</p>
                  <p className="text-sm text-zinc-500">
                    {scheme.type === "POINTS" ? "Points" : "Stamps"}
                    {!scheme.isActive && " — inactive"}
                  </p>
                </div>
                <span className="text-sm text-zinc-400">Edit →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
