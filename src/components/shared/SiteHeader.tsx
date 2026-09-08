import Image from "next/image";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/shared/SignOutButton";
import logo from "@/assets/logo.png";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center">
          <Image src={logo} alt="Local Loyalty" className="h-9 w-auto" priority />
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
