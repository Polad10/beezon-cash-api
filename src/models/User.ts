import { Decimal } from '@prisma/client/runtime/library'
import { PendingBonus } from './PendingBonus'

export interface User {
  id: string
  first_name: string
  last_name: string
  phone_nr: string
  tg_username: string | null
  tg_id: string
  referral_code: string
  invited_by: string | null
  balance: Decimal
  pending_bonuses_from: PendingBonus[]
  pending_bonuses_to: PendingBonus[]
}
