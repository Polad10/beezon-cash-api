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

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    const tgId = await getTgId(req.body.tg_username)

    const { user, order } = await prisma.$transaction(async (prisma: any) => {
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

      const user = await prisma.user.upsert({
        where: {
          tg_id: tgId,
        },
        update: {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone_nr: req.body.phone_nr,
          tg_username: req.body.tg_username,
        },
        create: {
          id: randomUUID(),
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone_nr: req.body.phone_nr,
          tg_username: req.body.tg_username,
          tg_id: tgId,
          referral_code: generateReferralCode(),
          inviter: inviter ? { connect: { id: inviter.id } } : undefined,
        },
      })

      const order = await prisma.order.create({
        data: {
          id: randomUUID(),
          date: req.body.date,
          description: req.body.description,
          user: {
            connect: {
              id: user.id,
            },
          },
          order_city: {
            connect: {
              id: req.body.city || City.Other,
            },
          },
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
