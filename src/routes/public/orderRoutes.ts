import express from 'express'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { OrderTypeMapping, OrderTypeMappingRequest } from '../../models/OrderTypeMapping'
import { OrderTrack, OrderTrackRequest } from '../../models/OrderTrack'
import { City } from '../../enums/City'
import { generateReferralCode } from '../../utils/referralCode'
import httpStatusCodes from '../../constants/httpStatusCodes'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (req, res, next) => {
  try {
    await prisma.$transaction(async (prisma: any) => {
      const inviter = await prisma.user.findFirst({
        where: {
          referral_code: {
            equals: req.body.invite_code,
            mode: 'insensitive',
          },
        },
      })

      const user = await prisma.user.upsert({
        where: {
          tg_username: req.body.tg_username,
        },
        update: {},
        create: {
          id: randomUUID(),
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          phone_nr: req.body.phone_nr,
          tg_username: req.body.tg_username,
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
    })

    res.sendStatus(httpStatusCodes.ok)
  } catch (ex) {
    next(ex)
  }
})

async function recreateOrderTypeMappings(
  prisma: any,
  orderTypeMappingRequests: OrderTypeMappingRequest[],
  orderId: string
) {
  await prisma.order_type_mapping.deleteMany({
    where: {
      order_id: orderId,
    },
  })

  const orderTypeMappings: OrderTypeMapping[] = orderTypeMappingRequests.map((req) => ({
    id: randomUUID(),
    order_id: orderId,
    order_type: req.order_type,
  }))

  await prisma.order_type_mapping.createMany({
    data: orderTypeMappings,
  })
}

async function recreateOrderTracks(prisma: any, orderTrackRequests: OrderTrackRequest[], orderId: string) {
  await prisma.order_track.deleteMany({
    where: {
      order_id: orderId,
    },
  })

  const orderTracks: OrderTrack[] = orderTrackRequests.map((req) => ({
    id: randomUUID(),
    order_id: orderId,
    delivery_provider: req.delivery_provider,
    track_number: req.track_number,
  }))

  await prisma.order_track.createMany({
    data: orderTracks,
  })
}

export default router
