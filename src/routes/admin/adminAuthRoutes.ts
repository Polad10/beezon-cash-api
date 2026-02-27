import express from 'express'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { sessions } from '../../localStorage/sessions'
import { randomUUID } from 'crypto'

const router = express.Router()

router.post('/login', (req, res, next) => {
	try {
		const { username, password } = req.body

		if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
			return res.sendStatus(httpStatusCodes.unauthorized)
		}

		const session = randomUUID()
		sessions.add(session)

		res.cookie('admin_session', session, {
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.ENVIRONMENT !== 'local',
			path: '/',
		})

		res.sendStatus(httpStatusCodes.ok)
	} catch (ex) {
		next(ex)
	}
})

export default router
