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
        Scheme, offer, and QR management land here in later milestones. This
        page confirms the admin login and route guard are working end to end.
      </p>
    </main>
  );
}
