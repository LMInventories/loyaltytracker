export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-3">
        <span className="text-sm font-semibold text-zinc-900">
          HPLoyalty Admin
        </span>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
