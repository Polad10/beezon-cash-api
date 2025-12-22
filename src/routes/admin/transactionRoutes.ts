import express from 'express'
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
	try {
		const { startDate, endDate } = req.query

		const where: Prisma.transactionWhereInput = {}
		const datetime: Prisma.DateTimeFilter = {}

		if (startDate) datetime.gte = new Date(startDate as string)
		if (endDate) datetime.lte = new Date(endDate as string)

		if (Object.keys(datetime).length > 0) {
			where.datetime = datetime
		}

		const transactions = await prisma.transaction.findMany({
			where: where,
		})

		res.json(transactions)
	} catch (ex) {
		next(ex)
	}
})

export default router
