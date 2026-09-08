/**
 * A reward is "available" until it's redeemed or its expiry passes — there is
 * no background job flipping a status column, so this is always derived from
 * `redeemedAt`/`expiresAt` at query/render time.
 */
export function availableRewardWhere(now: Date = new Date()) {
  return {
    redeemedAt: null,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

export type RewardStatus = "available" | "redeemed" | "expired";

export function rewardStatus(
  reward: { redeemedAt: Date | null; expiresAt: Date | null },
  now: Date = new Date(),
): RewardStatus {
  if (reward.redeemedAt) return "redeemed";
  if (reward.expiresAt && reward.expiresAt <= now) return "expired";
  return "available";
}

export function expiryLabel(expiresAt: string | Date | null): string {
  if (!expiresAt) return "No expiry";

  const days = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );
  if (days <= 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `Expires in ${days} days`;
}

export function expiresAtFor(rewardExpiryDays: number | null, from: Date = new Date()): Date | null {
  if (!rewardExpiryDays) return null;
  return new Date(from.getTime() + rewardExpiryDays * 24 * 60 * 60 * 1000);
}
