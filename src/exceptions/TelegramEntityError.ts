import { ErrorName } from '../enums/exceptions/ErrorName'
import { TelegramEntityErrorType } from '../enums/exceptions/TelegramEntityErrorType'

export class TelegramEntityError extends Error {
  public readonly type: TelegramEntityErrorType

  constructor(message: string, type: TelegramEntityErrorType) {
    super(message)
    this.name = ErrorName.TelegramEntityError
    this.type = type
  }
}
