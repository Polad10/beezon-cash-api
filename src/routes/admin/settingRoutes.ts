import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
	try {
		const settings = await prisma.setting.findFirst()

		res.json(settings)
	} catch (ex) {
		next(ex)
	}
})

router.put('/', async (req, res, next) => {
	try {
		const editedSettings = await prisma.setting.update({
			where: {
				id: 1,
			},
			data: {
				...req.body,
			},
		})

		res.json(editedSettings)
	} catch (ex) {
		next(ex)
	}
})

export default router
