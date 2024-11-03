import express from 'express'
import { PrismaClient } from '@prisma/client'
import httpStatusCodes from '../../constants/httpStatusCodes'
import axios from 'axios'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions'
import readline from 'readline'
import { Api } from 'telegram'
import { setTimeout } from 'timers/promises'
import { customAlphabet } from 'nanoid'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()
const router = express.Router()

const tgApiId = Number(process.env.TG_API_ID)
const tgApiHash = String(process.env.TG_API_HASH)
const bitrixSecret = process.env.BITRIX_SECRET
const bitrixApiUrl = `https://beezonlogistics.bitrix24.ru/rest/12/${bitrixSecret}`

const stringSession = new StringSession('')
const tgClient = new TelegramClient(stringSession, tgApiId, tgApiHash, {
  connectionRetries: 3,
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const nanoid = customAlphabet(alphabet, 12)

router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany()

    res.json(orders)
  } catch (ex) {
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

router.post('/', async (req, res) => {
  try {
    const orderId = Number(req.body.data.FIELDS.ID)

    const order = (
      await axios.get(`${bitrixApiUrl}/crm.deal.get.json`, {
        params: {
          id: orderId,
        },
      })
    ).data.result

    let tgUsername: string = order.UF_CRM_1725361131
    tgUsername = tgUsername.replace(/^@/, '')

    const stageId = order.STAGE_ID
    const trackId = order.UF_CRM_1725480982977
    const weight = order.UF_CRM_1686476646301
    const deliveryPrice = order.OPPORTUNITY
    const ponyPrice = order.UF_CRM_1726179898048

    if (stageId == 'NEW') {
      const contactId = order.CONTACT_ID
      const date = order.DATE_CREATE

      const contact = (
        await axios.get(`${bitrixApiUrl}/crm.contact.get.json`, {
          params: {
            id: contactId,
          },
        })
      ).data.result

      const [dbUser, dbOrder] = await prisma.$transaction(async (prisma) => {
        const user = await prisma.user.upsert({
          where: {
            tg_username: tgUsername,
          },
          update: {},
          create: {
            id: randomUUID(),
            first_name: contact.NAME,
            last_name: contact.LAST_NAME,
            phone_nr: contact.PHONE[0].VALUE,
            tg_username: tgUsername,
            referral_code: nanoid(),
          },
        })

        const order = await prisma.order.create({
          data: {
            id: randomUUID(),
            date: date,
            user_id: user.id,
            code: orderId,
          },
        })

        return [user, order]
      })
    }

    await sendUserMessage(tgUsername, orderId, stageId, trackId, weight, deliveryPrice, ponyPrice)
    res.sendStatus(httpStatusCodes.ok)
  } catch (ex) {
    console.log(ex)
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

async function sendUserMessage(
  tgUsername: string,
  orderId: number,
  stageId: string,
  trackId: string,
  weight: string,
  deliveryPrice: string,
  ponyPrice: string
) {
  let message = ''

  switch (stageId) {
    case 'NEW':
      message = `**Ваш заказ #${orderId} принят!**

Когда у всех ваших товаров будет статус **Готов к выдаче**, отправляйте нам данные для получения посылки прямо в этот чат

Даты отправок из Владикавказа мы публикуем **[здесь](https://t.me/beezon_logistic/234)**

**ВАЖНО:**
Курьеры могут снять заводскую упаковку товаров для упрощения прохождения таможни. Если для каких-либо товаров важно сохранить упаковку, укажите это при отправке штрих-кода

**P.S. Если будут вопросы - пишите, мы всегда на связи** 💙`
      break
    case 'UC_ZFPBJQ':
      message = `**Здравствуйте, ваш заказ приехал в Тбилиси! 🎉** 

Вес посылки - **${weight} кг**
Стоимость доставки до Грузии:
**${deliveryPrice} GEL** 

Если хотите оплатить в рублях, то курс золотой короны на сегодня:
**1 GEL = 37.17 RUB** 

**Как оплатить заказ:**
**Как получить посылку:**

**1) __Самовывоз из пункта выдачи:__**
\`проспект Акакия Церетели, 12\` (внутренний двор, помещение между 2 и 3 подъездом)

**Координаты**: \`41.726578\`, \`44.788383\`
📍**[Cсылка на локацию в яндекс картах](https://yandex.com.ge/maps/-/CDasmA-l)**
📍**[Ссылка на локацию в гугл картах](https://maps.app.goo.gl/JzBDVGSZ6hKqaPNw8)**

**2) __Доставка яндекс курьером:__**
Если выбираете этот способ, напишите, отправим вам инструкцию по вызову курьера

**Забрать посылку самостоятельно или вызвать курьера можно:**
**Сегодня (24.10)** до 19:00
**Завтра (25.10)** с 12 до 18:00
**Суббота (26.10)** с 12 до 18:00

**Расписание указано на ближайшие дни, если планируете забрать в другой день - можете уточнить день/время в чате дополнительно**`
      break
    case 'UC_9D298A':
      message = `**Здравствуйте, ваш заказ приехал в Тбилиси! 🎉** 

Вес посылки - **${weight} кг**
Стоимость доставки до Грузии:
**${deliveryPrice} GEL** 

Стоимость доставки посылки в ваш город через **курьерскую службу Pony Express** составит **${ponyPrice} GEL** 

Если хотите оплатить в рублях, то курс золотой короны на сегодня:
**1 GEL = 37.17 RUB** 

**__Оплатить заказ можно переводом на одну из карт__** 💳 (номер копируется при однократном нажатии)

**Тинькофф**: \`2200700116194043\` (Анна Ж.)
**TBC**: \`GE54TB7867136010100046\` (Aleksandr Volodin)

❗ **После оплаты отправьте нам чек / скриншот** 

Оплатить курьера Pony Express нужно заранее, перед отправкой посылки в ваш город (по реквизитам, указанным выше) 

Время в пути: **1-2 рабочих дня** (в выходные сервис не работает) 

**Напишите, пожалуйста, актуальные данные для отправки посылки:**
- ФИО
- Адрес и номер телефона получателя`
      break
    case 'C4:PREPARATION':
      message = `**Заказ #${orderId} на доставку из Грузии в Россию оформлен!**

**Трек-номер отправления: **\`${trackId}\`

Следить за статусом можно **[здесь](https://www.cdek.ru/m/order/${trackId})** или в **[мобильном приложении](https://onelink.to/gjy7d2)**

**Мы сообщим, когда посылка будет передана в СДЭК для отправки**`
      break
    case 'C4:EXECUTING':
      message = `**Ваша посылка \`${trackId}\` в пути!**

Следить за статусом можно **[здесь](https://www.cdek.ru/m/order/${trackId})** или в **[мобильном приложении](https://onelink.to/gjy7d2)**

**После получения заказа будем рады любой обратной связи по качеству доставки - это помогает нам становиться лучше`
      break
  }

  await tgClient.start({
    phoneNumber: async () => new Promise((resolve) => rl.question('Please enter your number: ', resolve)),
    password: async () => new Promise((resolve) => rl.question('Please enter your password: ', resolve)),
    phoneCode: async () => new Promise((resolve) => rl.question('Please enter the code you received: ', resolve)),
    onError: (err) => console.log(err),
  })

  tgClient.session.save()

  if (tgUsername && message) {
    await tgClient.invoke(
      new Api.messages.SetTyping({
        peer: await tgClient.getInputEntity(tgUsername),
        action: new Api.SendMessageTypingAction(),
      })
    )

    await setTimeout(1000)
    await tgClient.sendMessage(tgUsername, { message: message, parseMode: 'markdown' })
  }
}

export default router
