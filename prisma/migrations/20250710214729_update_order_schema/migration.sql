-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('NotPaid', 'TBC', 'Tinkoff', 'Cash');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'NotPaid';

-- AlterTable
ALTER TABLE "order_ge_ru" ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'NotPaid';
