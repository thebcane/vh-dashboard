-- AlterTable
ALTER TABLE "User" ADD COLUMN "googleDriveAccessToken" TEXT;
ALTER TABLE "User" ADD COLUMN "googleDriveRefreshToken" TEXT;
ALTER TABLE "User" ADD COLUMN "googleDriveTokenExpiry" DATETIME;
