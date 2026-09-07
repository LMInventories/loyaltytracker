import Link from "next/link";

import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/shared/SignOutButton";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-ink"
        >
          HPLoyalty
        </Link>
        {session?.user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-soft">
              {session.user.name ?? session.user.email}
            </span>
            <SignOutButton />
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-ink-soft underline decoration-line underline-offset-4 hover:text-ink"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
