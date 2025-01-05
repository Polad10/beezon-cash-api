import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import meRoutes from './routes/meRoutes'
import orderRoutes from './routes/orderRoutes'
import adminOrderRoutes from './routes/admin/orderRoutes'
import adminUserRoutes from './routes/admin/userRoutes'
import adminMessageRoutes from './routes/admin/messageRoutes'
import adminTranasctionRoutes from './routes/admin/transactionRoutes'
import { clientAuthMiddleware } from './middlewares/clientAuth'
import { adminAuthMiddleware } from './middlewares/adminAuth'
import mongoose from 'mongoose'
import { errorMiddleware } from './middlewares/error'
import { logMiddleware } from './middlewares/log'
import publicOrderRoutes from './routes/public/orderRoutes'

dotenv.config()

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/', logMiddleware)
app.use('/api', clientAuthMiddleware)
app.use('/api/me', meRoutes)
app.use('/api/orders', orderRoutes)

app.use('/admin', adminAuthMiddleware)
app.use('/admin/api/users', adminUserRoutes)
app.use('/admin/api/orders', adminOrderRoutes)
app.use('/admin/api/messages', adminMessageRoutes)
app.use('/admin/api/transactions', adminTranasctionRoutes)

app.use('/public/api/orders', publicOrderRoutes)

app.use(errorMiddleware)

app.listen(port, async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING!)
  console.log(`Server running at http://localhost:${port}`)
})
