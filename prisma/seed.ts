import { OrderStatusGeRu, PrismaClient } from '@prisma/client'
import { OrderStatus } from '../src/enums/OrderStatus'
const prisma = new PrismaClient()

async function main() {
	await fillCityTable()
	await fillDeliveryProviderTable()
	await fillOrderStatusTable()
	await fillOrderTypeTable()
	await fillMessageTable()
	await fillTransactionTypeTable()
	await fillMessageGeRuTable()
}

async function fillCityTable() {
	await prisma.city.upsert({
		where: { name: 'Other' },
		update: {},
		create: {
			id: 0,
			name: 'Other',
		},
	})

	await prisma.city.upsert({
		where: { name: 'Tbilisi' },
		update: {},
		create: {
			id: 1,
			name: 'Tbilisi',
		},
	})

	await prisma.city.upsert({
		where: { name: 'Batumi' },
		update: {},
		create: {
			id: 2,
			name: 'Batumi',
		},
	})

	await prisma.city.upsert({
		where: { name: 'Borjomi' },
		update: {},
		create: {
			id: 3,
			name: 'Borjomi',
		},
	})

	await prisma.city.upsert({
		where: { name: 'Rustavi' },
		update: {},
		create: {
			id: 4,
			name: 'Rustavi',
		},
	})

	await prisma.city.upsert({
		where: { name: 'Mtskheta' },
		update: {},
		create: {
			id: 5,
			name: 'Mtskheta',
		},
	})

	await prisma.city.upsert({
		where: { name: 'Kobuleti' },
		update: {},
		create: {
			id: 6,
			name: 'Kobuleti',
		},
	})
}

async function fillDeliveryProviderTable() {
	await prisma.delivery_provider.upsert({
		where: { name: 'Ozon' },
		update: {},
		create: {
			id: 0,
			name: 'Ozon',
		},
	})

	await prisma.delivery_provider.upsert({
		where: { name: 'Wildberries' },
		update: {},
		create: {
			id: 1,
			name: 'Wildberries',
		},
	})

	await prisma.delivery_provider.upsert({
		where: { name: 'CDEK' },
		update: {},
		create: {
			id: 2,
			name: 'CDEK',
		},
	})

	await prisma.delivery_provider.upsert({
		where: { name: 'PostRussia' },
		update: {},
		create: {
			id: 3,
			name: 'PostRussia',
		},
	})

	await prisma.delivery_provider.upsert({
		where: { name: 'Boxberry' },
		update: {},
		create: {
			id: 4,
			name: 'Boxberry',
		},
	})

	await prisma.delivery_provider.upsert({
		where: { name: 'POST5' },
		update: {},
		create: {
			id: 5,
			name: 'POST5',
		},
	})

	await prisma.delivery_provider.upsert({
		where: { name: 'DPD' },
		update: {},
		create: {
			id: 6,
			name: 'DPD',
		},
	})

	await prisma.delivery_provider.upsert({
		where: { name: 'Cold' },
		update: {},
		create: {
			id: 7,
			name: 'Cold',
		},
	})

	await prisma.delivery_provider.upsert({
		where: { name: 'AptekaRu' },
		update: {},
		create: {
			id: 8,
			name: 'AptekaRu',
		},
	})
}

async function fillOrderStatusTable() {
	await prisma.order_status.upsert({
		where: { name: 'New' },
		update: {},
		create: {
			id: 0,
			name: 'New',
		},
	})

	await prisma.order_status.upsert({
		where: { name: 'WarehouseRF' },
		update: {},
		create: {
			id: 1,
			name: 'WarehouseRF',
		},
	})

	await prisma.order_status.upsert({
		where: { name: 'Courier1' },
		update: {},
		create: {
			id: 2,
			name: 'Courier1',
		},
	})

	await prisma.order_status.upsert({
		where: { name: 'Courier2' },
		update: {},
		create: {
			id: 3,
			name: 'Courier2',
		},
	})

	await prisma.order_status.upsert({
		where: { name: 'Waiting' },
		update: {},
		create: {
			id: 4,
			name: 'Waiting',
		},
	})

	await prisma.order_status.upsert({
		where: { name: 'ProcessedInTbilisi' },
		update: {},
		create: {
			id: 5,
			name: 'ProcessedInTbilisi',
		},
	})

	await prisma.order_status.upsert({
		where: { name: 'ReadyForDeliveryInTbilisi' },
		update: {},
		create: {
			id: 6,
			name: 'ReadyForDeliveryInTbilisi',
		},
	})

	await prisma.order_status.upsert({
		where: { name: 'WarehouseTbilisi' },
		update: {},
		create: {
			id: 7,
			name: 'WarehouseTbilisi',
		},
	})

	await prisma.order_status.upsert({
		where: { name: 'ReadyForDeliveryByPony' },
		update: {},
		create: {
			id: 8,
			name: 'ReadyForDeliveryByPony',
		},
	})

	await prisma.order_status.upsert({
		where: { name: 'WaitingForDeliveryByPony' },
		update: {},
		create: {
			id: 9,
			name: 'WaitingForDeliveryByPony',
		},
	})

	await prisma.order_status.upsert({
		where: { name: 'Delivered' },
		update: {},
		create: {
			id: 10,
			name: 'Delivered',
		},
	})
}

async function fillOrderTypeTable() {
	await prisma.order_type.upsert({
		where: { name: 'Drugs' },
		update: {},
		create: {
			id: 0,
			name: 'Drugs',
		},
	})

	await prisma.order_type.upsert({
		where: { name: 'Electronics' },
		update: {},
		create: {
			id: 1,
			name: 'Electronics',
		},
	})

	await prisma.order_type.upsert({
		where: { name: 'Commercial' },
		update: {},
		create: {
			id: 2,
			name: 'Commercial',
		},
	})
}

