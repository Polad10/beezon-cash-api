/*
  Warnings:

  - You are about to drop the column `transaction_type` on the `transaction` table. All the data in the column will be lost.
  - Added the required column `type` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_type_fk";

-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "transaction_type",
ADD COLUMN     "type" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_type_fk" FOREIGN KEY ("type") REFERENCES "transaction_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
