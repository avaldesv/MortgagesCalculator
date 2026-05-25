-- CreateTable
CREATE TABLE "MarketListingsConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL,
    "maxCount" INTEGER NOT NULL,
    "tabs" JSONB NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL DEFAULT '32801',
    "label" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketListingsConfig_pkey" PRIMARY KEY ("id")
);
