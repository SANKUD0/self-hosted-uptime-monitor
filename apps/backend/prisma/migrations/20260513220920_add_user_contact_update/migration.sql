/*
  Warnings:

  - You are about to drop the column `userId` on the `UserContact` table. All the data in the column will be lost.
  - The `provider` column on the `UserContact` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `label` to the `UserContact` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CellphoneProvider" AS ENUM ('BELL', 'VIDEOTRON', 'ROGERS', 'TELUS', 'KOODO', 'FIDO', 'PUBLIC_MOBILE', 'LUCKY_MOBILE', 'FREEDOM', 'CHATR');

-- AlterTable
ALTER TABLE "UserContact" DROP COLUMN "userId",
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "label" TEXT NOT NULL,
DROP COLUMN "provider",
ADD COLUMN     "provider" "CellphoneProvider";

-- DropEnum
DROP TYPE "CellphoneProviderCanadaQuebec";

-- CreateIndex
CREATE INDEX "UserContact_type_enabled_idx" ON "UserContact"("type", "enabled");
