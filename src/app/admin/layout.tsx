import Link from "next/link";

import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/shared/SignOutButton";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/schemes", label: "Schemes" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/qr", label: "Scan to earn" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">HPLoyalty Admin</span>
          {session?.user && (
            <nav className="flex items-center gap-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-600 hover:text-zinc-900"
                >
                  {link.label}
                </Link>
              ))}
              <SignOutButton />
            </nav>
          )}
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
