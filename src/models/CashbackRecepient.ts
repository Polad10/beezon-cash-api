import { Decimal } from '@prisma/client/runtime/library'

export interface CashbackRecepient {
  tgUsername: string
  orderCode: number
  cashback: Decimal
}
