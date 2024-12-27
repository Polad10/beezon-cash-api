/*
  Warnings:

  - A unique constraint covering the columns `[tg_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tg_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "tg_id" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tg_id_unique" ON "user"("tg_id");
