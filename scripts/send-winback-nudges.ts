import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import webpush from "web-push";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const THRESHOLD_DAYS = Number(process.env.WINBACK_THRESHOLD_DAYS ?? 30);

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
  console.error("VAPID keys are not set — aborting.");
  process.exit(1);
}
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

function winBackPayload(businessName: string) {
  return JSON.stringify({
    title: `We miss you at ${businessName}`,
    body: "It's been a while — come back and keep your loyalty card going.",
    url: "/me",
  });
}

async function main() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - THRESHOLD_DAYS * 24 * 60 * 60 * 1000);

  const businesses = await prisma.business.findMany({ where: { isActive: true } });

  let nudged = 0;
  let skipped = 0;

  for (const business of businesses) {
    const [balances, lastScans] = await Promise.all([
      prisma.loyaltyBalance.findMany({
        where: { businessId: business.id },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.loyaltyTransaction.groupBy({
        by: ["userId"],
        where: { businessId: business.id },
        _max: { createdAt: true },
      }),
    ]);

    const lastScanByUser = new Map(lastScans.map((r) => [r.userId, r._max.createdAt]));

    const lapsedUserIds = balances
      .map((b) => b.userId)
      .filter((userId) => {
        const lastScan = lastScanByUser.get(userId);
        return !lastScan || lastScan < cutoff;
      });

    if (lapsedUserIds.length === 0) continue;

    const [users, recentNudges] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: lapsedUserIds }, winbackNotificationsEnabled: true },
        include: { pushSubscriptions: true },
      }),
      prisma.winbackNudge.findMany({
        where: { businessId: business.id, userId: { in: lapsedUserIds }, sentAt: { gt: cutoff } },
      }),
    ]);

    const recentlyNudgedUserIds = new Set(recentNudges.map((n) => n.userId));
    const payload = winBackPayload(business.name);

    for (const user of users) {
      if (recentlyNudgedUserIds.has(user.id) || user.pushSubscriptions.length === 0) {
        skipped++;
        continue;
      }

      for (const subscription of user.pushSubscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth },
            },
            payload,
          );
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { id: subscription.id } });
          } else {
            console.error(`Failed to send win-back push to user ${user.id}`, err);
          }
        }
      }

      await prisma.winbackNudge.upsert({
        where: { userId_businessId: { userId: user.id, businessId: business.id } },
        create: { userId: user.id, businessId: business.id, sentAt: now },
        update: { sentAt: now },
      });
      nudged++;
    }
  }

  console.log(`Nudged ${nudged} lapsed customer(s), skipped ${skipped} (already nudged or not subscribed).`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
