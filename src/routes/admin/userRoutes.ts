import express from 'express'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { generateReferralCode } from '../../utils/referralCode'
import { getTgId } from '../../utils/telegram'
import { Decimal } from '@prisma/client/runtime/library'

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

    const createdUser = await prisma.$transaction(async (prisma) => {
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
          balance: req.body.invited_by ? new Decimal(10) : new Decimal(5),
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

export default router
