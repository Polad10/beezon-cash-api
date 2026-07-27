-- CreateEnum
CREATE TYPE "OrderStatusGeEu" AS ENUM ('New', 'AtWarehouse1', 'AtWarehouse2', 'Delivering', 'Delivered');

-- CreateTable
CREATE TABLE "order_ge_eu" (
    "id" UUID NOT NULL,
    "hint_price" TEXT NOT NULL,
    "original_price" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "current_price" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "status" "OrderStatusGeEu" NOT NULL DEFAULT 'New',
    "user_id" UUID NOT NULL,
    "code" SERIAL NOT NULL,
    "description" TEXT,
    "weight" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "weight_rounded" BOOLEAN NOT NULL DEFAULT false,
    "receiver_name" TEXT NOT NULL,
    "receiver_phone_nr" TEXT NOT NULL,
    "receiver_address" TEXT NOT NULL,
    "track_nr" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'NotPaid',
    "payment_date" TIMESTAMP(3),

    CONSTRAINT "order_ge_eu_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_ge_eu" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "text" TEXT NOT NULL,
    "order_status" "OrderStatusGeEu" NOT NULL,

    CONSTRAINT "message_ge_eu_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_ge_eu_code_unique" ON "order_ge_eu"("code");

-- CreateIndex
CREATE UNIQUE INDEX "message_ge_eu_order_status_unique" ON "message_ge_eu"("order_status");

-- AddForeignKey
ALTER TABLE "order_ge_eu" ADD CONSTRAINT "order_ge_eu_user_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
