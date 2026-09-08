/**
 * Looks up a UK postcode via postcodes.io (free, no API key, no rate-limit
 * key required at this volume). Returns null for an invalid/unrecognised
 * postcode or if the lookup fails — callers should treat that as "couldn't
 * verify this postcode" rather than a hard error.
 */
export async function geocodePostcode(
  postcode: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const normalized = postcode.trim().toUpperCase();
  if (!normalized) return null;

  try {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`,
    );

    if (!res.ok) return null;

    const body = await res.json();
    if (body.status !== 200 || !body.result) return null;

    return { latitude: body.result.latitude, longitude: body.result.longitude };
  } catch {
    return null;
  }
}
