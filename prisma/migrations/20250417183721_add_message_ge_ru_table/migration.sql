-- CreateTable
CREATE TABLE "message_ge_ru" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "text" TEXT NOT NULL,
    "order_status" "OrderStatusGeRu" NOT NULL,

    CONSTRAINT "message_ge_ru_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_status_unique" ON "message_ge_ru"("order_status");
