"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Scheme = {
  id: string;
  name: string;
  type: "POINTS" | "STAMPS";
  isActive: boolean;
  pointsPerScan: number | null;
  stampsRequired: number | null;
  stampRewardText: string | null;
};

type Tier = { threshold: number; rewardText: string };

export function SchemeEditForm({ scheme, tiers: initialTiers }: { scheme: Scheme; tiers: Tier[] }) {
  const router = useRouter();
  const [name, setName] = useState(scheme.name);
  const [isActive, setIsActive] = useState(scheme.isActive);
  const [pointsPerScan, setPointsPerScan] = useState(String(scheme.pointsPerScan ?? ""));
  const [stampsRequired, setStampsRequired] = useState(String(scheme.stampsRequired ?? ""));
  const [stampRewardText, setStampRewardText] = useState(scheme.stampRewardText ?? "");
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);

  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [savingTiers, setSavingTiers] = useState(false);
  const [tiersSaved, setTiersSaved] = useState(false);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDetails(true);
    setDetailsSaved(false);

    const body =
      scheme.type === "POINTS"
        ? { name, isActive, pointsPerScan }
        : { name, isActive, stampsRequired, stampRewardText };

    const res = await fetch(`/api/admin/schemes/${scheme.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSavingDetails(false);
    if (res.ok) {
      setDetailsSaved(true);
      router.refresh();
    }
  };

  const handleSaveTiers = async () => {
    setSavingTiers(true);
    setTiersSaved(false);

    const res = await fetch(`/api/admin/schemes/${scheme.id}/reward-tiers`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tiers }),
    });

    setSavingTiers(false);
    if (res.ok) {
      const { tiers: saved } = await res.json();
      setTiers(saved.map((t: Tier) => ({ threshold: t.threshold, rewardText: t.rewardText })));
      setTiersSaved(true);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <form onSubmit={handleSaveDetails} className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium text-zinc-700">
            Name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
          />
        </div>

        {scheme.type === "POINTS" ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="pointsPerScan" className="text-sm font-medium text-zinc-700">
              Points per scan
            </label>
            <input
              id="pointsPerScan"
              type="number"
              min={1}
              required
              value={pointsPerScan}
              onChange={(e) => setPointsPerScan(e.target.value)}
              className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="stampsRequired" className="text-sm font-medium text-zinc-700">
                Stamps required
              </label>
              <input
                id="stampsRequired"
                type="number"
                min={1}
                required
                value={stampsRequired}
                onChange={(e) => setStampsRequired(e.target.value)}
                className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="stampRewardText" className="text-sm font-medium text-zinc-700">
                Reward
              </label>
              <input
                id="stampRewardText"
                required
                value={stampRewardText}
                onChange={(e) => setStampRewardText(e.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-300"
              />
            </div>
          </>
        )}

        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active (visible to customers)
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={savingDetails}
            className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {savingDetails ? "Saving…" : "Save changes"}
          </button>
          {detailsSaved && <span className="text-sm text-green-700">Saved</span>}
        </div>
      </form>

      {scheme.type === "POINTS" && (
        <div className="flex max-w-md flex-col gap-4">
          <h2 className="font-medium text-zinc-900">Reward tiers</h2>
          <p className="text-sm text-zinc-500">
            Customers unlock a reward the moment their points cross a threshold.
          </p>
          <div className="flex flex-col gap-2">
            {tiers.map((tier, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={tier.threshold}
                  onChange={(e) => {
                    const next = [...tiers];
                    next[i] = { ...next[i], threshold: Number(e.target.value) };
                    setTiers(next);
                  }}
                  className="w-24 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                  placeholder="pts"
                />
                <input
                  value={tier.rewardText}
                  onChange={(e) => {
                    const next = [...tiers];
                    next[i] = { ...next[i], rewardText: e.target.value };
                    setTiers(next);
                  }}
                  className="flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm"
                  placeholder="Reward"
                />
                <button
                  type="button"
                  onClick={() => setTiers(tiers.filter((_, idx) => idx !== i))}
                  className="text-sm text-zinc-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTiers([...tiers, { threshold: 0, rewardText: "" }])}
              className="w-fit text-sm text-zinc-600 underline hover:text-zinc-900"
            >
              + Add tier
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveTiers}
              disabled={savingTiers}
              className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {savingTiers ? "Saving…" : "Save tiers"}
            </button>
            {tiersSaved && <span className="text-sm text-green-700">Saved</span>}
          </div>
        </div>
      )}
    </div>
  );
}
