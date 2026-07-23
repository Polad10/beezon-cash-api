import { OrderStatusGeEu, PaymentMethod } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export interface OrderGeEuInput {
	id: string
	hint_price: string
	original_price?: Decimal
	current_price?: Decimal
	status?: OrderStatusGeEu
	user_id: string
	description?: string
	weight?: Decimal
	weight_rounded?: boolean
	receiver_name: string
	receiver_phone_nr: string
	receiver_address: string
	track_nr?: string
	created_at?: Date
	updated_at?: Date
	delivered_at?: Date
	payment_method?: PaymentMethod
	payment_date?: Date | null
}
