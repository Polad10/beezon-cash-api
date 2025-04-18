import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.order_ge_ru.findMany()

    res.json(orders)
  } catch (ex) {
    next(ex)
  }
})

export default router
