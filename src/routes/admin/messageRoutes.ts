import express from 'express'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const messages = await prisma.message.findMany()

    res.json(messages)
  } catch (ex) {
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

router.post('/', async (req, res) => {
  try {
    const createdMessage = await prisma.message.create({
      data: {
        ...req.body,
      },
    })

    res.json(createdMessage)
  } catch (ex) {
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

export default router
