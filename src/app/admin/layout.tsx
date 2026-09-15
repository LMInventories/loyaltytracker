import Image from "next/image";

import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import logo from "@/assets/logo.png";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-md bg-white p-1 shadow-sm">
              <Image src={logo} alt="Local Loyalty" className="h-7 w-auto" priority />
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Admin</span>
          </div>
          {session?.user && <AdminNav />}
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
