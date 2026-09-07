const buckets = new Map<string, number[]>();

/**
 * Simple in-memory sliding-window rate limiter. Good enough for a single
 * Railway instance; if this app ever scales to multiple instances, swap
 * this for a shared store (e.g. Postgres or Redis) keyed the same way.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const attempts = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (attempts.length >= limit) {
    buckets.set(key, attempts);
    return true;
  }

  attempts.push(now);
  buckets.set(key, attempts);
  return false;
}
