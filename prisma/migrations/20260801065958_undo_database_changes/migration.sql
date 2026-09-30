/*
  Warnings:

  - You are about to drop the column `isActive` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `displayUsername` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_username_key";

-- AlterTable
ALTER TABLE "session" DROP COLUMN "isActive",
DROP COLUMN "role";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "displayUsername",
DROP COLUMN "username";
