import { Decimal } from '@prisma/client/runtime/library'
import { Order } from './Order'

export interface StageResult {
  order: Order
  cashback: Decimal | null
}
