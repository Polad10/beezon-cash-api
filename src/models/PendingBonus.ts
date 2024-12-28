import { Decimal } from '@prisma/client/runtime/library'
import { User } from './User'

export interface PendingBonus {
  id: string
  from_user_id: string
  to_user_id: string
  amount: Decimal
  from_user: User
  to_user: User
}
