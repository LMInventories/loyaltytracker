"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "install-banner-dismissed";

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

    if (isStandalone || localStorage.getItem(DISMISSED_KEY)) return;

    if (/iphone|ipad|ipod/i.test(nav.userAgent)) {
      // Checking the browser/OS once on mount, not reacting to a store —
      // there's nothing to subscribe to here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlatform("ios");
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem(DISMISSED_KEY)) return;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setPlatform(null);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
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
            className="rounded-sm bg-stamp px-3 py-1.5 text-xs font-medium text-surface hover:bg-stamp/90"
          >
            Install app
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-ink-soft hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
