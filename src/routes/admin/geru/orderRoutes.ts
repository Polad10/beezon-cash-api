import express from 'express'
import { OrderStatusGeRu, PaymentMethod, PrismaClient } from '@prisma/client'
import { OrderGeRuInput } from '../../../models/OrderGeRuInput'
import { randomUUID } from 'crypto'
import { sendStageUpdateGeRuMessage, sendStageUpdateGeRuMessages } from '../../../utils/notification'
import httpStatusCodes from '../../../constants/httpStatusCodes'
import { OrderRecepientGeRu } from '../../../models/OrderRecepient'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
	try {
		const { startDate } = req.query

		const orders = await prisma.order_ge_ru.findMany({
			where: startDate
				? {
						created_at: {
							gte: new Date(startDate as string),
						},
				  }
				: undefined,
		})

		res.json(orders)
	} catch (ex) {
		next(ex)
	}
})

router.post('/', async (req, res, next) => {
	try {
		const orderModel: OrderGeRuInput = {
			id: randomUUID(),
			hint_price: req.body.hint_price,
			original_price: req.body.original_price,
			current_price: req.body.current_price,
			status: req.body.status,
			user_id: req.body.user_id,
			description: req.body.description,
			weight: req.body.weight,
			weight_rounded: req.body.weight_rounded,
			receiver_name: req.body.receiver_name,
			receiver_phone_nr: req.body.receiver_phone_nr,
			receiver_address: req.body.receiver_address,
			cdek_track_nr: req.body.cdek_track_nr,
			delivered_at: req.body.status == OrderStatusGeRu.Delivered ? new Date() : undefined,
			payment_method: req.body.payment_method,
			payment_date:
				!req.body.payment_method || req.body.payment_method == PaymentMethod.NotPaid ? undefined : new Date(),
		}

		const order = await prisma.order_ge_ru.create({
			data: orderModel,
		})

		const orderWithUser = await getOrder(prisma, order.id)

		if (req.body.send_notification) {
			sendStageUpdateGeRuMessage({
				tgId: orderWithUser.user.tg_id,
				orderCode: orderWithUser.code,
				orderStatus: orderWithUser.status,
				cdekTrackNr: orderWithUser.cdek_track_nr!,
			})
		}

		res.json(order)
	} catch (ex) {
		next(ex)
	}
})

router.put('/:id', async (req, res, next) => {
	try {
		const order = await prisma.order_ge_ru.update({
			where: {
				id: req.params.id,
			},
			data: {
				hint_price: req.body.hint_price,
				original_price: req.body.original_price,
				current_price: req.body.current_price,
				status: req.body.status,
				user_id: req.body.user_id,
				description: req.body.description,
				weight: req.body.weight,
				weight_rounded: req.body.weight_rounded,
				receiver_name: req.body.receiver_name,
				receiver_phone_nr: req.body.receiver_phone_nr,
				receiver_address: req.body.receiver_address,
				cdek_track_nr: req.body.cdek_track_nr,
				delivered_at: req.body.status == OrderStatusGeRu.Delivered ? new Date() : null,
				payment_method: req.body.payment_method,
				payment_date: !req.body.payment_method || req.body.payment_method == PaymentMethod.NotPaid ? null : new Date(),
				updated_at: new Date(),
			},
		})

		const orderWithUser = await getOrder(prisma, order.id)

		if (req.body.send_notification) {
			sendStageUpdateGeRuMessage({
				tgId: orderWithUser.user.tg_id,
				orderCode: orderWithUser.code,
				orderStatus: orderWithUser.status,
				cdekTrackNr: orderWithUser.cdek_track_nr!,
			})
		}

		res.json(order)
	} catch (ex) {
		next(ex)
	}
})

router.patch('/:id', async (req, res, next) => {
	try {
		let deliveredAt: Date | null | undefined = undefined
		let paymentDate: Date | null | undefined = undefined

		if (req.body.status) {
			deliveredAt = req.body.status == OrderStatusGeRu.Delivered ? new Date() : null
		}

		if (req.body.payment_method) {
			paymentDate = req.body.payment_method == PaymentMethod.NotPaid ? null : new Date()
		}

		const order = await prisma.order_ge_ru.update({
			where: {
				id: req.params.id,
			},
			data: {
				status: req.body.status,
				payment_method: req.body.payment_method,
				delivered_at: deliveredAt,
				payment_date: paymentDate,
				updated_at: new Date(),
			},
		})

		const orderWithUser = await getOrder(prisma, order.id)

		if (req.body.send_notification) {
			sendStageUpdateGeRuMessage({
				tgId: orderWithUser.user.tg_id,
				orderCode: orderWithUser.code,
				orderStatus: orderWithUser.status,
				cdekTrackNr: orderWithUser.cdek_track_nr!,
			})
		}

		res.json(order)
	} catch (ex) {
		next(ex)
	}
})

router.patch('/', async (req, res, next) => {
	try {
		const patches: { id: string; status: OrderStatusGeRu }[] = req.body.patches

		const orders = await prisma.$transaction(async (prisma: any) => {
			const orders = await Promise.all(
				patches.map((patch) =>
					prisma.order_ge_ru.update({
						where: {
							id: patch.id,
						},
						data: {
							status: patch.status,
							delivered_at: patch.status == OrderStatusGeRu.Delivered ? new Date() : null,
							updated_at: new Date(),
						},
					})
				)
			)

			return orders
		})

		const ordersWithUser: any[] = await getOrders(
			prisma,
			patches.map((patch) => patch.id)
		)

		if (req.body.send_notification) {
			const orderRecepients: OrderRecepientGeRu[] = ordersWithUser.map((order) => ({
				tgId: order.user.tg_id,
				orderCode: order.code,
				orderStatus: order.status,
				cdekTrackNr: order.cdek_track_nr!,
			}))

			sendStageUpdateGeRuMessages(orderRecepients)
		}

		res.json(ordersWithUser)
	} catch (ex) {
		next(ex)
	}
})

router.delete('/:id', async (req, res, next) => {
	try {
		await prisma.order_ge_ru.delete({
			where: {
				id: req.params.id,
			},
		})

		res.sendStatus(httpStatusCodes.ok)
	} catch (ex) {
		next(ex)
	}
})

async function getOrder(prisma: any, id: string) {
	return await prisma.order_ge_ru.findUnique({
		where: {
			id: id,
		},
		include: {
			user: true,
		},
	})
}

async function getOrders(prisma: any, ids: string[]) {
	return await prisma.order_ge_ru.findMany({
		where: {
			id: {
				in: ids,
			},
		},
		include: {
			user: true,
		},
	})
}

export default router
