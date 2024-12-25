import { Decimal } from '@prisma/client/runtime/library'
import { OrderStatus } from '../enums/OrderStatus'

export interface OrderRecepient {
  tgUsername: string
  orderCode: number
  orderStatus: OrderStatus
  weight: Decimal
  deliveryPrice: Decimal
  ponyPrice: Decimal
}
