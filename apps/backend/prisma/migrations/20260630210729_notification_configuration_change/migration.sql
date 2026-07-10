/*
  Warnings:

  - You are about to drop the `DiscordWebhook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SmtpConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DiscordWebhook";

-- DropTable
DROP TABLE "SmtpConfig";

-- CreateTable
CREATE TABLE "NotificationChannelConfig" (
    "id" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "config" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationChannelConfig_pkey" PRIMARY KEY ("id")
);
