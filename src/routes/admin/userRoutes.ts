import express from 'express'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { generateReferralCode } from '../../utils/referralCode'
import { getTgId } from '../../utils/telegram'
import { Decimal } from '@prisma/client/runtime/library'
import { TransactionType } from '../../enums/TransactionType'
import { setTimeout } from 'timers/promises'
import axios from 'axios'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany()

    res.json(users)
  } catch (ex) {
    next(ex)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const tgId = await getTgId(req.body.tg_username)

    const createdUser = await prisma.$transaction(async (prisma: any) => {
      const newcomerBonus = req.body.invited_by ? new Decimal(10) : new Decimal(5)

      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone_nr: req.body.phone_nr,
          tg_username: req.body.tg_username,
          tg_id: tgId,
          referral_code: generateReferralCode(),
          invited_by: req.body.invited_by,
          balance: newcomerBonus,
        },
      })

      await prisma.transaction.create({
        data: {
          id: randomUUID(),
          amount: newcomerBonus,
          user_id: user.id,
          type: TransactionType.Deposit,
        },
      })

      if (req.body.invited_by) {
        await prisma.pending_bonus.create({
          data: {
            id: randomUUID(),
            from_user_id: user.id,
            to_user_id: req.body.invited_by,
            amount: new Decimal(10),
          },
        })
      }

      return user
    })

    res.json(createdUser)
  } catch (ex) {
    next(ex)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const editedUser = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...req.body,
      },
    })

    res.json(editedUser)
  } catch (ex) {
    next(ex)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: {
        id: req.params.id,
      },
    })

    res.sendStatus(httpStatusCodes.ok)
  } catch (ex) {
    next(ex)
  }
})

router.post('/sync', async (req, res, next) => {
  try {
    const notSyncedUsers = new Map<string, string[]>()
    const syncedUsers: any[] = []
    let next = 0 as number | undefined

    do {
      const data = (
        await axios.post(`${process.env.BITRIX_API}/${process.env.BITRIX_SECRET}/crm.contact.list`, {
          select: ['*', 'IM', 'PHONE'],
          start: next,
        })
      ).data

      const bitrixUsers: any[] = data.result

      let users = bitrixUsers
        .filter((u) => {
          const firstName = u.NAME
          const lastName = u.LAST_NAME
          const hasPhoneNr = u.PHONE && u.PHONE.length != 0
          const hasTg = u.IM && u.IM.length != 0

          const reasons: string[] = []

          if (!firstName) {
            reasons.push('No first name')
          }

          if (!lastName) {
            reasons.push('No last name')
          }

          if (!hasPhoneNr) {
            reasons.push('No phone number')
          }

          if (!hasTg) {
            reasons.push('No telegram')
          }

          if (reasons.length > 0) {
            notSyncedUsers.set(u.ID, reasons)
          }

          return reasons.length == 0
        })
        .map((u) => {
          const id = u.ID
          const firstName = u.NAME
          const lastName = u.LAST_NAME
          const phoneNr = u.PHONE[u.PHONE.length - 1].VALUE
          const tg = u.IM[u.IM.length - 1].VALUE.replace('@', '')

          return {
            id: id,
            first_name: firstName,
            last_name: lastName,
            phone_nr: phoneNr,
            tg_username: tg,
            tg_id: '',
            referral_code: '',
          }
        })

      for (const user of users) {
        try {
          const tgId = await getTgId(user.tg_username)
          user.tg_id = tgId

          await setTimeout(1000)
        } catch (ex) {
          if (notSyncedUsers.has(user.id)) {
            notSyncedUsers.get(user.id)?.push('No telegram id found')
          } else {
            notSyncedUsers.set(user.id, ['No telegram id found'])
          }
        }
      }

      users = users.filter((u) => u.tg_id)

      for (const user of users) {
        user.id = randomUUID()
        user.referral_code = generateReferralCode()
      }

      await prisma.$transaction(
        users.map((user) =>
          prisma.user.upsert({
            where: {
              tg_id: user.tg_id,
            },
            update: {},
            create: user,
          })
        )
      )

      next = data.next
      syncedUsers.push(...users)
    } while (next)

    res.json({
      synced: syncedUsers,
      notSynced: Object.fromEntries(notSyncedUsers),
    })
  } catch (ex) {
    res.status(httpStatusCodes.internalServerError).json(ex)
  }
})

export default router
