import { Decimal } from '@prisma/client/runtime/library'
import { Order } from './Order'

export interface StageResult {
  tgId: string
  orderCode: number
  cashback: Decimal | null
}
