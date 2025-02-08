import { Decimal } from '@prisma/client/runtime/library'
import { randomUUID } from 'crypto'
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
      ...user,
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

export async function getInviter(prisma: any, inviteCode: string) {
  return inviteCode
    ? await prisma.user.findFirst({
        where: {
          referral_code: {
            equals: inviteCode,
            mode: 'insensitive',
          },
        },
      })
    : null
}
