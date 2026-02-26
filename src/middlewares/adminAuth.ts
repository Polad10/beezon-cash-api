import { Request, Response, NextFunction } from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'
import { log } from '../utils/log'
import { randomUUID } from 'crypto'
import { LogLevel } from '../models/log.model'
import { sessions } from '../localStorage/sessions'

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
	const sid = req.cookies?.admin_session

	try {
		if (!sid || !sessions.has(sid)) {
			logUnauthorized(sid)
			return res.sendStatus(httpStatusCodes.unauthorized)
		}

		return next()
	} catch (ex) {
		logUnauthorized(sid, ex)
		res.sendStatus(httpStatusCodes.unauthorized)
	}
}

async function logUnauthorized(authData: string, ex?: any) {
	const extra = {
		authData,
		exception: ex,
	}

	await log(randomUUID(), LogLevel.ERROR, 'Unauthorized', extra)
}
