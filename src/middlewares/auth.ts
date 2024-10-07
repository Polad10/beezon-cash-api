import { Request, Response, NextFunction } from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'
import { validate, parse } from '@telegram-apps/init-data-node'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const [authType, authData] = (req.header('authorization') || '').split(' ')

  const token = '<tg-token>'

  switch (authType) {
    case 'tma':
      try {
        // validate(authData, token, {
        //   expiresIn: 3600,
        // })

        const authDataParsed = parse(authData)
        res.locals.username = authDataParsed?.user?.username
        return next()
      } catch (ex) {
        console.log(ex)
        return res.status(httpStatusCodes.unauthorized).send('Unauthorized')
      }
    default:
      console.log('not tma')
      return res.status(httpStatusCodes.unauthorized).send('Unauthorized')
  }
}
