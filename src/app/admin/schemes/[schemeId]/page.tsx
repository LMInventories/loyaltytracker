import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SchemeEditForm } from "@/components/admin/SchemeEditForm";

export default async function EditSchemePage({
  params,
}: {
  params: Promise<{ schemeId: string }>;
}) {
  const { schemeId } = await params;
  const session = await auth();
  const businessId = session!.user.businessId!;

  const scheme = await prisma.loyaltyScheme.findUnique({
    where: { id: schemeId },
    include: { rewardTiers: { orderBy: { threshold: "asc" } } },
  });

  if (!scheme || scheme.businessId !== businessId) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900">{scheme.name}</h1>
      <SchemeEditForm
        scheme={scheme}
        tiers={scheme.rewardTiers.map((t) => ({ threshold: t.threshold, rewardText: t.rewardText }))}
      />
    </main>
  );
}
