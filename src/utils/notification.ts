import { setTimeout } from 'timers/promises'
import { Decimal } from '@prisma/client/runtime/library'
import { log } from './log'
import { randomUUID } from 'crypto'
import { LogLevel } from '../models/log.model'
import Handlebars from 'handlebars'
import { OrderRecepient, OrderRecepientGeRu } from '../models/OrderRecepient'
import { CashbackRecepient } from '../models/CashbackRecepient'
import { PrismaClient } from '@prisma/client'
import tgClient from './tgClient'
import { getErrorData } from './error'

const prisma = new PrismaClient()

export async function sendStageUpdateMessages(orderRecepients: OrderRecepient[]) {
	for (const orderRecepient of orderRecepients) {
		await sendStageUpdateMessage(orderRecepient)
		await setTimeout(5000)
	}
}

export async function sendStageUpdateGeRuMessages(orderRecepients: OrderRecepientGeRu[]) {
	for (const orderRecepient of orderRecepients) {
		await sendStageUpdateGeRuMessage(orderRecepient)
		await setTimeout(5000)
	}
}

export async function sendStageUpdateMessage(orderRecepient: OrderRecepient) {
	try {
		const templateText = (await prisma.message.findUnique({ where: { order_status: orderRecepient.orderStatus } }))
			?.text

		if (!templateText) {
			return
		}

		const template = Handlebars.compile(templateText)

		const message = template({
			orderCode: orderRecepient.orderCode,
			weight: orderRecepient.weight,
			deliveryPrice: orderRecepient.deliveryPrice,
			deliveryPriceRub:
				orderRecepient.deliveryPrice != null && orderRecepient.exchangeRate != null
					? orderRecepient.deliveryPrice.mul(orderRecepient.exchangeRate)
					: undefined,
			ponyPrice: orderRecepient.ponyPrice,
			exchangeRate: orderRecepient.exchangeRate,
			partnerTrackNumber: orderRecepient.partnerTrackNumber,
		})

		if (message) {
			await sendMessage(orderRecepient.tgId, message, orderRecepient.orderCode)
		}
	} catch (ex) {
		const error = ex as Error

		const extra = {
			tgId: orderRecepient.tgId,
			orderCode: orderRecepient.orderCode,
			orderStatus: orderRecepient.orderStatus,
			exception: getErrorData(error),
		}

		await log(randomUUID(), LogLevel.ERROR, "Couldn't send a stage update notification.", extra)
	}
}

export async function sendStageUpdateGeRuMessage(orderRecepient: OrderRecepientGeRu) {
	try {
		const templateText = (
			await prisma.message_ge_ru.findUnique({ where: { order_status: orderRecepient.orderStatus } })
		)?.text

		if (!templateText) {
			return
		}

		const template = Handlebars.compile(templateText)
		const message = template({ orderCode: orderRecepient.orderCode, orderTrackNumber: orderRecepient.cdekTrackNr })

		if (message) {
			await sendMessage(orderRecepient.tgId, message, orderRecepient.orderCode)
		}
	} catch (ex) {
		const error = ex as Error

		const extra = {
			tgId: orderRecepient.tgId,
			orderCode: orderRecepient.orderCode,
			orderStatus: orderRecepient.orderStatus,
			exception: getErrorData(error),
		}

		await log(randomUUID(), LogLevel.ERROR, "Couldn't send a stage update notification.", extra)
	}
}

export async function sendBonusAppliedMessage(tgId: string, orderCode: number, newPrice: Decimal) {
	try {
		const message = `Бонусные баллы применены для заказа #${orderCode}! Новая стоимость доставки: ${newPrice} ₾`
		await sendMessage(tgId, message, orderCode)
	} catch (ex) {
		const error = ex as Error

		const extra = {
			tgId,
			orderCode,
			exception: getErrorData(error),
		}

		await log(randomUUID(), LogLevel.ERROR, "Couldn't send a bonus applied notification.", extra)
	}
}

export async function sendCashbackAppliedMessages(cashbackRecepients: CashbackRecepient[]) {
	for (const cashbackRecepient of cashbackRecepients) {
		await sendCashbackAppliedMessage(cashbackRecepient)
		await setTimeout(5000)
	}
}

export async function sendCashbackAppliedMessage(cashbackRecepient: CashbackRecepient) {
	try {
		const message = `На ваш баланс начислен кэшбек: +${cashbackRecepient.cashback} ₾`
		await sendMessage(cashbackRecepient.tgId, message, cashbackRecepient.orderCode)
	} catch (ex) {
		const error = ex as Error

		const extra = {
			tgId: cashbackRecepient.tgId,
			orderCode: cashbackRecepient.orderCode,
			exception: getErrorData(error),
		}

		await log(randomUUID(), LogLevel.ERROR, "Couldn't send a bonus applied notification.", extra)
	}
}

export async function sendMessage(tgId: string, message: string, orderCode: number) {
	await tgClient.sendMessage(tgId, { message: message, parseMode: 'html', linkPreview: false })
}
