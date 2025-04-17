import { Decimal } from '@prisma/client/runtime/library'
import { OrderStatus } from '../enums/OrderStatus'
import { OrderStatusGeRu } from '@prisma/client'

export interface OrderRecepient {
  tgId: string
  orderCode: number
  orderStatus: OrderStatus
  weight: Decimal
  deliveryPrice: Decimal
  ponyPrice: Decimal
}

export interface OrderRecepientGeRu {
  tgId: string
  orderCode: number
  orderStatus: OrderStatusGeRu
  cdekTrackNr: string
}
