import { auth } from "@/lib/auth";
import { StaffChangePasswordForm } from "@/components/shared/StaffChangePasswordForm";

export default async function PlatformSettingsPage() {
  const session = await auth();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">{session!.user.email}</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium text-zinc-900">Change password</h2>
        <StaffChangePasswordForm />
      </section>
    </main>
  );
}
