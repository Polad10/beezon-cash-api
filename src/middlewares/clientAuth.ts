import { Request, Response, NextFunction } from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'
import { validate, parse } from '@telegram-apps/init-data-node'
import { log } from '../utils/log'
import { randomUUID } from 'crypto'
import { LogLevel } from '../models/log.model'

export function clientAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const [authType, authData] = (req.header('authorization') || '').split(' ')

  try {
    const token = process.env.TG_API_TOKEN!

    switch (authType) {
      case 'tma':
        validate(authData, token, {
          expiresIn: 0,
        })

        const authDataParsed = parse(authData)
        res.locals.tgId = authDataParsed?.user?.id.toString()

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
