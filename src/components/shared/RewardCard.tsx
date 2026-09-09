"use client";

import { useState } from "react";

import { QrScanner } from "@/components/shared/QrScanner";
import { SlideToRedeem } from "@/components/shared/SlideToRedeem";
import { expiryLabel } from "@/lib/rewards";

export function RewardCard({
  reward,
  businessName,
}: {
  reward: { id: string; rewardText: string; expiresAt: string | null };
  businessName: string;
}) {
  const [phase, setPhase] = useState<
    "available" | "confirming" | "submitting" | "redeemed" | "error"
  >("available");
  const [error, setError] = useState<string | null>(null);

  const handleScan = (code: string) => {
    setPhase("submitting");
    setError(null);

    fetch(`/api/rewards/${reward.id}/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Couldn't redeem this reward. Try again.");
        }
        setPhase("redeemed");
      })
      .catch((err: Error) => {
        setError(err.message);
        setPhase("error");
      });
  };

  if (phase === "confirming" || phase === "submitting" || phase === "error") {
    return (
      <div className="flex flex-col gap-3 border border-line bg-surface p-5">
        <div>
          <p className="font-medium text-ink">{reward.rewardText}</p>
          <p className="text-sm text-ink-soft">{businessName}</p>
        </div>
        <QrScanner onScan={handleScan} paused={phase !== "confirming"} />
        <p className="text-center text-sm text-ink-soft">
          {phase === "submitting" ? "Checking code…" : "Scan the code on the counter to confirm."}
        </p>
        {phase === "error" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => {
                setPhase("confirming");
                setError(null);
              }}
              className="rounded-sm border border-line px-4 py-2 text-sm text-ink hover:border-stamp"
            >
              Scan again
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === "redeemed") {
    return (
      <div className="flex flex-col items-center gap-2 border border-stamp bg-stamp-soft p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          Show this to staff
        </p>
        <p className="font-display text-xl font-semibold text-ink">{reward.rewardText}</p>
        <p className="text-sm text-ink-soft">{businessName}</p>
        <p className="mt-1 text-sm font-medium text-stamp">✓ Redeemed</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border border-line bg-surface p-5">
      <div>
        <p className="font-medium text-ink">{reward.rewardText}</p>
        <p className="text-sm text-ink-soft">{expiryLabel(reward.expiresAt)}</p>
      </div>
      <SlideToRedeem onConfirm={() => setPhase("confirming")} />
    </div>
  );
}
