-- CreateEnum
CREATE TYPE "CellphoneProviderCanadaQuebec" AS ENUM ('BELL', 'VIDEOTRON');

-- AlterTable
ALTER TABLE "UserContact" ADD COLUMN     "provider" "CellphoneProviderCanadaQuebec";
