import { Request, Response, NextFunction } from 'express'
import { log } from '../utils/log'
import { LogLevel } from '../models/log.model'
import httpStatusCodes from '../constants/httpStatusCodes'

export async function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  await log(res.locals.correlationId, LogLevel.ERROR, err.message, err)
  res.sendStatus(httpStatusCodes.internalServerError)
}
