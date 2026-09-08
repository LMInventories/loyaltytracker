"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Scheme = { id: string; name: string; type: "POINTS" | "STAMPS" };
type Token = { id: string; code: string; expiresAt: string };

const REDEMPTION_POLL_MS = 3_000;

export function QrGenerator({ schemes }: { schemes: Scheme[] }) {
  const [schemeId, setSchemeId] = useState(schemes[0].id);
  const [token, setToken] = useState<Token | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const active = useRef(false);

  const generate = useCallback(async (id: string) => {
    setIsGenerating(true);
    setError(null);

    const res = await fetch("/api/admin/qr-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schemeId: id }),
    });

    setIsGenerating(false);

    if (!res.ok) {
      setError("Couldn't generate a code. Try again.");
      setToken(null);
      return;
    }

    const data = await res.json();
    setToken(data);
  }, []);

  useEffect(() => {
    active.current = true;
    // Fetching the first code on mount/scheme change, not subscribing to
    // an external store, so the state updates here are intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generate(schemeId);
    return () => {
      active.current = false;
    };
  }, [schemeId, generate]);

  useEffect(() => {
    if (!token) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((new Date(token.expiresAt).getTime() - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);

      if (remaining === 0 && active.current) {
        generate(schemeId);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [token, schemeId, generate]);

  // Polls for redemption so the display swaps to a fresh code the moment a
  // customer scans it, rather than waiting out the rest of the TTL — the
  // TTL above is just a safety net for codes nobody scans.
  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const tokenId = token.id;

    const poll = async () => {
      const res = await fetch(`/api/admin/qr-token/${tokenId}/status`);
      if (cancelled || !res.ok) return;

      const data = await res.json();
      if (data.redeemed && active.current) {
        generate(schemeId);
      }
    };

    const interval = setInterval(poll, REDEMPTION_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token, schemeId, generate]);

  return (
    <div className="flex flex-col gap-6">
      {schemes.length > 1 && (
        <div className="flex flex-col gap-1">
          <label htmlFor="scheme" className="text-sm font-medium text-zinc-700">
            Scheme
          </label>
          <select
            id="scheme"
            value={schemeId}
            onChange={(e) => setSchemeId(e.target.value)}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {schemes.map((scheme) => (
              <option key={scheme.id} value={scheme.id}>
                {scheme.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col items-center gap-4 rounded-md border border-zinc-200 bg-white p-8">
        {token ? (
          <>
            <QRCodeSVG value={token.code} size={220} />
            <p className="text-sm text-zinc-500">
              {isGenerating ? "Refreshing…" : `Expires in ${secondsLeft}s`}
            </p>
          </>
        ) : (
          <p className="text-sm text-zinc-500">
            {isGenerating ? "Generating…" : "No active code"}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <p className="text-center text-sm text-zinc-500">
        Have the customer open Local Loyalty and scan this from the business page.
        A new code is generated automatically before this one expires.
      </p>
    </div>
  );
}
