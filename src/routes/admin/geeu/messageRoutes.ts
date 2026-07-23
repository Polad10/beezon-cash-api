import express from 'express'
import httpStatusCodes from '../../../constants/httpStatusCodes'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const messages = await prisma.message_ge_eu.findMany()

    res.json(messages)
  } catch (ex) {
    next(ex)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const createdMessage = await prisma.message_ge_eu.create({
      data: {
        ...req.body,
      },
    })

    res.json(createdMessage)
  } catch (ex) {
    next(ex)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const editedMessage = await prisma.message_ge_eu.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        ...req.body,
      },
    })

    res.json(editedMessage)
  } catch (ex) {
    next(ex)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.message_ge_eu.delete({
      where: {
        id: Number(req.params.id),
      },
    })

    res.sendStatus(httpStatusCodes.ok)
  } catch (ex) {
    next(ex)
  }
})

export default router
