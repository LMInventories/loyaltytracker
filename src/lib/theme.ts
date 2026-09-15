export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme-preference";
const THEME_COLOR_LIGHT = "#022f5a";
const THEME_COLOR_DARK = "#0a1522";

export function getStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

export function setStoredPreference(pref: ThemePreference) {
  localStorage.setItem(THEME_STORAGE_KEY, pref);
}

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

// Also updates the <meta name="theme-color"> tag Next renders from
// viewport.themeColor — that static value can't react to a manual
// light/dark override, so this is the only thing keeping it in sync.
export function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute("data-theme", resolved);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", resolved === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
}
