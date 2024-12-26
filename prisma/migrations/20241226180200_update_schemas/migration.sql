-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_city_fk";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "status_fk";

-- CreateTable
CREATE TABLE "transaction" (
    "id" UUID NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" UUID,
    "user_id" UUID NOT NULL,
    "transaction_type" INTEGER NOT NULL,
    "amount" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "transaction_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "transaction_type_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_type_name_unique" ON "transaction_type"("name");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_city_fk" FOREIGN KEY ("city") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "status_fk" FOREIGN KEY ("status") REFERENCES "order_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_order_status_fk" FOREIGN KEY ("order_status") REFERENCES "order_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_order_fk" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_type_fk" FOREIGN KEY ("transaction_type") REFERENCES "transaction_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
