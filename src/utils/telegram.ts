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

const tgApiId = Number(process.env.TG_API_ID)
const tgApiHash = String(process.env.TG_API_HASH)
const sessionFile = 'session.txt'
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

export async function sendStageUpdateMessage(
  tgUsername: string,
  orderCode: number,
  orderStatus: OrderStatus,
  weight: Decimal,
  deliveryPrice: Decimal,
  ponyPrice: Decimal
) {
  try {
    let message = ''

    switch (orderStatus) {
      case OrderStatus.New:
        message = `<b>Ваш заказ #${orderCode} принят!</b>
  
  Когда у всех ваших товаров будет статус <b>Готов к выдаче</b>, отправляйте нам данные для получения посылки прямо в этот чат
  
  Даты отправок из Владикавказа мы публикуем <a href="https://t.me/beezon_logistic/234"><b>здесь</b></a>
  
  <b>ВАЖНО:</b>
  Курьеры могут снять заводскую упаковку товаров для упрощения прохождения таможни. Если для каких-либо товаров важно сохранить упаковку, укажите это при отправке штрих-кода
  
  <b>P.S. Если будут вопросы - пишите, мы всегда на связи</b> 💙`
        break
      case OrderStatus.ReadyForDeliveryInTbilisi:
        message = `<b>Здравствуйте, ваш заказ приехал в Тбилиси! 🎉</b>
  
  Вес посылки - <b>${weight} кг</b>
  Стоимость доставки до Грузии:
  <b>${deliveryPrice} GEL</b>
  
  Если хотите оплатить в рублях, то курс золотой короны на сегодня:
  <b>1 GEL = 41 RUB</b>
  
  <b>Как оплатить заказ:</b>
  
  <b>▫️ Наличными в пункте выдачи</b>
  <b>▫️ СБП:</b> +79168506929 (строго Тинькофф, Анна Ж.)
  <b>▫️ Перевод на карту TBC:</b> GE31TB7788236010100040 (Anna Zelezniakova)
  
  ❗ <b>После оплаты отправьте нам чек / скриншот</b> 
  
  <b>Как получить посылку:</b>
  
  <b>1) __Самовывоз из пункта выдачи:__</b>
  проспект Акакия Церетели, 12 (внутренний двор, помещение между 2 и 3 подъездом)
  
  <b>Координаты:</b> 41.726578, 44.788383
  📍<a href="https://yandex.com.ge/maps/-/CDasmA-l"><b>Cсылка на локацию в яндекс картах</b></a>
  📍<a href="https://maps.app.goo.gl/JzBDVGSZ6hKqaPNw8"><b>Ссылка на локацию в гугл картах</b></a>
  
  <b>2) __Доставка яндекс курьером:__</b>
  Если выбираете этот способ, напишите, отправим вам инструкцию по вызову курьера
  
  <b>Забрать посылку самостоятельно или вызвать курьера можно:</b>
  <b>Воскресенье (01.12)</b> с 12 до 16:00
  <b>Пн (02.12) - Пт (06.12)</b> с 12 до 18:00
  <b>Суббота (07.12)</b> с 12 до 16:00
  <b>Воскресенье (08.12)</b> выходной
  
  <b>Расписание указано на ближайшие дни, если планируете забрать в другой день - можете уточнить день/время в чате дополнительно</b>`
        break
      case OrderStatus.ReadyForDeliveryByPony:
        message = `<b>Здравствуйте, ваш заказ приехал в Тбилиси! 🎉</b>
  
  Вес посылки - <b>${weight} кг</b>
  Стоимость доставки до Грузии:
  <b>${deliveryPrice} GEL</b>
  
  Стоимость доставки посылки в ваш город через <b>курьерскую службу Pony Express</b> составит <b>${ponyPrice} GEL</b>
  
  Если хотите оплатить в рублях, то курс золотой короны на сегодня:
  <b>1 GEL = 41 RUB</b>
  
  <b>Как оплатить заказ:</b>
  
  <b>▫️ Наличными в пункте выдачи</b>
  <b>▫️ СБП:</b> +79168506929 (строго Тинькофф, Анна Ж.)
  <b>▫️ Перевод на карту TBC:</b> GE31TB7788236010100040 (Anna Zelezniakova)
  
  ❗ <b>После оплаты отправьте нам чек / скриншот</b>
  
  Оплатить курьера Pony Express нужно заранее, перед отправкой посылки в ваш город (по реквизитам, указанным выше)
  
  Время в пути: <b>1-2 рабочих дня</b> (в выходные сервис не работает)
  
  <b>Напишите, пожалуйста, актуальные данные для отправки посылки:</b>
  - ФИО
  - Адрес и номер телефона получателя`
        break
    }

    if (tgUsername && message) {
      await tgClient.invoke(
        new Api.messages.SetTyping({
          peer: await tgClient.getInputEntity(tgUsername),
          action: new Api.SendMessageTypingAction(),
        })
      )

      await setTimeout(1000)
      await tgClient.sendMessage(tgUsername, { message: message, parseMode: 'html', linkPreview: false })
    }
  } catch (ex) {
    const extra = {
      tgUsername,
      orderCode,
      orderStatus,
      exception: ex,
    }
    await log(randomUUID(), LogLevel.ERROR, "Couldn't send a notification.", extra)
  }
}
