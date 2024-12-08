// import { StringSession } from 'telegram/sessions'
// import { TelegramClient } from 'telegram'
// import { Api } from 'telegram'
// import { setTimeout } from 'timers/promises'
// import readline from 'readline'
// import { OrderStatus } from '../enums/OrderStatus'
// import { Decimal } from '@prisma/client/runtime/library'

// const tgApiId = Number(process.env.TG_API_ID)
// const tgApiHash = String(process.env.TG_API_HASH)
// const stringSession = new StringSession('')

// const tgClient = new TelegramClient(stringSession, tgApiId, tgApiHash, {
//   connectionRetries: 3,
// })

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// })

// export async function sendUserMessage(
//   tgUsername: string,
//   orderCode: number,
//   orderStatus: OrderStatus,
//   weight: Decimal,
//   deliveryPrice: Decimal,
//   ponyPrice: Decimal
// ) {
//   let message = ''

//   switch (orderStatus) {
//     case OrderStatus.New:
//       message = `**Ваш заказ #${orderCode} принят!**

// Когда у всех ваших товаров будет статус **Готов к выдаче**, отправляйте нам данные для получения посылки прямо в этот чат

// Даты отправок из Владикавказа мы публикуем **[здесь](https://t.me/beezon_logistic/234)**

// **ВАЖНО:**
// Курьеры могут снять заводскую упаковку товаров для упрощения прохождения таможни. Если для каких-либо товаров важно сохранить упаковку, укажите это при отправке штрих-кода

// **P.S. Если будут вопросы - пишите, мы всегда на связи** 💙`
//       break
//     case OrderStatus.ArrivedInTbilisi:
//       message = `**Здравствуйте, ваш заказ приехал в Тбилиси! 🎉**

// Вес посылки - **${weight} кг**
// Стоимость доставки до Грузии:
// **${deliveryPrice} GEL**

// Если хотите оплатить в рублях, то курс золотой короны на сегодня:
// **1 GEL = 37.17 RUB**

// **Как оплатить заказ:**
// **Как получить посылку:**

// **1) __Самовывоз из пункта выдачи:__**
// \`проспект Акакия Церетели, 12\` (внутренний двор, помещение между 2 и 3 подъездом)

// **Координаты**: \`41.726578\`, \`44.788383\`
// 📍**[Cсылка на локацию в яндекс картах](https://yandex.com.ge/maps/-/CDasmA-l)**
// 📍**[Ссылка на локацию в гугл картах](https://maps.app.goo.gl/JzBDVGSZ6hKqaPNw8)**

// **2) __Доставка яндекс курьером:__**
// Если выбираете этот способ, напишите, отправим вам инструкцию по вызову курьера

// **Забрать посылку самостоятельно или вызвать курьера можно:**
// **Сегодня (24.10)** до 19:00
// **Завтра (25.10)** с 12 до 18:00
// **Суббота (26.10)** с 12 до 18:00

// **Расписание указано на ближайшие дни, если планируете забрать в другой день - можете уточнить день/время в чате дополнительно**`
//       break
//     case OrderStatus.ArrivedInDestination:
//       message = `**Здравствуйте, ваш заказ приехал в Тбилиси! 🎉**

// Вес посылки - **${weight} кг**
// Стоимость доставки до Грузии:
// **${deliveryPrice} GEL**

// Стоимость доставки посылки в ваш город через **курьерскую службу Pony Express** составит **${ponyPrice} GEL**

// Если хотите оплатить в рублях, то курс золотой короны на сегодня:
// **1 GEL = 37.17 RUB**

// **__Оплатить заказ можно переводом на одну из карт__** 💳 (номер копируется при однократном нажатии)

// **Тинькофф**: \`2200700116194043\` (Анна Ж.)
// **TBC**: \`GE54TB7867136010100046\` (Aleksandr Volodin)

// ❗ **После оплаты отправьте нам чек / скриншот**

// Оплатить курьера Pony Express нужно заранее, перед отправкой посылки в ваш город (по реквизитам, указанным выше)

// Время в пути: **1-2 рабочих дня** (в выходные сервис не работает)

// **Напишите, пожалуйста, актуальные данные для отправки посылки:**
// - ФИО
// - Адрес и номер телефона получателя`
//       break
//   }

//   await tgClient.start({
//     phoneNumber: async () => new Promise((resolve) => rl.question('Please enter your number: ', resolve)),
//     password: async () => new Promise((resolve) => rl.question('Please enter your password: ', resolve)),
//     phoneCode: async () => new Promise((resolve) => rl.question('Please enter the code you received: ', resolve)),
//     onError: (err) => console.log(err),
//   })

//   tgClient.session.save()

//   if (tgUsername && message) {
//     await tgClient.invoke(
//       new Api.messages.SetTyping({
//         peer: await tgClient.getInputEntity(tgUsername),
//         action: new Api.SendMessageTypingAction(),
//       })
//     )

//     await setTimeout(1000)
//     await tgClient.sendMessage(tgUsername, { message: message, parseMode: 'markdown' })
//   }
// }
