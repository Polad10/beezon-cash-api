import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import userRoutes from './routes/userRoutes'
import meRoutes from './routes/meRoutes'
import orderRoutes from './routes/orderRoutes'
import adminOrderRoutes from './routes/admin/orderRoutes'
import { authMiddleware } from './middlewares/auth'

dotenv.config()

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', authMiddleware)
app.use('/api/me', meRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)

app.use('/admin/api/orders', adminOrderRoutes)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
