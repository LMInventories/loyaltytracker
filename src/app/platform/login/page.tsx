import { LoginForm } from "@/components/shared/LoginForm";

export default function PlatformLoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Platform admin sign in</h1>
      <LoginForm callbackUrl="/platform/dashboard" />
    </main>
  );
}
