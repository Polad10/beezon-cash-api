import express from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { OrderStatus } from '../enums/OrderStatus'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        user: {
          tg_username: res.locals.username,
        },
      },
    })

    res.json(orders)
  } catch (ex) {
    next(ex)
  }
})

router.post('/:orderId/bonus', async (req, res, next) => {
  try {
    const orderId = req.params.orderId
    const amount = new Decimal(req.body.amount)

    const userWhereClause = {
      tg_username: res.locals.username,
    }

    const user = await prisma.user.findUnique({
      where: userWhereClause,
    })

    const orderWhereClause = {
      id: orderId,
      user: {
        tg_username: res.locals.username,
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

    if (order.status != OrderStatus.WaitingForPayment) {
      return res.status(httpStatusCodes.badRequest).send('Order status is not "WaitingForPayment"')
    }

    if (!order.current_price.equals(order.original_price)) {
      return res.status(httpStatusCodes.badRequest).send('Bonus has already been applied for this order')
    }

    const allowedDiscountAmount = order.current_price.dividedBy(2)

    if (amount.greaterThan(allowedDiscountAmount)) {
      return res.status(httpStatusCodes.badRequest).send('The amount cannot exceed 50% of the order price')
    }

    const newOrderPrice = order.current_price.minus(amount)
    const newUserBalance = user.balance.minus(amount)

    const [updatedOrder, updatedUser] = await prisma.$transaction([
      prisma.order.update({
        where: orderWhereClause,
        data: {
          current_price: newOrderPrice,
        },
      }),

      prisma.user.update({
        where: userWhereClause,
        data: {
          balance: newUserBalance,
        },
      }),
    ])

    res.status(httpStatusCodes.ok).json({ order: updatedOrder, user: updatedUser })
  } catch (ex) {
    next(ex)
  }
})

export default router
