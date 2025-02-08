import express from 'express'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { City } from '../../enums/City'
import { generateReferralCode } from '../../utils/referralCode'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { sendStageUpdateMessage } from '../../utils/notification'
import { getTgId } from '../../utils/telegram'
import { createUser, getInviter, User } from '../../services/user'
import { createOrder, Order } from '../../services/order'

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
        const inviter = await getInviter(prisma, req.body.invite_code)

        const userModel: User = {
          id: randomUUID(),
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone_nr: req.body.phone_nr,
          tg_username: req.body.tg_username,
          tg_id: tgId,
          referral_code: generateReferralCode(),
          invited_by: inviter ? inviter.id : null,
        }

        user = await createUser(prisma, userModel)
      }

      const orderModel: Order = {
        id: randomUUID(),
        description: req.body.description,
        user_id: user.id,
        city: req.body.city || City.Other,
      }

      const order = await createOrder(prisma, orderModel, req.body.order_type_mappings, req.body.order_tracks)

      return { user, order }
    })

    sendStageUpdateMessage({
      tgId: user.tg_id,
      orderCode: order.code,
      orderStatus: order.status,
      weight: order.weight,
      deliveryPrice: order.current_price,
      ponyPrice: order.partner_cost,
    })

    res.sendStatus(httpStatusCodes.ok)
  } catch (ex) {
    next(ex)
  }
})

export default router
