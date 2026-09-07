"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm({
  callbackUrl,
  registerHref,
}: {
  callbackUrl: string;
  registerHref?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("That email and password don't match.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-ink-soft">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-stamp"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-ink-soft">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-stamp"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-sm bg-stamp px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-stamp/90 disabled:opacity-50"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
      {registerHref && (
        <p className="text-center text-sm text-ink-soft">
          No account?{" "}
          <a href={registerHref} className="font-medium text-ink underline">
            Register
          </a>
        </p>
      )}
    </form>
  );
}
