import express from 'express'
import { PrismaClient } from '@prisma/client'
import { createUser, getInviter, User } from '../services/user'
import { randomUUID } from 'crypto'
import { generateReferralCode } from '../utils/referralCode'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    const createdUser = await prisma.$transaction(async (prisma: any) => {
      const inviter = await getInviter(prisma, req.body.invite_code)

      const user: User = {
        id: randomUUID(),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone_nr: req.body.phone_nr,
        tg_username: res.locals.tgUsername,
        tg_id: res.locals.tgId,
        referral_code: generateReferralCode(),
        invited_by: inviter ? inviter.id : null,
      }

      return await createUser(prisma, user)
    })

    res.json(createdUser)
  } catch (ex) {
    next(ex)
  }
})

export default router
