-- AlterTable
ALTER TABLE "RewardRedemption" ADD COLUMN     "expiryReminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "RewardRedemption_expiresAt_expiryReminderSentAt_idx" ON "RewardRedemption"("expiresAt", "expiryReminderSentAt");
