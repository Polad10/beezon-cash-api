import { Request, Response, NextFunction } from 'express'
import { log } from '../utils/log'
import { LogLevel } from '../models/log.model'
import { randomUUID } from 'crypto'

export async function logMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = randomUUID()
  res.locals.correlationId = correlationId

  const logExtra = {
    headers: req.headers,
    ip: req.ip,
    body: req.body,
  }

  await log(correlationId, LogLevel.INFO, `${req.method} ${req.originalUrl}`, logExtra)
  return next()
}
