import { SiteHeader } from "@/components/shared/SiteHeader";
import { BottomNav } from "@/components/shared/BottomNav";
import { InstallBanner } from "@/components/shared/InstallBanner";
import { SiteFooter } from "@/components/shared/SiteFooter";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <InstallBanner />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
