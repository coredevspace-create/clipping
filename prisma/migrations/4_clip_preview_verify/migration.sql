-- AlterTable
ALTER TABLE "Clip" ADD COLUMN     "authorHandle" TEXT,
ADD COLUMN     "caption" TEXT,
ADD COLUMN     "ownershipMethod" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "verifyCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_verifyCode_key" ON "User"("verifyCode");

