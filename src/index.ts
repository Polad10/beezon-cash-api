import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import userRoutes from './routes/userRoutes'
import meRoutes from './routes/meRoutes'
import orderRoutes from './routes/orderRoutes'
import adminOrderRoutes from './routes/admin/orderRoutes'
import adminUserRoutes from './routes/admin/userRoutes'
import adminMessageRoutes from './routes/admin/messageRoutes'
import adminBeezonOrderRoutes from './routes/admin/beezon/orderRoutes'
import { authMiddleware } from './middlewares/auth'
import mongoose from 'mongoose'
import { logMiddleware } from './middlewares/log'

dotenv.config()

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', logMiddleware)
app.use('/api', authMiddleware)
app.use('/api/me', meRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)

app.use('/admin/api/users', adminUserRoutes)
app.use('/admin/api/orders', adminOrderRoutes)
app.use('/admin/api/messages', adminMessageRoutes)
app.use('/admin/beezon/api/orders', adminBeezonOrderRoutes)

app.listen(port, async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING!)
  console.log(`Server running at http://localhost:${port}`)
})
