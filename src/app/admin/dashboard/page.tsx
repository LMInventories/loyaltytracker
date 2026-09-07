import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await auth();
  const business = session?.user.businessId
    ? await prisma.business.findUnique({ where: { id: session.user.businessId } })
    : null;

  return (
    <main className="flex flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900">
        {business?.name ?? "Dashboard"}
      </h1>
      <p className="max-w-md text-zinc-600">
        Scheme and offer management land here in a later milestone.
      </p>
      <Link
        href="/admin/qr"
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Show QR code to a customer
      </Link>
    </main>
  );
}
