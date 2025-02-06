import { Decimal } from '@prisma/client/runtime/library'
import { randomUUID } from 'crypto'
import { generateReferralCode } from '../utils/referralCode'
import { TransactionType } from '../enums/TransactionType'

export interface User {
  id: string
  first_name: string
  last_name: string
  phone_nr: string
  tg_username: string
  tg_id: string
  referral_code: string
  invited_by: string | null
}

export async function createUser(prisma: any, user: User) {
  const newcomerBonus = user.invited_by ? new Decimal(10) : new Decimal(5)

  const createdUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      first_name: user.first_name,
      last_name: user.last_name,
      phone_nr: user.phone_nr,
      tg_username: user.tg_username,
      tg_id: user.tg_id,
      referral_code: generateReferralCode(),
      invited_by: user.invited_by,
      balance: newcomerBonus,
    },
  })

  await prisma.transaction.create({
    data: {
      id: randomUUID(),
      amount: newcomerBonus,
      user_id: createdUser.id,
      type: TransactionType.Deposit,
    },
  })

  if (user.invited_by) {
    await prisma.pending_bonus.create({
      data: {
        id: randomUUID(),
        from_user_id: createdUser.id,
        to_user_id: user.invited_by,
        amount: new Decimal(10),
      },
    })
  }

  return createdUser
}
