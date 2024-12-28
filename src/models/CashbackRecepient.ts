import { Decimal } from '@prisma/client/runtime/library'

export interface CashbackRecepient {
  tgId: string
  orderCode: number
  cashback: Decimal
}
