const PLACEHOLDER_COLORS = ["#0b2f55", "#12a98d", "#e8583a", "#2d6a8c"];

function colorFor(name: string) {
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLACEHOLDER_COLORS[sum % PLACEHOLDER_COLORS.length];
}

export function BusinessLogo({
  name,
  logoUrl,
  size = 48,
}: {
  name: string;
  logoUrl: string | null;
  size?: number;
}) {
  if (logoUrl) {
    // Admin-entered URL, not one of our own assets, so we can't rely on
    // next/image's remote-pattern allowlist without opening it up broadly.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className="rounded-xl border border-line object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-xl font-display font-bold text-surface"
      style={{
        width: size,
        height: size,
        backgroundColor: colorFor(name),
        fontSize: size * 0.42,
      }}
    >
      {initial}
    </div>
  );
}
