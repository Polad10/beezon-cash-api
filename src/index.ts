import express from 'express'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes'

dotenv.config()

const app = express()
const port = 3000

app.use(express.json())
app.use('/users', userRoutes)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
