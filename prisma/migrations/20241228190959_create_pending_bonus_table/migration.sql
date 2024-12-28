-- CreateTable
CREATE TABLE "pending_bonus" (
    "id" UUID NOT NULL,
    "from_user_id" UUID NOT NULL,
    "to_user_id" UUID NOT NULL,
    "amount" DECIMAL(8,2) NOT NULL,

    CONSTRAINT "pending_bonus_pk" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pending_bonus" ADD CONSTRAINT "pending_bonus_from_user_fk" FOREIGN KEY ("from_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_bonus" ADD CONSTRAINT "pending_bonus_to_user_fk" FOREIGN KEY ("to_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
