-- DropForeignKey
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_order_fk";

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "reason" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "order_ge_ru" (
    "id" UUID NOT NULL,
    "hint_price" TEXT NOT NULL,
    "original_price" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "current_price" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'New',
    "user_id" UUID NOT NULL,
    "code" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "weight_rounded" BOOLEAN NOT NULL DEFAULT false,
    "receiver_name" TEXT NOT NULL,
    "receiver_phone_nr" TEXT NOT NULL,
    "receiver_address" TEXT NOT NULL,
    "cdek_track_nr" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),

    CONSTRAINT "order_ge_ru_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_ge_ru_code_unique" ON "order_ge_ru"("code");

-- AddForeignKey
ALTER TABLE "order_ge_ru" ADD CONSTRAINT "user_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
