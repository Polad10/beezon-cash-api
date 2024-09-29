import express from 'express'
import httpStatusCodes from '../constants/httpStatusCodes'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    res.send('yes')
  } catch (ex) {
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

router.post('/', async (req, res) => {
  try {
  } catch (ex) {
    res.sendStatus(httpStatusCodes.internalServerError)
  }
})

export default router
