import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QrGenerator } from "@/components/admin/QrGenerator";

export default async function AdminQrPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;

  const schemes = await prisma.loyaltyScheme.findMany({
    where: { businessId, isActive: true },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900">Scan to earn</h1>
      {schemes.length === 0 ? (
        <p className="text-zinc-600">
          You don&apos;t have any active loyalty schemes yet. Create one before
          generating codes for customers to scan.
        </p>
      ) : (
        <QrGenerator schemes={schemes} />
      )}
    </main>
  );
}
