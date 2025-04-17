/*
  Warnings:

  - The `status` column on the `order_ge_ru` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderStatusGeRu" AS ENUM ('New', 'InvoiceCreated', 'DrivingInRf', 'Delivered');

-- AlterTable
ALTER TABLE "order_ge_ru" DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatusGeRu" NOT NULL DEFAULT 'New';
