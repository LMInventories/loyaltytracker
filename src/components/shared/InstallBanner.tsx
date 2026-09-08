"use client";

import { useEffect, useState } from "react";

// Permanent: only ever set by an actual `appinstalled` event or by detecting
// we're currently running in the installed shell. Never set just because the
// user clicked "Install" — that only opens the browser's own prompt, which
// they might still cancel.
const INSTALLED_KEY = "pwa-installed";
// Session-only: "not now" for this browsing session. Deliberately NOT
// localStorage — there's no reliable way to detect an install that happened
// outside this page, so a permanent dismiss here would risk hiding the
// banner forever from someone who never actually installed.
const SNOOZED_KEY = "install-banner-snoozed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallBanner() {
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;

    if (isStandalone) {
      localStorage.setItem(INSTALLED_KEY, "1");
      return;
    }

    if (localStorage.getItem(INSTALLED_KEY) || sessionStorage.getItem(SNOOZED_KEY)) return;

    if (/iphone|ipad|ipod/i.test(nav.userAgent)) {
      // Checking the browser/OS once on mount, not reacting to a store —
      // there's nothing to subscribe to here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlatform("ios");
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem(INSTALLED_KEY) || sessionStorage.getItem(SNOOZED_KEY)) return;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
    };

    // The one reliable, browser-fired signal that installation actually
    // completed — regardless of whether it was triggered by our button or
    // the browser's own address-bar install icon.
    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "1");
      setPlatform(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const snooze = () => {
    sessionStorage.setItem(SNOOZED_KEY, "1");
    setPlatform(null);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    // Only clears the one-shot prompt object — doesn't hide the banner.
    // If they cancelled, `appinstalled` never fires and the banner stays put;
    // if they accepted, `appinstalled` fires shortly after and hides it.
    setDeferredPrompt(null);
  };

  if (!platform) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-line bg-stamp-soft px-4 py-3 text-sm text-ink">
      <span>
        {platform === "android"
          ? "Install Local Loyalty for quicker access to your cards."
          : "Add Local Loyalty to your Home Screen — tap Share, then “Add to Home Screen”."}
      </span>
      <div className="flex shrink-0 items-center gap-3">
        {platform === "android" && (
          <button
            type="button"
            onClick={install}
            disabled={!deferredPrompt}
            className="rounded-sm bg-stamp px-3 py-1.5 text-xs font-medium text-surface hover:bg-stamp/90 disabled:opacity-50"
          >
            Install app
          </button>
        )}
        <button
          type="button"
          onClick={snooze}
          aria-label="Not now"
          className="text-ink-soft hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
