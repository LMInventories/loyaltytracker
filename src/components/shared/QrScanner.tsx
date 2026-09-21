"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { setZXingModuleOverrides } from "barcode-detector/ponyfill";

// The decoder's WebAssembly binary defaults to cdn.jsdelivr.net. Serve our own
// copy (put in /public/wasm by scripts/copy-zxing-wasm.mjs) so scanning has no
// third-party runtime dependency and works under a strict CSP.
if (typeof window !== "undefined") {
  setZXingModuleOverrides({
    locateFile: (path, prefix) => (path.endsWith(".wasm") ? `/wasm/${path}` : prefix + path),
  });
}

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
