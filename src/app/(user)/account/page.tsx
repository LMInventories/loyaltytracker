import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/shared/ChangePasswordForm";
import { PostcodeForm } from "@/components/shared/PostcodeForm";

export default async function AccountPage() {
  const session = await auth();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { postcode: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-12">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Account</h1>
        <p className="mt-1 text-ink-soft">{session!.user.email}</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium text-ink">Your postcode</h2>
        <PostcodeForm currentPostcode={user.postcode} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium text-ink">Change password</h2>
        <ChangePasswordForm />
      </section>
    </main>
  );
}
