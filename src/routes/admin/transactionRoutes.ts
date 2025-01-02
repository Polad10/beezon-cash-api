import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany()

    res.json(transactions)
  } catch (ex) {
    next(ex)
  }
})

export default router
