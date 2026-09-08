import Image from "next/image";

import { auth } from "@/lib/auth";
import { PlatformNav } from "@/components/platform/PlatformNav";
import logo from "@/assets/logo.png";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="Local Loyalty" className="h-7 w-auto" priority />
            <span className="text-sm font-semibold text-zinc-900">Platform</span>
          </div>
          {session?.user && <PlatformNav />}
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
