-- CreateTable
CREATE TABLE "setting" (
    "id" SERIAL NOT NULL,
    "exchange_rate" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "setting_pk" PRIMARY KEY ("id")
);
