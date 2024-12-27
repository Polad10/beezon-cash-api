import express from 'express'
import { PrismaClient } from '@prisma/client'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { randomUUID } from 'crypto'
import { OrderTypeMapping, OrderTypeMappingRequest } from '../../models/OrderTypeMapping'
import { OrderTrack, OrderTrackRequest } from '../../models/OrderTrack'
import { City } from '../../enums/City'
import { OrderStatus } from '../../enums/OrderStatus'
import { OrderRecepient } from '../../models/OrderRecepient'
import { Order } from '../../models/Order'
import { TransactionType } from '../../enums/TransactionType'
import { CashbackRecepient } from '../../models/CashbackRecepient'
import { StageResult } from '../../models/StageResult'
import {
  sendCashbackAppliedMessage,
  sendCashbackAppliedMessages,
  sendStageUpdateMessage,
  sendStageUpdateMessages,
} from '../../utils/notification'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        order_type_mappings: true,
        order_tracks: true,
      },
    })

    res.json(orders)
  } catch (ex) {
    next(ex)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const [createdOrder, stageResult] = await prisma.$transaction(async (prisma: any) => {
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
              id: req.body.city || City.Other,
            },
          },
        },
      })

      await recreateOrderTypeMappings(prisma, req.body.order_type_mappings, order.id)
      await recreateOrderTracks(prisma, req.body.order_tracks, order.id)

      const orderWithAdditionalInfo = await getOrder(prisma, order.id)
      const stageResult = await processStage(prisma, orderWithAdditionalInfo)

      return [orderWithAdditionalInfo, stageResult]
    })

    if (req.body.send_notification) {
      sendStageUpdateMessage({
        tgUsername: createdOrder.user!.tg_username,
        orderCode: createdOrder.code,
        orderStatus: createdOrder.status,
        weight: createdOrder.weight,
        deliveryPrice: createdOrder.current_price,
        ponyPrice: createdOrder.partner_cost,
      })

      if (stageResult.cashback) {
        sendCashbackAppliedMessage({
          tgUsername: createdOrder.user!.tg_username,
          orderCode: createdOrder.code,
          cashback: stageResult.cashback,
        })
      }
    }

    res.json(createdOrder)
  } catch (ex) {
    next(ex)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const [updatedOrder, stageResult] = await prisma.$transaction(async (prisma: any) => {
      const order = await prisma.order.update({
        where: {
          id: req.params.id,
        },
        data: {
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

      await recreateOrderTypeMappings(prisma, req.body.order_type_mappings, order.id)
      await recreateOrderTracks(prisma, req.body.order_tracks, order.id)

      const orderWithAdditionalInfo = await getOrder(prisma, order.id)
      const stageResult = await processStage(prisma, orderWithAdditionalInfo)

      return [orderWithAdditionalInfo, stageResult]
    })

    if (req.body.send_notification) {
      sendStageUpdateMessage({
        tgUsername: updatedOrder.user!.tg_username,
        orderCode: updatedOrder.code,
        orderStatus: updatedOrder.status,
        weight: updatedOrder.weight,
        deliveryPrice: updatedOrder.current_price,
        ponyPrice: updatedOrder.partner_cost,
      })

      if (stageResult.cashback) {
        sendCashbackAppliedMessage({
          tgUsername: updatedOrder.user!.tg_username,
          orderCode: updatedOrder.code,
          cashback: stageResult.cashback,
        })
      }
    }

    res.json(updatedOrder)
  } catch (ex) {
    next(ex)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const [updatedOrder, stageResult] = await prisma.$transaction(async (prisma: any) => {
      await prisma.order.update({
        where: {
          id: req.params.id,
        },
        data: {
          order_status: {
            connect: {
              id: req.body.status,
            },
          },
        },
      })

      const updatedOrder = await getOrder(prisma, req.params.id)
      const stageResult = await processStage(prisma, updatedOrder)

      return [updatedOrder, stageResult]
    })

    if (req.body.send_notification) {
      sendStageUpdateMessage({
        tgUsername: updatedOrder.user!.tg_username,
        orderCode: updatedOrder.code,
        orderStatus: updatedOrder.status,
        weight: updatedOrder.weight,
        deliveryPrice: updatedOrder.current_price,
        ponyPrice: updatedOrder.partner_cost,
      })

      if (stageResult.cashback) {
        sendCashbackAppliedMessage({
          tgUsername: updatedOrder.user!.tg_username,
          orderCode: updatedOrder.code,
          cashback: stageResult.cashback,
        })
      }
    }

    res.json(updatedOrder)
  } catch (ex) {
    next(ex)
  }
})

router.patch('/', async (req, res, next) => {
  try {
    const patches: { id: string; status: OrderStatus }[] = req.body.patches

    const [updatedOrders, stageResults] = await prisma.$transaction(async (prisma: any) => {
      await Promise.all(
        patches.map((patch) =>
          prisma.order.update({
            where: {
              id: patch.id,
            },
            data: {
              order_status: {
                connect: {
                  id: patch.status,
                },
              },
            },
          })
        )
      )

      const updatedOrders = await getOrders(
        prisma,
        patches.map((patch) => patch.id)
      )

      const stageResults = await processStages(prisma, updatedOrders)

      return [updatedOrders, stageResults]
    })

    if (req.body.send_notification) {
      const orderRecepients: OrderRecepient[] = updatedOrders.map((order: Order) => ({
        tgUsername: order.user!.tg_username,
        orderCode: order.code,
        orderStatus: order.status,
        weight: order.weight,
        deliveryPrice: order.current_price,
        ponyPrice: order.partner_cost,
      }))

      sendStageUpdateMessages(orderRecepients)

      const cashbackRecepients: CashbackRecepient[] = stageResults
        .filter((result: StageResult) => result.cashback)
        .map((result: StageResult) => {
          return {
            tgUsername: result.order.user!.tg_username,
            orderCode: result.order.code,
            cashback: result.cashback,
          }
        })

      sendCashbackAppliedMessages(cashbackRecepients)
    }

    res.json(updatedOrders)
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

async function getOrder(prisma: any, id: string) {
  return await prisma.order.findUnique({
    where: {
      id: id,
    },
    include: {
      user: true,
      order_type_mappings: true,
      order_tracks: true,
    },
  })
}

async function getOrders(prisma: any, ids: string[]) {
  return await prisma.order.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      user: true,
      order_type_mappings: true,
      order_tracks: true,
    },
  })
}

async function processStage(prisma: any, order: Order) {
  return await processTransactions(prisma, order)
}

async function processStages(prisma: any, orders: Order[]) {
  const results: StageResult[] = []

  for (const order of orders) {
    const result = await processTransactions(prisma, order)
    results.push(result)
  }

  return results
}

async function processTransactions(prisma: any, order: Order) {
  const result: StageResult = {
    order: order,
    cashback: null,
  }

  if (order.status == OrderStatus.Delivered) {
    const orderTransactions = await prisma.transaction.findMany({
      where: {
        order_id: order.id,
      },
    })

    if (orderTransactions.length === 0) {
      const cashback = order.original_price.mul(0.03)

      await prisma.transaction.create({
        data: {
          id: randomUUID(),
          amount: cashback,
          order: {
            connect: {
              id: order.id,
            },
          },
          user: {
            connect: {
              id: order.user!.id,
            },
          },
          transaction_type: {
            connect: {
              id: TransactionType.Deposit,
            },
          },
        },
      })

      const newBalance = order.user!.balance.add(cashback)

      await prisma.user.update({
        where: {
          id: order.user!.id,
        },
        data: {
          balance: newBalance,
        },
      })

      result.cashback = cashback
    }
  }

  return result
}

export default router
