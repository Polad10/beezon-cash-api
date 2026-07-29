-- AlterEnum
ALTER TYPE "PaymentMethod" RENAME VALUE 'TBC' TO 'TBCGel';

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'CREDOGel';
ALTER TYPE "PaymentMethod" ADD VALUE 'BOGGel';
ALTER TYPE "PaymentMethod" ADD VALUE 'TBCEur';
ALTER TYPE "PaymentMethod" ADD VALUE 'CREDOEur';
ALTER TYPE "PaymentMethod" ADD VALUE 'BOGEur';
ALTER TYPE "PaymentMethod" ADD VALUE 'TBCUsd';
ALTER TYPE "PaymentMethod" ADD VALUE 'CREDOUsd';
ALTER TYPE "PaymentMethod" ADD VALUE 'BOGUsd';
ALTER TYPE "PaymentMethod" ADD VALUE 'USDT';
