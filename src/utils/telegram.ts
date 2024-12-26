import { StringSession } from 'telegram/sessions'
import { TelegramClient } from 'telegram'
import { Api } from 'telegram'
import { setTimeout } from 'timers/promises'
import readline from 'readline'
import { OrderStatus } from '../enums/OrderStatus'
import { Decimal } from '@prisma/client/runtime/library'
import { log } from './log'
import { randomUUID } from 'crypto'
import { LogLevel } from '../models/log.model'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import Handlebars from 'handlebars'
import { OrderRecepient } from '../models/OrderRecepient'
import { delay } from './delay'
import { CashbackRecepient } from '../models/CashbackRecepient'

const prisma = new PrismaClient()
const tgApiId = Number(process.env.TG_API_ID)
const tgApiHash = String(process.env.TG_API_HASH)
const sessionFile = 'data/session.txt'
const stringSession = new StringSession(fs.existsSync(sessionFile) ? fs.readFileSync(sessionFile).toString() : '')

const tgClient = new TelegramClient(stringSession, tgApiId, tgApiHash, {
  connectionRetries: 3,
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

tgClient
  .start({
    phoneNumber: async () => new Promise((resolve) => rl.question('Please enter your number: ', resolve)),
    password: async () => new Promise((resolve) => rl.question('Please enter your password: ', resolve)),
    phoneCode: async () => new Promise((resolve) => rl.question('Please enter the code you received: ', resolve)),
    onError: (err) => console.log(err),
  })
  .then((result) => {
    fs.writeFileSync(sessionFile, stringSession.save())
  })

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

async function sendMessage(tgUsername: string, message: string, orderCode: number) {
  await tgClient.invoke(
    new Api.messages.SetTyping({
      peer: await tgClient.getInputEntity(tgUsername),
      action: new Api.SendMessageTypingAction(),
    })
  )

  await setTimeout(1000)
  await tgClient.sendMessage(tgUsername, { message: message, parseMode: 'html', linkPreview: false })
}
