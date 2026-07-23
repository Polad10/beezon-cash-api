import { Decimal } from '@prisma/client/runtime/library'
import { OrderStatus } from '../enums/OrderStatus'
import { OrderStatusGeEu, OrderStatusGeRu } from '@prisma/client'

export interface OrderRecepient {
	tgId: string
	orderCode: number
	orderStatus: OrderStatus
	weight: Decimal
	deliveryPrice: Decimal
	ponyPrice: Decimal
	exchangeRate?: Decimal
	partnerTrackNumber?: string
}

export interface OrderRecepientGeRu {
	tgId: string
	orderCode: number
	orderStatus: OrderStatusGeRu
	cdekTrackNr: string
}

export interface OrderRecepientGeEu {
	tgId: string
	orderCode: number
	orderStatus: OrderStatusGeEu
	trackNr: string
}
