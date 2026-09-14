import webpush from "web-push";

import { prisma } from "@/lib/prisma";

// Configured lazily, not at module scope — mirrors src/lib/email.ts so a
// missing VAPID config can't crash `next build` or every route that imports
// this file before the keys are set.
let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

type PushPayload = { title: string; body: string; url: string };

type Subscription = { endpoint: string; p256dh: string; auth: string };

/**
 * Sends unconditionally to one subscription. Never throws: a failed send (or
 * a not-yet-configured VAPID key) is logged and swallowed. A dead endpoint
 * (410 Gone, or 404) means the browser dropped the subscription — delete it
 * so we stop trying.
 */
export async function sendPush(subscription: Subscription, payload: PushPayload) {
  if (!ensureConfigured()) {
    console.warn("VAPID keys not set — skipping push send", { title: payload.title });
    return;
  }
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
    );
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: subscription.endpoint } });
      return;
    }
    console.error("Failed to send push notification", { title: payload.title, err });
  }
}

/**
 * Fans out to every subscription a user has. Push consent has no separate
 * enabled flag — the existence of a PushSubscription row IS the opt-in.
 */
export async function sendPushIfSubscribed(userId: string, payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
    select: { endpoint: true, p256dh: true, auth: true },
  });
  await Promise.all(subscriptions.map((subscription) => sendPush(subscription, payload)));
}

export function rewardUnlockedPushPayload(businessName: string, rewardText: string): PushPayload {
  return {
    title: `You've unlocked a reward at ${businessName}`,
    body: rewardText,
    url: "/me",
  };
}

export function offerLivePushPayload(businessName: string, offerTitle: string): PushPayload {
  return {
    title: `New offer at ${businessName}`,
    body: offerTitle,
    url: "/",
  };
}

export function winBackPushPayload(businessName: string): PushPayload {
  return {
    title: `We miss you at ${businessName}`,
    body: "It's been a while — come back and keep your loyalty card going.",
    url: "/me",
  };
}
