-- AlterTable
ALTER TABLE "LoyaltyBalance" ADD COLUMN     "stampRewardsUnlocked" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "LoyaltyScheme" ADD COLUMN     "rewardExpiryDays" INTEGER;

-- CreateTable
CREATE TABLE "RewardRedemption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "rewardTierId" TEXT,
    "rewardText" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),

    CONSTRAINT "RewardRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RewardRedemption_userId_businessId_idx" ON "RewardRedemption"("userId", "businessId");

-- CreateIndex
CREATE INDEX "RewardRedemption_schemeId_idx" ON "RewardRedemption"("schemeId");

-- AddForeignKey
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "LoyaltyScheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardRedemption" ADD CONSTRAINT "RewardRedemption_rewardTierId_fkey" FOREIGN KEY ("rewardTierId") REFERENCES "RewardTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
