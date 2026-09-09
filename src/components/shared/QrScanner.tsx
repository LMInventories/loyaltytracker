"use client";

import { Scanner } from "@yudiel/react-qr-scanner";

export function QrScanner({
  onScan,
  paused = false,
}: {
  onScan: (code: string) => void;
  paused?: boolean;
}) {
  const handleScan = (codes: { rawValue: string }[]) => {
    const code = codes[0]?.rawValue;
    if (!code || paused) return;
    onScan(code);
  };

  return (
    <div className="overflow-hidden border border-line">
      <Scanner onScan={handleScan} formats={["qr_code"]} paused={paused} />
    </div>
  );
}
