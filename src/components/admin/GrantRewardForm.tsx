"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type GrantableScheme = {
  id: string;
  name: string;
  type: "POINTS" | "STAMPS";
  stampRewardText: string | null;
  rewardTiers: { id: string; rewardText: string; threshold: number }[];
};

export function GrantRewardForm({
  customerId,
  schemes,
}: {
  customerId: string;
  schemes: GrantableScheme[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [schemeId, setSchemeId] = useState(schemes[0]?.id ?? "");
  const [rewardTierId, setRewardTierId] = useState(schemes[0]?.rewardTiers[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (schemes.length === 0) return null;

  const selectedScheme = schemes.find((s) => s.id === schemeId) ?? schemes[0];

  const handleSchemeChange = (id: string) => {
    setSchemeId(id);
    const scheme = schemes.find((s) => s.id === id);
    setRewardTierId(scheme?.rewardTiers[0]?.id ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await fetch("/api/admin/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: customerId,
        schemeId,
        ...(selectedScheme.type === "POINTS" ? { rewardTierId } : {}),
      }),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Couldn't grant the reward. Try again.");
      return;
    }

    setSuccess(true);
    router.refresh();
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-fit text-sm font-medium text-zinc-700 underline hover:text-zinc-900"
      >
        Grant reward
      </button>
    );
  }

  if (success) {
    return <p className="text-sm text-zinc-600">Reward granted — {selectedScheme.name}.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <select
        value={schemeId}
        onChange={(e) => handleSchemeChange(e.target.value)}
        className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500"
      >
        {schemes.map((scheme) => (
          <option key={scheme.id} value={scheme.id}>
            {scheme.name}
          </option>
        ))}
      </select>

      {selectedScheme.type === "POINTS" ? (
        <select
          value={rewardTierId}
          onChange={(e) => setRewardTierId(e.target.value)}
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500"
        >
          {selectedScheme.rewardTiers.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.rewardText}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-sm text-zinc-600">{selectedScheme.stampRewardText}</span>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-zinc-900 px-3 py-1 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isSubmitting ? "Granting…" : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="text-sm text-zinc-500 hover:text-zinc-700"
      >
        Cancel
      </button>

      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
