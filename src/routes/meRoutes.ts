import express from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        tg_username: res.locals.username,
      },
    })

    if (user) {
      return res.json(user)
    }

    return res.sendStatus(httpStatusCodes.notFound)
  } catch (ex) {
    next(ex)
  }
})

export default router
