/*
  Warnings:

  - Made the column `bonus_received` on table `order` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "status_fk";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "user_fk";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_fk";

-- AlterTable
CREATE SEQUENCE order_code_seq;
ALTER TABLE "order" ADD COLUMN     "additional_cost" DECIMAL(8,2) NOT NULL DEFAULT 0,
ADD COLUMN     "city" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "partner_cost" DECIMAL(8,2) NOT NULL DEFAULT 0,
ADD COLUMN     "weight" DECIMAL(8,2) NOT NULL DEFAULT 0,
ADD COLUMN     "weight_rounded" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "bonus_received" SET NOT NULL,
ALTER COLUMN "bonus_received" SET DEFAULT 0,
ALTER COLUMN "code" SET DEFAULT nextval('order_code_seq');
ALTER SEQUENCE order_code_seq OWNED BY "order"."code";

-- CreateTable
CREATE TABLE "city" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "city_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_provider" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "delivery_provider_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "order_type_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_track" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "delivery_provider" INTEGER NOT NULL,
    "track_number" VARCHAR(255),

    CONSTRAINT "order_delivery_provider_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_type_mapping" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "order_type" INTEGER NOT NULL,

    CONSTRAINT "order_order_type_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "city_name_unique" ON "city"("name");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_provider_name_unique" ON "delivery_provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "order_type_name_unique" ON "order_type"("name");

-- CreateIndex
CREATE INDEX "order_order_type_order_id_idx" ON "order_type_mapping"("order_id");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_city_fk" FOREIGN KEY ("city") REFERENCES "city"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "status_fk" FOREIGN KEY ("status") REFERENCES "order_status"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "user_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_fk" FOREIGN KEY ("invited_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_track" ADD CONSTRAINT "order_delivery_provider_delivery_provider_fk" FOREIGN KEY ("delivery_provider") REFERENCES "delivery_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_track" ADD CONSTRAINT "order_delivery_provider_order_fk_1" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_type_mapping" ADD CONSTRAINT "order_order_type_order_fk" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_type_mapping" ADD CONSTRAINT "order_order_type_order_type_fk" FOREIGN KEY ("order_type") REFERENCES "order_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;
