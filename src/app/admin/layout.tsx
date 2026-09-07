import Image from "next/image";

import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-sm font-semibold text-zinc-900">Local Loyalty Admin</span>
          </div>
          {session?.user && <AdminNav />}
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
