"use client";

import { useEffect, useState } from "react";

// Converts the VAPID public key (base64url) into the Uint8Array shape
// pushManager.subscribe's applicationServerKey expects.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const bytes = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }
  return bytes;
}

export function PushNotificationsForm({
  winbackNotificationsEnabled,
}: {
  winbackNotificationsEnabled: boolean;
}) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [winbackEnabled, setWinbackEnabled] = useState(winbackNotificationsEnabled);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hasSupport = "serviceWorker" in navigator && "PushManager" in window;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(hasSupport);
    if (!hasSupport) {
      setIsLoading(false);
      return;
    }

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setSubscribed(subscription !== null))
      .catch(() => setSubscribed(false))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    setError(null);
    setIsSaving(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (next) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) throw new Error("Push notifications aren't configured yet.");

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          throw new Error("You'll need to allow notifications in your browser to turn this on.");
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        const res = await fetch("/api/account/push-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        });
        if (!res.ok) throw new Error("Couldn't save that. Try again.");

        setSubscribed(true);
      } else {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await fetch("/api/account/push-subscription", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
          await subscription.unsubscribe();
        }
        setSubscribed(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWinbackToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    setWinbackEnabled(next);
    setError(null);

    const res = await fetch("/api/account/winback-notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });

    if (!res.ok) {
      setWinbackEnabled(!next);
      setError("Couldn't save that. Try again.");
    }
  };

  if (!supported) {
    return (
      <p className="text-sm text-ink-soft">
        Push notifications aren&apos;t supported in this browser.
      </p>
    );
  }

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={subscribed}
          onChange={handleToggle}
          disabled={isLoading || isSaving}
        />
        Notify me when I earn a reward or a business posts a new offer
      </label>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={winbackEnabled}
          onChange={handleWinbackToggle}
          disabled={isLoading || !subscribed}
        />
        Remind me if I haven&apos;t visited in a while
      </label>
      <p className="text-xs text-ink-soft">Requires notifications to be turned on above.</p>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
