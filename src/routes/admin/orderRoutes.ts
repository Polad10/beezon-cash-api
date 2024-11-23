import express from 'express'
import { PrismaClient } from '@prisma/client'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { randomUUID } from 'crypto'
import { OrderTypeMapping, OrderTypeMappingRequest } from '../../models/OrderTypeMapping'
import { OrderTrack, OrderTrackRequest } from '../../models/OrderTrack'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany()

    res.json(orders)
  } catch (ex) {
    next(ex)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const createdOrder = await prisma.$transaction(async (prisma: any) => {
      const order = await prisma.order.create({
        data: {
          id: randomUUID(),
          date: req.body.date,
          bonus_received: req.body.bonus_received,
          weight: req.body.weight,
          weight_rounded: req.body.weight_rounded,
          additional_cost: req.body.additional_cost,
          original_price: req.body.original_price,
          current_price: req.body.current_price,
          partner_cost: req.body.partner_cost,
          description: req.body.description,
          user: {
            connect: {
              id: req.body.user_id,
            },
          },
          order_status: {
            connect: {
              id: req.body.status,
            },
          },
          order_city: {
            connect: {
              id: req.body.city,
            },
          },
        },
      })

      const orderTypeMappingRequests: OrderTypeMappingRequest[] = req.body.order_type_mappings
      const orderTypeMappings: OrderTypeMapping[] = orderTypeMappingRequests.map((req) => ({
        id: randomUUID(),
        order_id: order.id,
        order_type: req.order_type,
      }))

      await prisma.order_type_mapping.createMany({
        data: orderTypeMappings,
      })

      const orderTrackRequests: OrderTrackRequest[] = req.body.order_tracks
      const orderTracks: OrderTrack[] = orderTrackRequests.map((req) => ({
        id: randomUUID(),
        order_id: order.id,
        delivery_provider: req.delivery_provider,
        track_number: req.track_number,
      }))

      await prisma.order_track.createMany({
        data: orderTracks,
      })

      return await prisma.order.findUnique({
        where: {
          id: order.id,
        },
        include: {
          order_type_mappings: true,
          order_tracks: true,
        },
      })
    })

    res.json(createdOrder)
  } catch (ex) {
    next(ex)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const editedOrder = await prisma.order.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...req.body,
      },
    })

    res.json(editedOrder)
  } catch (ex) {
    next(ex)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.order.delete({
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
