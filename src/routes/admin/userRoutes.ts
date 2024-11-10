import express from 'express'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { PrismaClient, user } from '@prisma/client'
import { randomUUID } from 'crypto'
import { generateReferralCode } from '../../utils/referralCode'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany()

    res.json(users)
  } catch (ex) {
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

router.post('/', async (req, res) => {
  try {
    const createdUser = await prisma.user.create({
      data: {
        ...req.body,
        id: randomUUID(),
        referral_code: generateReferralCode(),
      },
    })

    res.json(createdUser)
  } catch (ex) {
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: {
        id: req.params.id,
      },
    })

    res.sendStatus(httpStatusCodes.ok)
  } catch (ex) {
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

export default router
