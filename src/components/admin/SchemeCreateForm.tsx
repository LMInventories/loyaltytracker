"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SchemeCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"POINTS" | "STAMPS">("POINTS");
  const [pointsPerScan, setPointsPerScan] = useState("10");
  const [stampsRequired, setStampsRequired] = useState("10");
  const [stampRewardText, setStampRewardText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const body =
      type === "POINTS"
        ? { name, type, pointsPerScan }
        : { name, type, stampsRequired, stampRewardText };

    const res = await fetch("/api/admin/schemes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      setError("Couldn't create the scheme. Check the fields and try again.");
      return;
    }

    const { scheme } = await res.json();
    router.push(`/admin/schemes/${scheme.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">
          Name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Coffee Stamps"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-zinc-700">Type</legend>
        <div className="flex gap-4 text-sm text-zinc-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={type === "POINTS"}
              onChange={() => setType("POINTS")}
            />
            Points
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={type === "STAMPS"}
              onChange={() => setType("STAMPS")}
            />
            Stamp card
          </label>
        </div>
      </fieldset>

      {type === "POINTS" ? (
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
            className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <p className="text-xs text-zinc-500">
            You can add reward tiers (e.g. 100 pts = free item) after creating
            the scheme.
          </p>
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
              className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
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
              placeholder="e.g. One free coffee"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isSubmitting ? "Creating…" : "Create scheme"}
      </button>
    </form>
  );
}
