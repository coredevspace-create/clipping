-- AlterTable
ALTER TABLE "LinkClick" ADD COLUMN     "device" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "appStoreProviderToken" TEXT,
ADD COLUMN     "appStoreUrl" TEXT,
ADD COLUMN     "conversionKey" TEXT,
ADD COLUMN     "playStoreUrl" TEXT,
ADD COLUMN     "productType" TEXT NOT NULL DEFAULT 'APP';

-- CreateTable
CREATE TABLE "Conversion" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversion_membershipId_createdAt_idx" ON "Conversion"("membershipId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversion_workspaceId_externalId_key" ON "Conversion"("workspaceId", "externalId");

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Clé de conversion pour les équipes existantes, puis colonne obligatoire
UPDATE "Workspace" SET "conversionKey" = md5(random()::text || clock_timestamp()::text) WHERE "conversionKey" IS NULL;
ALTER TABLE "Workspace" ALTER COLUMN "conversionKey" SET NOT NULL;
