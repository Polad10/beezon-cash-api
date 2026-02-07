import express from 'express'
import httpStatusCodes from '../../constants/httpStatusCodes'

const router = express.Router()
const sessions = new Set<string>()

router.post('/login', (req, res) => {
	const { username, password } = req.body

	if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
		return res.sendStatus(httpStatusCodes.unauthorized)
	}

	const session = crypto.randomUUID()
	sessions.add(session)

	res.cookie('admin_session', session, {
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.ENVIRONMENT !== 'local',
		path: '/',
	})
})

export default router
