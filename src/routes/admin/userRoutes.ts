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
    const user: user = {
      ...req.body,
      id: randomUUID(),
      referral_code: generateReferralCode(),
    }

    const createdUser = await prisma.user.create({
      data: user,
    })

    res.json(createdUser)
  } catch (ex) {
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

export default router
