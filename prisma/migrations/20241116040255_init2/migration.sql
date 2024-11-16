/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "user_fk";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_fk";

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "code" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "text" TEXT NOT NULL,
    "order_status" INTEGER NOT NULL,

    CONSTRAINT "messages_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_status_id_unique" ON "message"("order_status");

-- CreateIndex
CREATE UNIQUE INDEX "code_unique" ON "order"("code");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "user_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_fk" FOREIGN KEY ("invited_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
