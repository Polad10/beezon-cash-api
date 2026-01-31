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
import { recreateOrderTracks } from '../../services/orderTrack'
import { recreateOrderTypeMappings } from '../../services/orderTypeMapping'

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
		const { user, orderWithDetails } = await prisma.$transaction(async (prisma: any) => {
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
			const orderWithDetails = await getOrderWithDetails(prisma, order.id, res.locals.tgId)

			return { user, orderWithDetails }
		})

		sendStageUpdateMessage({
			tgId: user.tg_id,
			orderCode: orderWithDetails.code,
			orderStatus: orderWithDetails.status,
			weight: orderWithDetails.weight,
			deliveryPrice: orderWithDetails.current_price,
			ponyPrice: orderWithDetails.partner_cost,
		})

		res.json(orderWithDetails)
	} catch (ex) {
		next(ex)
	}
})

router.put('/:id', async (req, res, next) => {
	try {
		const orderWhereClause = {
			id: req.params.id,
			user: {
				tg_id: res.locals.tgId,
			},
		}

		const order = await prisma.order.findUnique({
			where: orderWhereClause,
		})

		if (!order) {
			return res.status(httpStatusCodes.notFound).send('Order not found')
		}

		if (order.status > OrderStatus.WarehouseRF) {
			return res.status(httpStatusCodes.badRequest).send('Order status is not eligible for edit')
		}

		const updatedOrder = await prisma.$transaction(async (prisma: any) => {
			const updatedOrder = await prisma.order.update({
				where: orderWhereClause,
				data: {
					description: req.body.description,
					city: req.body.city,
				},
			})

			await recreateOrderTypeMappings(prisma, req.body.order_type_mappings, updatedOrder.id)
			await recreateOrderTracks(prisma, req.body.order_tracks, updatedOrder.id)

			return await getOrderWithDetails(prisma, updatedOrder.id, res.locals.tgId)
		})

		res.json(updatedOrder)
	} catch (ex) {
		next(ex)
	}
})

router.delete('/:id', async (req, res, next) => {
	try {
		const orderWhereClause = {
			id: req.params.id,
			user: {
				tg_id: res.locals.tgId,
			},
		}

		const order = await prisma.order.findUnique({
			where: orderWhereClause,
		})

		if (!order) {
			return res.status(httpStatusCodes.notFound).send('Order not found')
		}

		if (order.status !== OrderStatus.New) {
			return res.status(httpStatusCodes.badRequest).send('Order status is not eligible for delete')
		}

		await prisma.order.delete({
			where: {
				id: req.params.id,
				user: {
					tg_id: res.locals.tgId,
				},
			},
		})

		res.sendStatus(httpStatusCodes.ok)
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

async function getOrderWithDetails(prisma: any, id: string, tgId: string) {
	return await prisma.order.findUnique({
		where: {
			id: id,
			user: {
				tg_id: tgId,
			},
		},
		include: {
			order_type_mappings: true,
			order_tracks: true,
		},
	})
}

export default router
