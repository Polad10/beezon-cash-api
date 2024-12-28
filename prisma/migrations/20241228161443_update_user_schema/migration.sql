/*
  Warnings:

  - You are about to alter the column `tg_id` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "tg_id" SET DATA TYPE VARCHAR(25);
