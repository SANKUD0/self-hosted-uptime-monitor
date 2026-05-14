/*
  Warnings:

  - The values [SMS] on the enum `ContactType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `provider` on the `UserContact` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContactType_new" AS ENUM ('EMAIL', 'DISCORD');
ALTER TABLE "UserContact" ALTER COLUMN "type" TYPE "ContactType_new" USING ("type"::text::"ContactType_new");
ALTER TYPE "ContactType" RENAME TO "ContactType_old";
ALTER TYPE "ContactType_new" RENAME TO "ContactType";
DROP TYPE "public"."ContactType_old";
COMMIT;

-- AlterTable
ALTER TABLE "UserContact" DROP COLUMN "provider";

-- DropEnum
DROP TYPE "CellphoneProvider";
