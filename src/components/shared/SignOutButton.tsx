"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-ink-soft underline decoration-line underline-offset-4 hover:text-ink"
    >
      Sign out
    </button>
  );
}
