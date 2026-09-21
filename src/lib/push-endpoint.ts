// Hosts of the browser push services. The server POSTs to whatever endpoint a
// subscription carries, so an unrestricted value would be a server-side
// request forgery vector.
const PUSH_HOST_SUFFIXES = [
  "fcm.googleapis.com", // Chrome / Edge / Android
  "push.services.mozilla.com", // Firefox
  "push.apple.com", // Safari / iOS
  "notify.windows.com", // legacy Edge / WNS
];

export function isAllowedPushEndpoint(endpoint: string): boolean {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.port !== "" || url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  return PUSH_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}