async function fillMessageTable() {
	await prisma.message.upsert({
		where: { order_status: OrderStatus.New },
		update: {},
		create: {
			id: 0,
			name: 'Новый заказ',
			text: `<b>Ваш заказ #{{orderCode}} принят!</b>
  
Когда у всех ваших товаров будет статус <b>Готов к выдаче</b>, отправляйте нам данные для получения посылки прямо в этот чат
  
Даты отправок из Владикавказа мы публикуем <a href="https://t.me/beezon_logistic/234"><b>здесь</b></a>
  
<b>ВАЖНО:</b>
Курьеры могут снять заводскую упаковку товаров для упрощения прохождения таможни. Если для каких-либо товаров важно сохранить упаковку, укажите это при отправке штрих-кода
  
<b>P.S. Если будут вопросы - пишите, мы всегда на связи</b> 💙`,
			order_status: OrderStatus.New,
		},
	})

	await prisma.message.upsert({
		where: { order_status: OrderStatus.ReadyForDeliveryInTbilisi },
		update: {},
		create: {
			id: 1,
			name: 'Рассылка Тбилиси',
			text: `<b>Здравствуйте, ваш заказ приехал в Тбилиси! 🎉</b>
    
Вес посылки - <b>{{weight}} кг</b>
Стоимость доставки до Грузии:
<b>{{deliveryPrice}} GEL</b>

Если хотите оплатить в рублях, то курс золотой короны на сегодня:
<b>1 GEL = {{exchangeRate}} RUB</b>

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

<b>Расписание указано на ближайшие дни, если планируете забрать в другой день - можете уточнить день/время в чате дополнительно</b>`,
			order_status: OrderStatus.ReadyForDeliveryInTbilisi,
		},
	})

	await prisma.message.upsert({
		where: { order_status: OrderStatus.ReadyForDeliveryByPony },
		update: {},
		create: {
			id: 2,
			name: 'Рассылка PONY',
			text: `<b>Здравствуйте, ваш заказ приехал в Тбилиси! 🎉</b>
    
Вес посылки - <b>{{weight}} кг</b>
Стоимость доставки до Грузии:
<b>{{deliveryPrice}} GEL</b>
 
Стоимость доставки посылки в ваш город через <b>курьерскую службу Pony Express</b> составит <b>{{ponyPrice}} GEL</b>
  
Если хотите оплатить в рублях, то курс золотой короны на сегодня:
<b>1 GEL = {{exchangeRate}} RUB</b>
  
<b>Как оплатить заказ:</b>
  
<b>▫️ Наличными в пункте выдачи</b>
<b>▫️ СБП:</b> +79168506929 (строго Тинькофф, Анна Ж.)
<b>▫️ Перевод на карту TBC:</b> GE31TB7788236010100040 (Anna Zelezniakova)
  
❗ <b>После оплаты отправьте нам чек / скриншот</b>
  
Оплатить курьера Pony Express нужно заранее, перед отправкой посылки в ваш город (по реквизитам, указанным выше)
  
Время в пути: <b>1-2 рабочих дня</b> (в выходные сервис не работает)
  
<b>Напишите, пожалуйста, актуальные данные для отправки посылки:</b>
- ФИО
- Адрес и номер телефона получателя`,
			order_status: OrderStatus.ReadyForDeliveryByPony,
		},
	})
}

async function fillMessageGeRuTable() {
	await prisma.message_ge_ru.upsert({
		where: {
			order_status: OrderStatusGeRu.InvoiceCreated,
		},
		update: {},
		create: {
			id: 0,
			name: 'Создана накладная',
			text: `<b>Заказ #{{orderCode}} на доставку из Грузии в Россию оформлен!</b> 

Трек-номер отправления: <code>{{orderTrackNumber}}</code> 

Следить за статусом можно <a href="https://www.cdek.ru/m/order/{{orderTrackNumber}}"><b>здесь</b></a> 
или в <a href="https://onelink.to/gjy7d2"><b>мобильном приложении</b></a>

<b>Мы сообщим, когда посылка будет передана в СДЭК для отправки</b>`,
			order_status: OrderStatusGeRu.InvoiceCreated,
		},
	})

	await prisma.message_ge_ru.upsert({
		where: {
			order_status: OrderStatusGeRu.DrivingInRf,
		},
		update: {},
		create: {
			id: 1,
			name: 'Поехало внутри РФ',
			text: `<b>Ваша посылка #<code>{{orderTrackNumber}}</code> в пути!</b> 

Следить за статусом можно <a href="https://www.cdek.ru/m/order/{{orderTrackNumber}}"><b>здесь</b></a> 
или в <a href="https://onelink.to/gjy7d2"><b>мобильном приложении</b></a> 

После получения заказа будем рады любой обратной связи по качеству доставки - это помогает нам становиться лучше`,
			order_status: OrderStatusGeRu.DrivingInRf,
		},
	})
}

async function fillTransactionTypeTable() {
	await prisma.transaction_type.upsert({
		where: {
			name: 'Deposit',
		},
		update: {},
		create: {
			id: 0,
			name: 'Deposit',
		},
	})

	await prisma.transaction_type.upsert({
		where: {
			name: 'Withdrawal',
		},
		update: {},
		create: {
			id: 1,
			name: 'Withdrawal',
		},
	})
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
