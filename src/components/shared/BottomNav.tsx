"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home" },
  { href: "/me", label: "My cards" },
  { href: "/account", label: "Account" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-4xl">
        {ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "flex-1 border-t-2 border-stamp py-3 text-center text-sm font-medium text-stamp"
                  : "flex-1 border-t-2 border-transparent py-3 text-center text-sm text-ink-soft hover:text-ink"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
