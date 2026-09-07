import { LoginForm } from "@/components/shared/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const registerHref = callbackUrl
    ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/register";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-ink">Sign in</h1>
      <LoginForm callbackUrl={callbackUrl ?? "/"} registerHref={registerHref} />
    </main>
  );
}
