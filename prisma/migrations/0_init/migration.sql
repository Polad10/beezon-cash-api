-- CreateTable
CREATE TABLE "order" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "original_price" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "current_price" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "bonus_received" DECIMAL(8,2),
    "user_id" UUID NOT NULL,

    CONSTRAINT "order_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "order_status_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone_nr" VARCHAR(20) NOT NULL,
    "tg_username" VARCHAR(32) NOT NULL,
    "referral_code" VARCHAR(15) NOT NULL,
    "invited_by" UUID,
    "balance" DECIMAL(8,2) NOT NULL DEFAULT 0,

    CONSTRAINT "user_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "name_unique" ON "order_status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "email_unique" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "phone_nr_unique" ON "user"("phone_nr");

-- CreateIndex
CREATE UNIQUE INDEX "tg_username_unique" ON "user"("tg_username");

-- CreateIndex
CREATE UNIQUE INDEX "referral_code_unique" ON "user"("referral_code");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "status_fk" FOREIGN KEY ("status") REFERENCES "order_status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "user_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_fk" FOREIGN KEY ("invited_by") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

