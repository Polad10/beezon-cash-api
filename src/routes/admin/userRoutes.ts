import express from 'express'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { generateReferralCode } from '../../utils/referralCode'
import { getTgId } from '../../utils/telegram'

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

    const createdUser = await prisma.user.create({
      data: {
        ...req.body,
        id: randomUUID(),
        tg_id: tgId,
        referral_code: generateReferralCode(),
      },
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
