import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Resend } from "resend";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const FROM = process.env.EMAIL_FROM ?? "Local Loyalty <notifications@localloyalty.uk>";

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is not set — aborting.");
  process.exit(1);
}
const resend = new Resend(process.env.RESEND_API_KEY);

const REMINDER_WINDOW_DAYS = 3;

function expiringRewardEmailHtml(businessName: string, rewardText: string, expiresAt: Date) {
  return `<div style="font-family: sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto;">
    <div style="background-color: #022f5a; padding: 20px; text-align: center;">
      <span style="color: #ffffff; font-size: 18px; font-weight: 700;">Local Loyalty</span>
    </div>
    <div style="padding: 24px 20px;">
      <p>Your reward at <strong>${businessName}</strong> expires soon:</p>
      <p style="font-size: 18px; font-weight: 700;">${rewardText}</p>
      <p>Expires ${expiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} — don't miss it.</p>
      <p><a href="https://app.localloyalty.uk/me">View your rewards →</a></p>
    </div>
  </div>`;
}

async function main() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const candidates = await prisma.rewardRedemption.findMany({
    where: {
      redeemedAt: null,
      expiryReminderSentAt: null,
      expiresAt: { gt: now, lte: windowEnd },
    },
    include: { user: true, business: true },
  });

  console.log(`Found ${candidates.length} reward(s) expiring within ${REMINDER_WINDOW_DAYS} days.`);

  let sent = 0;
  let skipped = 0;

  for (const reward of candidates) {
    if (reward.user.emailNotificationsEnabled) {
      try {
        await resend.emails.send({
          from: FROM,
          to: reward.user.email,
          subject: `Your reward at ${reward.business.name} expires soon`,
          html: expiringRewardEmailHtml(reward.business.name, reward.rewardText, reward.expiresAt!),
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send reminder for reward ${reward.id}`, err);
      }
    } else {
      skipped++;
    }

    // Mark as handled either way, so an opted-out user's reward isn't
    // re-evaluated every day until it actually expires.
    await prisma.rewardRedemption.update({
      where: { id: reward.id },
      data: { expiryReminderSentAt: now },
    });
  }

  console.log(`Sent ${sent} reminder(s), skipped ${skipped} (opted out).`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
