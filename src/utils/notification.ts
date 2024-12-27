import { Api, TelegramClient } from 'telegram'
import { setTimeout } from 'timers/promises'
import { OrderStatus } from '../enums/OrderStatus'
import { Decimal } from '@prisma/client/runtime/library'
import { log } from './log'
import { randomUUID } from 'crypto'
import { LogLevel } from '../models/log.model'
import Handlebars from 'handlebars'
import { OrderRecepient } from '../models/OrderRecepient'
import { delay } from './delay'
import { CashbackRecepient } from '../models/CashbackRecepient'
import { PrismaClient } from '@prisma/client'
import tgClient from './tgClient'

const prisma = new PrismaClient()

export async function sendStageUpdateMessages(orderRecepients: OrderRecepient[]) {
  for (const orderRecepient of orderRecepients) {
    await sendStageUpdateMessage(orderRecepient)
    await delay(5000)
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
      await sendMessage(orderRecepient.tgUsername, message, orderRecepient.orderCode)
    }
  } catch (ex) {
    const extra = {
      tgUsername: orderRecepient.tgUsername,
      orderCode: orderRecepient.orderCode,
      orderStatus: orderRecepient.orderStatus,
      exception: ex,
    }

    await log(randomUUID(), LogLevel.ERROR, "Couldn't send a stage update notification.", extra)
  }
}

export async function sendBonusAppliedMessage(tgUsername: string, orderCode: number, newPrice: Decimal) {
  try {
    const message = `Бонусные баллы применены для заказа #${orderCode}! Новая стоимость доставки: ${newPrice} ₾`
    await sendMessage(tgUsername, message, orderCode)
  } catch (ex) {
    const extra = {
      tgUsername,
      orderCode,
      exception: ex,
    }

    await log(randomUUID(), LogLevel.ERROR, "Couldn't send a bonus applied notification.", extra)
  }
}

export async function sendCashbackAppliedMessages(cashbackRecepients: CashbackRecepient[]) {
  for (const cashbackRecepient of cashbackRecepients) {
    await sendCashbackAppliedMessage(cashbackRecepient)
    await delay(5000)
  }
}

export async function sendCashbackAppliedMessage(cashbackRecepient: CashbackRecepient) {
  try {
    const message = `На ваш баланс начислен кэшбек: +${cashbackRecepient.cashback} ₾`
    await sendMessage(cashbackRecepient.tgUsername, message, cashbackRecepient.orderCode)
  } catch (ex) {
    const extra = {
      tgUsername: cashbackRecepient.tgUsername,
      orderCode: cashbackRecepient.orderCode,
      exception: ex,
    }

    await log(randomUUID(), LogLevel.ERROR, "Couldn't send a bonus applied notification.", extra)
  }
}

export async function sendMessage(tgUsername: string, message: string, orderCode: number) {
  await tgClient.invoke(
    new Api.messages.SetTyping({
      peer: await tgClient.getInputEntity(tgUsername),
      action: new Api.SendMessageTypingAction(),
    })
  )

  await setTimeout(1000)
  await tgClient.sendMessage(tgUsername, { message: message, parseMode: 'html', linkPreview: false })
}
