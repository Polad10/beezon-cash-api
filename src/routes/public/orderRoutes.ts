import express from 'express'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { City } from '../../enums/City'
import { generateReferralCode } from '../../utils/referralCode'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { sendStageUpdateMessage } from '../../utils/notification'
import { recreateOrderTypeMappings } from '../../utils/orderTypeMapping'
import { recreateOrderTracks } from '../../utils/orderTrack'
import { getTgId } from '../../utils/telegram'
import { createUser, User } from '../../services/user'

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
        const inviter = req.body.invite_code
          ? await prisma.user.findFirst({
              where: {
                referral_code: {
                  equals: req.body.invite_code,
                  mode: 'insensitive',
                },
              },
            })
          : null

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

      const order = await prisma.order.create({
        data: {
          id: randomUUID(),
          description: req.body.description,
          user_id: user.id,
          city: req.body.city || City.Other,
        },
      })

      await recreateOrderTypeMappings(prisma, req.body.order_type_mappings, order.id)
      await recreateOrderTracks(prisma, req.body.order_tracks, order.id)

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
