import { Resend } from "resend";

import { escapeHtml } from "@/lib/html";
import { prisma } from "@/lib/prisma";

const FROM = process.env.EMAIL_FROM ?? "Local Loyalty <notifications@localloyalty.uk>";

// Constructed lazily, not at module scope — the Resend SDK throws
// immediately if the key is missing, which would otherwise crash `next
// build`/every route that imports this file before RESEND_API_KEY is ever
// configured (e.g. before Resend domain verification is complete).
let resend: Resend | null = null;
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

// Base URL for links and the logo in emails. Emails are read outside our
// origin, so every URL must be absolute.
const APP_URL = process.env.APP_URL ?? "https://app.localloyalty.uk";

type EmailPayload = { subject: string; html: string };

/**
 * Sends unconditionally — callers that should respect a user's notification
 * preference must go through `sendEmailIfOptedIn` instead. Never throws: a
 * failed send (or a not-yet-configured API key) is logged and swallowed so
 * it can't break the caller's flow (a scan/redeem/signup should never fail
 * because an email didn't go out).
 */
export async function sendEmail(to: string, payload: EmailPayload) {
  const client = getResendClient();
  if (!client) {
    console.warn("RESEND_API_KEY not set — skipping email send", { to, subject: payload.subject });
    return;
  }
  try {
    await client.emails.send({ from: FROM, to, subject: payload.subject, html: payload.html });
  } catch (err) {
    console.error("Failed to send email", { to, subject: payload.subject, err });
  }
}

/**
 * Looks up the user's emailNotificationsEnabled flag fresh (never trust a
 * stale session value) and only sends if it's still true.
 */
export async function sendEmailIfOptedIn(userId: string, payload: EmailPayload) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailNotificationsEnabled: true },
  });
  if (!user || !user.emailNotificationsEnabled) return;
  await sendEmail(user.email, payload);
}

function layout(body: string) {
  return `<div style="font-family: sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto;">
    <div style="background-color: #ffffff; padding: 20px; text-align: center; border-bottom: 4px solid #022f5a;">
      <a href="${APP_URL}" style="text-decoration: none;">
        <img src="${APP_URL}/email-logo.png" alt="Local Loyalty" width="200" height="64" style="display: inline-block; border: 0; width: 200px; height: auto; font-size: 18px; font-weight: 700; color: #022f5a;" />
      </a>
    </div>
    <div style="padding: 24px 20px;">${body}</div>
  </div>`;
}

export function welcomeEmailHtml(name: string | null) {
  return layout(`
    <p>Hi${name ? ` ${escapeHtml(name)}` : ""},</p>
    <p>Welcome to Local Loyalty. Scan a QR code at any participating business to start earning points or stamps toward real rewards.</p>
    <p><a href="${APP_URL}">Browse businesses near you →</a></p>
  `);
}

export function rewardUnlockedEmailHtml(
  businessName: string,
  rewardText: string,
  expiresAt: Date | null,
) {
  return layout(`
    <p>You've unlocked a reward at <strong>${escapeHtml(businessName)}</strong>:</p>
    <p style="font-size: 18px; font-weight: 700;">${escapeHtml(rewardText)}</p>
    ${expiresAt ? `<p>Redeem it by ${expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.</p>` : ""}
    <p><a href="${APP_URL}/me">View your rewards →</a></p>
  `);
}

export function expiringRewardEmailHtml(
  businessName: string,
  rewardText: string,
  expiresAt: Date,
) {
  return layout(`
    <p>Your reward at <strong>${escapeHtml(businessName)}</strong> expires soon:</p>
    <p style="font-size: 18px; font-weight: 700;">${escapeHtml(rewardText)}</p>
    <p>Expires ${expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} — don't miss it.</p>
    <p><a href="${APP_URL}/me">View your rewards →</a></p>
  `);
}
