export function StampProgress({
  total,
  filled,
  rewardText,
}: {
  total: number;
  filled: number;
  rewardText: string | null;
}) {
  const clampedFilled = Math.min(filled, total);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={
              i < clampedFilled
                ? "flex h-7 w-7 items-center justify-center rounded-full border border-stamp bg-stamp text-xs text-surface"
                : "flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-line text-xs text-ink-soft"
            }
          >
            {i < clampedFilled ? "●" : ""}
          </span>
        ))}
      </div>
      <p className="font-number text-sm text-ink-soft">
        {clampedFilled} / {total} stamps
        {rewardText ? ` — ${rewardText}` : ""}
      </p>
    </div>
  );
}

export function PointsProgress({
  points,
  tiers,
}: {
  points: number;
  tiers: { threshold: number; rewardText: string }[];
}) {
  const nextTier = tiers.find((tier) => tier.threshold > points);
  const target = nextTier?.threshold ?? tiers.at(-1)?.threshold ?? points;
  const pct = target > 0 ? Math.min(100, Math.round((points / target) * 100)) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-stamp-soft">
        <div className="h-full bg-stamp" style={{ width: `${pct}%` }} />
      </div>
      <p className="font-number text-sm text-ink-soft">
        {points} pts
        {nextTier
          ? ` — ${nextTier.threshold - points} to go for ${nextTier.rewardText}`
          : tiers.length > 0
            ? " — top reward unlocked"
            : ""}
      </p>
    </div>
  );
}
