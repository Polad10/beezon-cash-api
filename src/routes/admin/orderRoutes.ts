import express from 'express'
import { PaymentMethod, PrismaClient } from '@prisma/client'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { randomUUID } from 'crypto'
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
import { recreateOrderTypeMappings } from '../../services/orderTypeMapping'
import { recreateOrderTracks } from '../../services/orderTrack'
import { User } from '../../models/User'
import { createOrder, Order as NewOrder } from '../../services/order'

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
			const orderModel: NewOrder = {
				id: randomUUID(),
				bonus_received: req.body.bonus_received,
				weight: req.body.weight,
				weight_rounded: req.body.weight_rounded,
				additional_cost: req.body.additional_cost,
				original_price: req.body.original_price,
				current_price: req.body.current_price,
				partner_cost: req.body.partner_cost,
				partner_track_number: req.body.partner_track_number,
				description: req.body.description,
				user_id: req.body.user_id,
				status: req.body.status,
				city: req.body.city || City.Other,
				end_date: req.body.status == OrderStatus.Delivered ? new Date() : undefined,
				payment_method: req.body.payment_method,
				payment_date:
					!req.body.payment_method || req.body.payment_method == PaymentMethod.NotPaid ? undefined : new Date(),
				exchange_rate: req.body.exchange_rate,
			}

			const order = await createOrder(prisma, orderModel, req.body.order_type_mappings, req.body.order_tracks)
			const stageResult = await processStage(prisma, order)
			const createdOrder = await getOrder(prisma, order.id)

			return [createdOrder, stageResult]
		})

		if (req.body.send_notification) {
			sendStageUpdateMessage({
				tgId: createdOrder.user!.tg_id,
				orderCode: createdOrder.code,
				orderStatus: createdOrder.status,
				weight: createdOrder.weight,
				deliveryPrice: createdOrder.current_price,
				ponyPrice: createdOrder.partner_cost,
				exchangeRate: createdOrder.exchange_rate,
				partnerTrackNumber: createdOrder.partner_track_number,
			})

			if (stageResult?.cashback) {
				sendCashbackAppliedMessage({
					tgId: createdOrder.user!.tg_id,
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
			let exchange_rate = req.body.exchange_rate

			if (!exchange_rate && req.body.status && req.body.status > OrderStatus.ProcessedInTbilisi) {
				const settings = await prisma.setting.findFirst()
				exchange_rate = settings.exchange_rate
			}

			const order = await prisma.order.update({
				where: {
					id: req.params.id,
				},
				data: {
					bonus_received: req.body.bonus_received,
					weight: req.body.weight,
					weight_rounded: req.body.weight_rounded,
					additional_cost: req.body.additional_cost,
					original_price: req.body.original_price,
					current_price: req.body.current_price,
					partner_cost: req.body.partner_cost,
					partner_track_number: req.body.partner_track_number,
					description: req.body.description,
					user_id: req.body.user_id,
					status: req.body.status,
					city: req.body.city,
					end_date: req.body.status == OrderStatus.Delivered ? new Date() : null,
					payment_method: req.body.payment_method,
					payment_date:
						!req.body.payment_method || req.body.payment_method == PaymentMethod.NotPaid ? null : new Date(),
					exchange_rate: exchange_rate,
				},
			})

			await recreateOrderTypeMappings(prisma, req.body.order_type_mappings, order.id)
			await recreateOrderTracks(prisma, req.body.order_tracks, order.id)

			const stageResult = await processStage(prisma, order)
			const updatedOrder = await getOrder(prisma, order.id)

			return [updatedOrder, stageResult]
		})

		if (req.body.send_notification) {
			sendStageUpdateMessage({
				tgId: updatedOrder.user!.tg_id,
				orderCode: updatedOrder.code,
				orderStatus: updatedOrder.status,
				weight: updatedOrder.weight,
				deliveryPrice: updatedOrder.current_price,
				ponyPrice: updatedOrder.partner_cost,
				exchangeRate: updatedOrder.exchange_rate,
				partnerTrackNumber: updatedOrder.partner_track_number,
			})

			if (stageResult?.cashback) {
				sendCashbackAppliedMessage({
					tgId: updatedOrder.user!.tg_id,
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
		let endDate: Date | null | undefined = undefined
		let paymentDate: Date | null | undefined = undefined

		if (req.body.status != null) {
			endDate = req.body.status == OrderStatus.Delivered ? new Date() : null
		}

		if (req.body.payment_method) {
			paymentDate = req.body.payment_method == PaymentMethod.NotPaid ? null : new Date()
		}

		const [updatedOrder, stageResult] = await prisma.$transaction(async (prisma: any) => {
			const order = await prisma.order.update({
				where: {
					id: req.params.id,
				},
				data: {
					status: req.body.status,
					payment_method: req.body.payment_method,
					end_date: endDate,
					payment_date: paymentDate,
				},
			})

			if (!order.exchange_rate && order.status && order.status > OrderStatus.ProcessedInTbilisi) {
				const settings = await prisma.setting.findFirst()

				await prisma.order.update({
					where: {
						id: req.params.id,
					},
					data: {
						exchange_rate: settings.exchange_rate,
					},
				})
			}

			const stageResult = await processStage(prisma, order)
			const updatedOrder = await getOrder(prisma, req.params.id)

			return [updatedOrder, stageResult]
		})

		if (req.body.send_notification) {
			sendStageUpdateMessage({
				tgId: updatedOrder.user!.tg_id,
				orderCode: updatedOrder.code,
				orderStatus: updatedOrder.status,
				weight: updatedOrder.weight,
				deliveryPrice: updatedOrder.current_price,
				ponyPrice: updatedOrder.partner_cost,
				exchangeRate: updatedOrder.exchange_rate,
				partnerTrackNumber: updatedOrder.partner_track_number,
			})

			if (stageResult?.cashback) {
				sendCashbackAppliedMessage({
					tgId: stageResult.tg_id,
					orderCode: stageResult.orderCode,
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
			const orders = await Promise.all(
				patches.map((patch) =>
					prisma.order.update({
						where: {
							id: patch.id,
						},
						data: {
							status: patch.status,
							end_date: patch.status == OrderStatus.Delivered ? new Date() : null,
						},
					})
				)
			)

			const settings = await prisma.setting.findFirst()

			for (const order of orders) {
				if (!order.exchange_rate && order.status && order.status > OrderStatus.ProcessedInTbilisi) {
					await prisma.order.update({
						where: {
							id: order.id,
						},
						data: {
							exchange_rate: settings.exchange_rate,
						},
					})
				}
			}

			const stageResults = await processStages(prisma, orders)

			const updatedOrders = await getOrders(
				prisma,
				patches.map((patch) => patch.id)
			)

			return [updatedOrders, stageResults]
		})

		if (req.body.send_notification) {
			const orderRecepients: OrderRecepient[] = updatedOrders.map((order: Order) => ({
				tgId: order.user!.tg_id,
				orderCode: order.code,
				orderStatus: order.status,
				weight: order.weight,
				deliveryPrice: order.current_price,
				ponyPrice: order.partner_cost,
				exchangeRate: order.exchange_rate,
				partnerTrackNumber: order.partner_track_number,
			}))

			sendStageUpdateMessages(orderRecepients)

			const cashbackRecepients: CashbackRecepient[] = stageResults
				.filter((result: StageResult) => result.cashback)
				.map((result: StageResult) => {
					return {
						tgId: result.tgId,
						orderCode: result.orderCode,
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

		if (result) {
			results.push(result)
		}
	}

	return results
}

async function processTransactions(prisma: any, order: Order) {
	if (order.status == OrderStatus.Delivered) {
		const orderTransactions = await prisma.transaction.findMany({
			where: {
				order_id: order.id,
			},
		})

		const user: User = await prisma.user.findUnique({
			where: {
				id: order.user_id,
			},
			include: {
				pending_bonuses_from: {
					include: {
						to_user: true,
					},
				},
			},
		})

		const result: StageResult = {
			tgId: user.tg_id,
			orderCode: order.code,
			cashback: null,
		}

		if (orderTransactions.length === 0) {
			const cashbackMultiplier = order.weight.lessThan(5) ? 0.05 : order.weight.lessThan(10) ? 0.07 : 0.1

			const cashback = order.original_price.mul(cashbackMultiplier)
			const newBalance = user.balance.add(cashback)

			await prisma.transaction.create({
				data: {
					id: randomUUID(),
					amount: cashback,
					order_id: order.id,
					user_id: order.user_id,
					type: TransactionType.Deposit,
					reason: `Кешбэк начислен за заказ #${order.code}`,
				},
			})

			await prisma.order.update({
				where: {
					id: order.id,
				},
				data: {
					bonus_received: cashback,
				},
			})

			await prisma.user.update({
				where: {
					id: order.user_id,
				},
				data: {
					balance: newBalance,
				},
			})

			result.cashback = cashback
		}

		if (user.pending_bonuses_from.length > 0) {
			const pendingBonus = user.pending_bonuses_from[0]
			const newBalance = pendingBonus.to_user.balance.add(pendingBonus.amount)

			await prisma.transaction.create({
				data: {
					id: randomUUID(),
					amount: pendingBonus.amount,
					user_id: pendingBonus.to_user.id,
					type: TransactionType.Deposit,
					reason: `Бонус начислен за первый завершенный заказ друга #${order.code}`,
				},
			})

			await prisma.user.update({
				where: {
					id: pendingBonus.to_user_id,
				},
				data: {
					balance: newBalance,
				},
			})

			await prisma.pending_bonus.delete({
				where: {
					id: pendingBonus.id,
				},
			})
		}

		return result
	}
}

export default router
