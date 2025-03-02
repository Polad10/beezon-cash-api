import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import meRoutes from './routes/meRoutes'
import orderRoutes from './routes/orderRoutes'
import userRoutes from './routes/userRoutes'
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
import cron from 'node-cron'
import { exec } from 'child_process'
import fs from 'fs'
import { google } from 'googleapis'

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
app.use('/api/users', userRoutes)

app.use('/admin', adminAuthMiddleware)
app.use('/admin/api/users', adminUserRoutes)
app.use('/admin/api/orders', adminOrderRoutes)
app.use('/admin/api/messages', adminMessageRoutes)
app.use('/admin/api/transactions', adminTranasctionRoutes)

app.use('/public/api/orders', publicOrderRoutes)

app.use(errorMiddleware)

if (process.env.ENVIRONMENT == 'prod') {
  cron.schedule('*/10 * * * * *', () => {
    const timestamp = new Date()
      .toISOString()
      .replace('T', '_')
      .replace('Z', '')
      .replaceAll(':', '-')
      .replaceAll('.', '-')

    const fileName = `beezon-cash-${timestamp}.backup`
    const filePath = `./tmp/${fileName}`
    const connectionString = process.env.DATABASE_URL?.split('?')[0]
    const command = `pg_dump -F c -f ${filePath} -d ${connectionString}`

    exec(command, async (error, stdout, stderr) => {
      try {
        if (error) {
          console.log(`Backup failed: ${error}`)
          return
        } else {
          console.log(`Backup created: ${filePath}`)

          const auth = new google.auth.GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/drive',
            keyFile: 'google-drive-credentials.json',
          })

          const drive = google.drive({ version: 'v3', auth })

          const metadata = {
            name: fileName,
            parents: ['1TzDG2qQqHmG-po161bE6__qNJHLmRcOL'],
          }

          const media = {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(filePath),
          }

          await drive.files.create({
            requestBody: metadata,
            media: media,
            fields: 'id',
          })

          console.log(`Backup uploaded: ${fileName}`)
        }
      } catch (ex) {
        console.log(`Could not upload backup file: ${ex}`)
      }
    })
  })
}

app.listen(port, async () => {
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING!)
  console.log(`Server running at http://localhost:${port}`)
})
