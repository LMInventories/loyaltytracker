// Copies the QR decoder's WebAssembly binary into /public so the scanner loads
// it from our own origin instead of cdn.jsdelivr.net (its default). That keeps
// a third-party CDN out of the trust path and lets the CSP stay `connect-src 'self'`.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// zxing-wasm is pinned by barcode-detector, so this is the exact version the
// scanner bundles. npm normally hoists it; fall back to a nested install.
const candidates = [
  join("node_modules", "zxing-wasm", "dist", "reader", "zxing_reader.wasm"),
  join("node_modules", "barcode-detector", "node_modules", "zxing-wasm", "dist", "reader", "zxing_reader.wasm"),
];
const src = candidates.find((p) => existsSync(p));
if (!src) throw new Error(`zxing_reader.wasm not found in: ${candidates.join(", ")}`);

mkdirSync(join("public", "wasm"), { recursive: true });
copyFileSync(src, join("public", "wasm", "zxing_reader.wasm"));
console.log(`Copied ${src} -> public/wasm/zxing_reader.wasm`);
