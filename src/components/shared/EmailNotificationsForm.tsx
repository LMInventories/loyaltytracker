"use client";

import { useState } from "react";

export function EmailNotificationsForm({ currentValue }: { currentValue: boolean }) {
  const [enabled, setEnabled] = useState(currentValue);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    setEnabled(next);
    setError(null);
    setSaved(false);
    setIsSaving(true);

    const res = await fetch("/api/account/email-notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });

    setIsSaving(false);

    if (!res.ok) {
      setEnabled(!next);
      setError("Couldn't save that. Try again.");
      return;
    }

    setSaved(true);
  };

  return (
    <div className="flex max-w-sm flex-col gap-2">
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={enabled} onChange={handleChange} disabled={isSaving} />
        Email me about rewards I earn and unlock
      </label>
      <p className="text-xs text-ink-soft">
        Covers your welcome email and reward alerts — you can turn this off any time.
      </p>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {saved && !error && <p className="text-sm text-green-700">Saved.</p>}
    </div>
  );
}
