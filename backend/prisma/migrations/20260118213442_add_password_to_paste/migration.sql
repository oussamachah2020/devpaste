-- AlterTable
ALTER TABLE "Paste" ADD COLUMN     "hasPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password" TEXT;
