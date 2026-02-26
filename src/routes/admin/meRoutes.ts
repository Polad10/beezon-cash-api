import express from 'express'
import httpStatusCodes from '../../constants/httpStatusCodes'

const router = express.Router()

router.get('/', (req, res) => {
	return res.sendStatus(httpStatusCodes.ok)
})

export default router
