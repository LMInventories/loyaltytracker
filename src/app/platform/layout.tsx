import Link from "next/link";

import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/shared/SignOutButton";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">Local Loyalty Platform</span>
          {session?.user && (
            <div className="flex items-center gap-4">
              <Link href="/platform/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
                Businesses
              </Link>
              <Link href="/platform/analytics" className="text-sm text-zinc-600 hover:text-zinc-900">
                Analytics
              </Link>
              <Link href="/platform/settings" className="text-sm text-zinc-600 hover:text-zinc-900">
                Settings
              </Link>
              <SignOutButton />
            </div>
          )}
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
