"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";

type Result = {
  business: { name: string; slug: string };
  scheme: { name: string; type: "POINTS" | "STAMPS" };
  balance: { points: number; stamps: number };
  unlockedRewards: string[];
};

export default function ScanPage() {
  const params = useParams<{ slug: string }>();
  const [status, setStatus] = useState<"scanning" | "submitting" | "success" | "error">(
    "scanning",
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const handleScan = async (codes: { rawValue: string }[]) => {
    const code = codes[0]?.rawValue;
    if (!code || status !== "scanning") return;

    setStatus("submitting");

    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const body = await res.json();

    if (!res.ok) {
      setError(body.error ?? "Something went wrong. Try again.");
      setStatus("error");
      return;
    }

    setResult(body);
    setStatus("success");
  };

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-6 py-10">
      <Link href={`/businesses/${params.slug}`} className="text-sm text-ink-soft hover:text-ink">
        ← Back
      </Link>

      {status === "success" && result ? (
        <div className="flex flex-col gap-3 border border-line bg-surface p-6 text-center">
          <p className="font-display text-xl font-semibold text-ink">
            {result.scheme.name} updated
          </p>
          <p className="font-number text-ink">
            {result.scheme.type === "STAMPS"
              ? `${result.balance.stamps} stamps`
              : `${result.balance.points} points`}
          </p>
          {result.unlockedRewards.map((reward) => (
            <p key={reward} className="text-awning">
              ★ Unlocked: {reward}
            </p>
          ))}
          <Link
            href={`/businesses/${result.business.slug}`}
            className="mt-2 text-sm text-ink underline"
          >
            Back to {result.business.name}
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden border border-line">
            <Scanner
              onScan={handleScan}
              formats={["qr_code"]}
              paused={status !== "scanning"}
            />
          </div>
          <p className="text-center text-sm text-ink-soft">
            {status === "submitting"
              ? "Checking code…"
              : "Point your camera at the code on the counter."}
          </p>
          {status === "error" && (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setStatus("scanning");
                  setError(null);
                }}
                className="rounded-sm border border-line px-4 py-2 text-sm text-ink hover:border-stamp"
              >
                Scan again
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
