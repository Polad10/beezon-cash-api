import { Request, Response, NextFunction } from 'express'
import { log } from '../utils/log'
import { LogLevel } from '../models/log.model'
import httpStatusCodes from '../constants/httpStatusCodes'
import { TelegramEntityError } from '../exceptions/TelegramEntityError'

export async function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  await log(res.locals.correlationId, LogLevel.ERROR, err.message, err)

  if (err instanceof TelegramEntityError) {
    return res.status(httpStatusCodes.badRequest).json({ errorName: err.name, errorType: err.type })
  }

  res.sendStatus(httpStatusCodes.internalServerError)
}
