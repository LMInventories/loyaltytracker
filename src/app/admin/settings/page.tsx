import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusinessSettingsForm } from "@/components/admin/BusinessSettingsForm";

export default async function AdminSettingsPage() {
  const session = await auth();
  const businessId = session!.user.businessId!;

  const business = await prisma.business.findUniqueOrThrow({ where: { id: businessId } });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900">Business settings</h1>
      <BusinessSettingsForm
        business={{
          name: business.name,
          slug: business.slug,
          description: business.description,
          logoUrl: business.logoUrl,
          address: business.address,
          postcode: business.postcode,
          category: business.category,
        }}
      />
    </main>
  );
}
