import { SiteHeader } from "@/components/shared/SiteHeader";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
