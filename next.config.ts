import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// A static (non-nonce) CSP. Next's hydration data and our theme-init script are
// inline, so `script-src` needs 'unsafe-inline'; a nonce-based policy would
// need every page rendered per-request and a proxy on all routes. Even so this
// blocks the highest-value attacks: loading script from another origin,
// framing, <object>/<embed>, base-tag hijacking, cross-origin form posts and
// exfiltration over fetch/XHR/WebSocket.
const csp = [
  "default-src 'self'",
  // 'wasm-unsafe-eval': the QR scanner runs a WebAssembly decoder (self-hosted
  // at /wasm/). React needs 'unsafe-eval' in development only.
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Business logos, offer and reward images are arbitrary https URLs entered
  // by business admins.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
  "media-src 'self' blob:", // camera stream for the scanner
  "worker-src 'self'", // service worker
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  // Google sign-in redirects off-site after our own POST.
  "form-action 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy equivalent of frame-ancestors for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    // The scan page needs the camera; nothing here uses the rest.
    value:
      "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // HSTS only in production: it would pin http://localhost to https in dev.
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Browsers must always revalidate the service worker so a fix (like
        // dropping cached pages) reaches users promptly.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
