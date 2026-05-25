-- CreateTable
CREATE TABLE "AdPlacement" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "position" TEXT NOT NULL,
    "tabs" JSONB NOT NULL,
    "maxListings" INTEGER,
    "sponsoredLabel" TEXT,
    "priority" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsoredListing" (
    "id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "estimatedMonthlyPayment" DOUBLE PRECISION NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" DOUBLE PRECISION NOT NULL,
    "squareFeet" INTEGER NOT NULL,
    "agentOrCompany" TEXT NOT NULL,
    "listingUrl" TEXT NOT NULL,
    "zip" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SponsoredListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "targetRegion" TEXT NOT NULL,
    "monthlyBudget" DOUBLE PRECISION,
    "message" TEXT,
    "consentContact" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerLead_pkey" PRIMARY KEY ("id")
);
