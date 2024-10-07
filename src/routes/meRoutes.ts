import express from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        tg_username: res.locals.username,
      },
    })

    res.json(user)
  } catch (ex) {
    console.log(ex)
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

export default router
