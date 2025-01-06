import { Request, Response, NextFunction } from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'
import { log } from '../utils/log'
import { randomUUID } from 'crypto'
import { LogLevel } from '../models/log.model'

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const [authType, authData] = (req.header('authorization') || '').split(' ')

  try {
    switch (authType) {
      case 'Bearer':
        if (process.env.BEEZON_API_SECRET !== authData) {
          logUnauthorized(authType, authData)
          return res.status(httpStatusCodes.unauthorized).send('Unauthorized')
        }

        return next()
      default:
        logUnauthorized(authType, authData)
        return res.status(httpStatusCodes.unauthorized).send('Unauthorized')
    }
  } catch (ex) {
    logUnauthorized(authType, authData, ex)
    return res.status(httpStatusCodes.unauthorized).send('Unauthorized')
  }
}

async function logUnauthorized(authType: string, authData: string, ex?: any) {
  const extra = {
    authType,
    authData,
    exception: ex,
  }

  await log(randomUUID(), LogLevel.ERROR, 'Unauthorized', extra)
}
