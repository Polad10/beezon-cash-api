import { setTimeout } from 'timers/promises'
import { OrderStatus } from '../enums/OrderStatus'
import { Decimal } from '@prisma/client/runtime/library'
import { log } from './log'
import { randomUUID } from 'crypto'
import { LogLevel } from '../models/log.model'
import Handlebars from 'handlebars'
import { OrderRecepient } from '../models/OrderRecepient'
import { CashbackRecepient } from '../models/CashbackRecepient'
import { PrismaClient } from '@prisma/client'
import tgClient from './tgClient'

const prisma = new PrismaClient()

export async function sendStageUpdateMessages(orderRecepients: OrderRecepient[]) {
  for (const orderRecepient of orderRecepients) {
    await sendStageUpdateMessage(orderRecepient)
    await setTimeout(5000)
  }
}

export async function sendStageUpdateMessage(orderRecepient: OrderRecepient) {
  try {
    let message: string | undefined = undefined

    if (orderRecepient.orderStatus == OrderStatus.New) {
      const templateText = (await prisma.message.findUnique({ where: { order_status: OrderStatus.New } }))?.text
      const template = Handlebars.compile(templateText)
      message = template({ orderCode: orderRecepient.orderCode })
    } else if (orderRecepient.orderStatus == OrderStatus.ReadyForDeliveryInTbilisi) {
      const templateText = (
        await prisma.message.findUnique({ where: { order_status: OrderStatus.ReadyForDeliveryInTbilisi } })
      )?.text
      const template = Handlebars.compile(templateText)
      message = template({ weight: orderRecepient.weight, deliveryPrice: orderRecepient.deliveryPrice })
    } else if (orderRecepient.orderStatus == OrderStatus.ReadyForDeliveryByPony) {
      const templateText = (
        await prisma.message.findUnique({ where: { order_status: OrderStatus.ReadyForDeliveryByPony } })
      )?.text
      const template = Handlebars.compile(templateText)
      message = template({
        weight: orderRecepient.weight,
        deliveryPrice: orderRecepient.deliveryPrice,
        ponyPrice: orderRecepient.ponyPrice,
      })
    }

    if (message) {
      await sendMessage(orderRecepient.tgId, message, orderRecepient.orderCode)
    }
  } catch (ex) {
    const error = ex as Error

    const extra = {
      tgId: orderRecepient.tgId,
      orderCode: orderRecepient.orderCode,
      orderStatus: orderRecepient.orderStatus,
      ...error,
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
      ...error,
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
      ...error,
    }

    await log(randomUUID(), LogLevel.ERROR, "Couldn't send a bonus applied notification.", extra)
  }
}

export async function sendMessage(tgId: string, message: string, orderCode: number) {
  await tgClient.sendMessage(tgId, { message: message, parseMode: 'html', linkPreview: false })
}
