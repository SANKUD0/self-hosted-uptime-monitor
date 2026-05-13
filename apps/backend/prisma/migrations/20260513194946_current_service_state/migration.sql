-- CreateTable
CREATE TABLE "ServiceState" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" "CheckStatus" NOT NULL,
    "latencyMs" INTEGER,
    "statusCode" INTEGER,
    "error" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceState_serviceId_key" ON "ServiceState"("serviceId");

-- AddForeignKey
ALTER TABLE "ServiceState" ADD CONSTRAINT "ServiceState_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
