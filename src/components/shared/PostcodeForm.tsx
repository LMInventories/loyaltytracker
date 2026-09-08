"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PostcodeForm({ currentPostcode }: { currentPostcode: string | null }) {
  const router = useRouter();
  const [postcode, setPostcode] = useState(currentPostcode ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const res = await fetch("/api/account/postcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcode }),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Couldn't save your postcode.");
      return;
    }

    setSuccess(true);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="postcode" className="text-sm font-medium text-ink-soft">
          Postcode
        </label>
        <input
          id="postcode"
          required
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="e.g. SW1A 1AA"
          className="w-40 rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-stamp focus:ring-2 focus:ring-stamp/40"
        />
        <p className="text-xs text-ink-soft">
          Used to sort businesses by how close they are to you.
        </p>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {success && <p className="text-sm text-green-700">Postcode saved.</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-sm bg-stamp px-4 py-2 text-sm font-medium text-surface hover:bg-stamp/90 disabled:opacity-50"
      >
        {isSubmitting ? "Saving…" : "Save postcode"}
      </button>
    </form>
  );
}
