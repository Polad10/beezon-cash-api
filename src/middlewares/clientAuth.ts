import { Request, Response, NextFunction } from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'
import { validate, parse } from '@telegram-apps/init-data-node'

export function clientAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const [authType, authData] = (req.header('authorization') || '').split(' ')

    const token = '<tg-token>'

    switch (authType) {
      case 'tma':
        // validate(authData, token, {
        //   expiresIn: 3600,
        // })

        const authDataParsed = parse(authData)
        res.locals.tgId = authDataParsed?.user?.id.toString()

        return next()
      default:
        return res.status(httpStatusCodes.unauthorized).send('Unauthorized')
    }
  } catch (ex) {
    return res.sendStatus(httpStatusCodes.internalServerError)
  }
}
