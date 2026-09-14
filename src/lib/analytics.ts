import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/** Scan counts over the last 7 and 30 days, optionally scoped (e.g. to one business). */
export async function scanCounts(where: Prisma.LoyaltyTransactionWhereInput = {}) {
  const [d7, d30] = await Promise.all([
    prisma.loyaltyTransaction.count({ where: { ...where, createdAt: { gte: daysAgo(7) } } }),
    prisma.loyaltyTransaction.count({ where: { ...where, createdAt: { gte: daysAgo(30) } } }),
  ]);
  return { d7, d30 };
}

/** Reward redemption counts over the last 7 and 30 days, optionally scoped. */
export async function redemptionCounts(where: Prisma.RewardRedemptionWhereInput = {}) {
  const [d7, d30] = await Promise.all([
    prisma.rewardRedemption.count({ where: { ...where, redeemedAt: { gte: daysAgo(7) } } }),
    prisma.rewardRedemption.count({ where: { ...where, redeemedAt: { gte: daysAgo(30) } } }),
  ]);
  return { d7, d30 };
}

/** The businesses with the most scans in the last `days`, optionally pre-scoped. */
export async function topBusinessesByScans(options: {
  where?: Prisma.LoyaltyTransactionWhereInput;
  days: number;
  take: number;
}) {
  return prisma.loyaltyTransaction.groupBy({
    by: ["businessId"],
    where: { ...options.where, createdAt: { gte: daysAgo(options.days) } },
    _count: { _all: true },
    orderBy: { _count: { businessId: "desc" } },
    take: options.take,
  });
}

/** The schemes with the most scans in the last `days`, optionally pre-scoped. */
export async function topSchemesByScans(options: {
  where?: Prisma.LoyaltyTransactionWhereInput;
  days: number;
  take: number;
}) {
  return prisma.loyaltyTransaction.groupBy({
    by: ["schemeId"],
    where: { ...options.where, createdAt: { gte: daysAgo(options.days) } },
    _count: { _all: true },
    orderBy: { _count: { schemeId: "desc" } },
    take: options.take,
  });
}

/**
 * Splits the distinct customers who scanned at a business in the last `days`
 * into new (no scan before that window) vs. returning (had scanned before).
 */
export async function newVsReturningCustomers(businessId: string, days: number) {
  const periodStart = daysAgo(days);
  const [periodUsers, priorUsers] = await Promise.all([
    prisma.loyaltyTransaction.findMany({
      where: { businessId, createdAt: { gte: periodStart } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.loyaltyTransaction.findMany({
      where: { businessId, createdAt: { lt: periodStart } },
      distinct: ["userId"],
      select: { userId: true },
    }),
  ]);

  const priorUserIds = new Set(priorUsers.map((u) => u.userId));
  const returning = periodUsers.filter((u) => priorUserIds.has(u.userId)).length;

  return { newCustomers: periodUsers.length - returning, returning };
}
