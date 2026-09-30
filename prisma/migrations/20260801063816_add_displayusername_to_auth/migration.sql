/*
  Warnings:

  - Added the required column `isActive` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "session" ADD COLUMN     "isActive" BOOLEAN NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "displayUsername" TEXT;
