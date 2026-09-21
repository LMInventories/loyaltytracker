/**
 * Returns `target` only if it's a same-site relative path; otherwise `fallback`.
 * Blocks open redirects such as `https://evil.example`, `//evil.example` and
 * `/\evil.example` (browsers treat backslashes as slashes).
 */
export function safeCallbackUrl(target: string | null | undefined, fallback = "/"): string {
  if (!target) return fallback;
  if (!target.startsWith("/") || target.startsWith("//") || target.includes("\\")) return fallback;
  // Control characters (tabs/newlines) are stripped by URL parsers and can
  // turn "/\t/evil.example" into "//evil.example".
  if (/[\u0000-\u001f\u007f]/.test(target)) return fallback;
  return target;
}
