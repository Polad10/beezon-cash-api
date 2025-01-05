import { Request, Response, NextFunction } from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const [authType, authData] = (req.header('authorization') || '').split(' ')

    switch (authType) {
      case 'Bearer':
        if (process.env.API_SECRET !== authData) {
          return res.status(httpStatusCodes.unauthorized).send('Unauthorized')
        }

        return next()
      default:
        return res.status(httpStatusCodes.unauthorized).send('Unauthorized')
    }
  } catch (ex) {
    return res.sendStatus(httpStatusCodes.internalServerError)
  }
}
