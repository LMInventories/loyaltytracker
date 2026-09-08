"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function CategorySelect({ value, categories }: { value: string; categories: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("category", e.target.value);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      aria-label="Filter by category"
      className="rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-stamp focus:ring-2 focus:ring-stamp/40"
    >
      <option value="">All categories</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}
