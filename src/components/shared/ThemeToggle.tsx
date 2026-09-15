"use client";

import { useEffect, useState } from "react";

import {
  applyTheme,
  getStoredPreference,
  resolveTheme,
  setStoredPreference,
  type ThemePreference,
} from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Follow system" },
];

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    // Corrects from the server-safe "system" default to the real stored
    // value — client-only, so it can't cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreference(getStoredPreference());
  }, []);

  useEffect(() => {
    applyTheme(resolveTheme(preference));
    if (preference !== "system") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme(resolveTheme("system"));
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [preference]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as ThemePreference;
    setStoredPreference(next);
    setPreference(next);
  };

  return (
    <select
      value={preference}
      onChange={handleChange}
      aria-label="Theme"
      className="rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-stamp focus:ring-2 focus:ring-stamp/40"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
