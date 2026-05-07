-- Initial CCB Network schema for PostgreSQL production deployments.
CREATE TYPE "Role" AS ENUM ('admin', 'creator');
CREATE TYPE "NetworkStatus" AS ENUM ('draft', 'building', 'live', 'distribution_ready', 'archived');
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'qualified', 'closed');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT,
  "authProviderId" TEXT,
  "role" "Role" NOT NULL DEFAULT 'creator',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "CreatorProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT,
  "organization" TEXT,
  "bio" TEXT,
  "website" TEXT,
  "socialLinks" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");

CREATE TABLE "Network" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logoUrl" TEXT,
  "bannerUrl" TEXT,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "targetAudience" TEXT,
  "status" "NetworkStatus" NOT NULL DEFAULT 'draft',
  "distributionGoals" TEXT,
  "monetizationGoals" TEXT,
  "websiteUrl" TEXT,
  "socialLinks" JSONB,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Network_slug_key" ON "Network"("slug");

CREATE TABLE "Show" (
  "id" TEXT NOT NULL,
  "networkId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "coverImageUrl" TEXT,
  "category" TEXT NOT NULL,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Show_slug_key" ON "Show"("slug");

CREATE TABLE "Video" (
  "id" TEXT NOT NULL,
  "networkId" TEXT NOT NULL,
  "showId" TEXT,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "videoUrl" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "duration" INTEGER,
  "category" TEXT NOT NULL,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");

CREATE TABLE "Application" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "organization" TEXT,
  "networkName" TEXT NOT NULL,
  "networkCategory" TEXT NOT NULL,
  "targetAudience" TEXT NOT NULL,
  "contentDescription" TEXT NOT NULL,
  "currentPlatforms" TEXT,
  "websiteSocialLinks" TEXT,
  "sampleVideoUrl" TEXT,
  "uploadedSampleFileUrl" TEXT,
  "monetizationGoals" TEXT,
  "distributionGoals" TEXT,
  "budgetRange" TEXT,
  "timeline" TEXT,
  "rightsConfirmation" BOOLEAN NOT NULL,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
  "adminNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "source" TEXT NOT NULL,
  "interest" TEXT,
  "message" TEXT NOT NULL,
  "status" "LeadStatus" NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PricingPlan" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "priceLabel" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "features" TEXT[] NOT NULL,
  "ctaLabel" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PricingPlan_slug_key" ON "PricingPlan"("slug");

CREATE TABLE "ResourceArticle" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "imageUrl" TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResourceArticle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ResourceArticle_slug_key" ON "ResourceArticle"("slug");

CREATE TABLE "ViewLog" (
  "id" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "networkId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "ipHash" TEXT,
  "userAgentHash" TEXT,
  "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
  "counted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ViewLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DistributionChecklist" (
  "id" TEXT NOT NULL,
  "networkId" TEXT NOT NULL,
  "hasBranding" BOOLEAN NOT NULL DEFAULT false,
  "hasContentLibrary" BOOLEAN NOT NULL DEFAULT false,
  "hasTrailer" BOOLEAN NOT NULL DEFAULT false,
  "hasRightsConfirmation" BOOLEAN NOT NULL DEFAULT false,
  "hasMonetizationPlan" BOOLEAN NOT NULL DEFAULT false,
  "hasAudienceStrategy" BOOLEAN NOT NULL DEFAULT false,
  "hasPrivacyPolicy" BOOLEAN NOT NULL DEFAULT false,
  "hasTerms" BOOLEAN NOT NULL DEFAULT false,
  "isReadyForReview" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DistributionChecklist_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DistributionChecklist_networkId_key" ON "DistributionChecklist"("networkId");

CREATE TABLE "SiteSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

ALTER TABLE "CreatorProfile" ADD CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Network" ADD CONSTRAINT "Network_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Show" ADD CONSTRAINT "Show_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Video" ADD CONSTRAINT "Video_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Video" ADD CONSTRAINT "Video_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ViewLog" ADD CONSTRAINT "ViewLog_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ViewLog" ADD CONSTRAINT "ViewLog_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DistributionChecklist" ADD CONSTRAINT "DistributionChecklist_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE CASCADE ON UPDATE CASCADE;
