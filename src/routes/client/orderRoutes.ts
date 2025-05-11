import express from 'express'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { OrderStatus } from '../../enums/OrderStatus'
import { randomUUID } from 'crypto'
import { TransactionType } from '../../enums/TransactionType'
import { sendBonusAppliedMessage, sendStageUpdateMessage } from '../../utils/notification'
import { createOrder, Order } from '../../services/order'
import { City } from '../../enums/City'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        user: {
          tg_id: res.locals.tgId,
        },
      },
    })

    res.json(orders)
  } catch (ex) {
    next(ex)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { user, order } = await prisma.$transaction(async (prisma: any) => {
      let user = await prisma.user.findUnique({
        where: {
          tg_id: res.locals.tgId,
        },
      })

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

    res.json(order)
  } catch (ex) {
    next(ex)
  }
})

router.post('/:orderId/bonus', async (req, res, next) => {
  try {
    const orderId = req.params.orderId
    const amount = new Decimal(req.body.amount)

    const userWhereClause = {
      tg_id: res.locals.tgId,
    }

    const user = await prisma.user.findUnique({
      where: userWhereClause,
    })

    const orderWhereClause = {
      id: orderId,
      user: {
        tg_id: res.locals.tgId,
      },
    }

    const order = await prisma.order.findUnique({
      where: orderWhereClause,
    })

    if (!user) {
      return res.status(httpStatusCodes.notFound).send('User not found')
    }

    if (!order) {
      return res.status(httpStatusCodes.notFound).send('Order not found')
    }

    if (!amount.greaterThan(0)) {
      return res.status(httpStatusCodes.badRequest).send('Amount must be > 0')
    }

    if (amount.greaterThan(user.balance)) {
      return res.status(httpStatusCodes.badRequest).send('Insufficient balance')
    }

    if (!orderStatusEligibleForBonus(order.status)) {
      return res.status(httpStatusCodes.badRequest).send('Order status is not eligible for bonus')
    }

    if (!order.current_price.equals(order.original_price)) {
      return res.status(httpStatusCodes.badRequest).send('Bonus has already been applied for this order')
    }

    const maxAllowedDiscountAmount = order.current_price.dividedBy(4)

    if (amount.greaterThan(maxAllowedDiscountAmount)) {
      return res.status(httpStatusCodes.badRequest).send('The amount cannot exceed 25% of the order price')
    }

    const newOrderPrice = order.current_price.minus(amount)
    const newUserBalance = user.balance.minus(amount)

    const [updatedOrder, updatedUser] = await prisma.$transaction(async (prisma: any) => {
      const updatedOrder = await prisma.order.update({
        where: orderWhereClause,
        data: {
          current_price: newOrderPrice,
        },
      })

      const updatedUser = await prisma.user.update({
        where: userWhereClause,
        data: {
          balance: newUserBalance,
        },
      })

      await prisma.transaction.create({
        data: {
          id: randomUUID(),
          amount: amount,
          order_id: updatedOrder.id,
          user_id: updatedUser.id,
          type: TransactionType.Withdrawal,
          reason: `Бонус применен к заказу #${updatedOrder.code}`,
        },
      })

      return [updatedOrder, updatedUser]
    })

    sendBonusAppliedMessage(updatedUser.tg_id, updatedOrder.code, updatedOrder.current_price)
    res.status(httpStatusCodes.ok).json({ order: updatedOrder, user: updatedUser })
  } catch (ex) {
    next(ex)
  }
})

function orderStatusEligibleForBonus(orderStatus: OrderStatus) {
  return (
    orderStatus == OrderStatus.ReadyForDeliveryInTbilisi ||
    orderStatus == OrderStatus.WarehouseTbilisi ||
    orderStatus == OrderStatus.ReadyForDeliveryByPony ||
    orderStatus == OrderStatus.WaitingForDeliveryByPony
  )
}

export default router
