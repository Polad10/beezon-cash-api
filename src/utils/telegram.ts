import { TelegramEntityErrorType } from '../enums/exceptions/TelegramEntityErrorType'
import { TelegramEntityError } from '../exceptions/TelegramEntityError'
import tgClient from './tgClient'

export async function getTgId(tgUsername: string) {
  try {
    const entity = await tgClient.getEntity(tgUsername)
    return entity.id.toString()
  } catch (ex: any) {
    if (ex.name == 'FloodWaitError') {
      throw new TelegramEntityError(ex.message, TelegramEntityErrorType.Flood)
    }

    throw new TelegramEntityError(ex.message, TelegramEntityErrorType.EntityNotFound)
  }
}
