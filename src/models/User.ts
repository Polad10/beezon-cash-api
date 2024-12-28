import { Decimal } from '@prisma/client/runtime/library'

export interface User {
  id: string
  first_name: string
  last_name: string
  phone_nr: string
  tg_username: string
  tg_id: string
  referral_code: string
  invited_by: string | null
  balance: Decimal
}
