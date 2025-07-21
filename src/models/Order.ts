import { Decimal } from '@prisma/client/runtime/library'
import { OrderStatus } from '../enums/OrderStatus'
import { City } from '../enums/City'
import { User } from './User'
import { OrderTypeMapping } from './OrderTypeMapping'
import { OrderTrack } from './OrderTrack'

export interface Order {
	id: string
	date: Date
	end_date?: Date
	original_price: Decimal
	current_price: Decimal
	status: OrderStatus
	bonus_received: Decimal
	user_id: string
	code: number
	city: City
	weight: Decimal
	weight_rounded: boolean
	additional_cost: Decimal
	partner_cost: Decimal
	description: string
	user?: User
	exchange_rate?: Decimal
	order_type_mappings: OrderTypeMapping[]
	order_tracks: OrderTrack[]
}
