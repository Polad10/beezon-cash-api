import express from 'express'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { getTgId } from '../../../utils/telegram'
import { generateReferralCode } from '../../../utils/referralCode'
import { createUser, User } from '../../../services/user'
import { sendStageUpdateGeRuMessage } from '../../../utils/notification'
import httpStatusCodes from '../../../constants/httpStatusCodes'
import { OrderGeRuInput } from '../../../models/OrderGeRuInput'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    const tgId = await getTgId(req.body.tg_username)

    const { user, order } = await prisma.$transaction(async (prisma: any) => {
      let user = await prisma.user.findUnique({
        where: {
          tg_id: tgId,
        },
      })

      if (user) {
        user = await prisma.user.update({
          where: {
            tg_id: tgId,
          },
          data: {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            phone_nr: req.body.phone_nr,
            tg_username: req.body.tg_username,
          },
        })
      } else {
        const userModel: User = {
          id: randomUUID(),
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone_nr: req.body.phone_nr,
          tg_username: req.body.tg_username,
          tg_id: tgId,
          referral_code: generateReferralCode(),
          invited_by: null,
        }

        user = await createUser(prisma, userModel)
      }

      const orderModel: OrderGeRuInput = {
        id: randomUUID(),
        hint_price: req.body.hint_price,
        user_id: user.id,
        description: req.body.description,
        receiver_name: req.body.receiver_name,
        receiver_phone_nr: req.body.receiver_phone_nr,
        receiver_address: req.body.receiver_address,
      }

      const order = await prisma.order_ge_ru.create({
        data: orderModel,
      })

      return { user, order }
    })

    sendStageUpdateGeRuMessage({
      tgId: user.tg_id,
      orderCode: order.code,
      orderStatus: order.status,
      cdekTrackNr: order.cdek_track_nr,
    })

    res.sendStatus(httpStatusCodes.ok)
  } catch (ex) {
    next(ex)
  }
})

export default router
