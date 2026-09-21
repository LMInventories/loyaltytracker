/**
 * Best-effort client IP for rate limiting. The first `x-forwarded-for` entry
 * is supplied by the client and trivially spoofed, so prefer the header the
 * hosting proxy sets itself (`x-real-ip`), then the LAST forwarded hop (the
 * one appended by our own proxy).
 */
export function getClientIp(request: { headers: Headers }): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const hops = forwardedFor.split(",").map((h) => h.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return "unknown";
}
