import express from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        user: {
          tg_username: res.locals.username,
        },
      },
    })

    res.json(orders)
  } catch (ex) {
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

export default router
