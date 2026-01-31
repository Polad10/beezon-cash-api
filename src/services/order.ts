import { Decimal } from '@prisma/client/runtime/library'
import { OrderStatus } from '../enums/OrderStatus'
import { City } from '../enums/City'
import { OrderTypeMapping } from '../models/OrderTypeMapping'
import { OrderTrack } from '../models/OrderTrack'
import { recreateOrderTypeMappings } from './orderTypeMapping'
import { recreateOrderTracks } from './orderTrack'
import { PaymentMethod } from '@prisma/client'

export interface Order {
	id: string
	end_date?: Date
	original_price?: Decimal
	current_price?: Decimal
	status?: OrderStatus
	bonus_received?: Decimal
	user_id: string
	city?: City
	weight?: Decimal
	weight_rounded?: boolean
	additional_cost?: Decimal
	partner_cost?: Decimal
	partner_track_number?: string
	description: string
	payment_method?: PaymentMethod
	payment_date?: Date | null
	exchange_rate?: Decimal
}

export async function createOrder(
	prisma: any,
	order: Order,
	order_type_mappings: OrderTypeMapping[],
	order_tracks: OrderTrack[],
) {
	if (!order.exchange_rate && order.status && order.status > OrderStatus.ProcessedInTbilisi) {
		const settings = await prisma.setting.findFirst()
		order.exchange_rate = settings.exchange_rate
	}

	const createdOrder = await prisma.order.create({
		data: order,
	})

	await recreateOrderTypeMappings(prisma, order_type_mappings, createdOrder.id)
	await recreateOrderTracks(prisma, order_tracks, createdOrder.id)

	return createdOrder
}
