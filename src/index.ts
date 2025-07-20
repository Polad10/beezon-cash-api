import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import clientMeRoutes from './routes/client/meRoutes'
import clientOrderRoutes from './routes/client/orderRoutes'
import adminOrderRoutes from './routes/admin/orderRoutes'
import adminGeRuRoutes from './routes/admin/geru/orderRoutes'
import adminUserRoutes from './routes/admin/userRoutes'
import adminMessageRoutes from './routes/admin/messageRoutes'
import adminMessageGeRuRoutes from './routes/admin/geru/messageRoutes'
import adminTranasctionRoutes from './routes/admin/transactionRoutes'
import adminSettingRoutes from './routes/admin/settingRoutes'
import { clientAuthMiddleware } from './middlewares/clientAuth'
import { adminAuthMiddleware } from './middlewares/adminAuth'
import mongoose from 'mongoose'
import { errorMiddleware } from './middlewares/error'
import { logMiddleware } from './middlewares/log'
import publicOrderRoutes from './routes/public/orderRoutes'
import publicOrderGeRuRoutes from './routes/public/geru/orderRoutes'
import cron from 'node-cron'
import { exec } from 'child_process'
import fs from 'fs'
import { google } from 'googleapis'
import { getErrorData } from './utils/error'
import { log } from './utils/log'
import { randomUUID } from 'crypto'
import { LogLevel } from './models/log.model'

dotenv.config()

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', logMiddleware)
app.use('/api/client', clientAuthMiddleware)
app.use('/api/admin', adminAuthMiddleware)

app.use('/api/client/me', clientMeRoutes)
app.use('/api/client/orders', clientOrderRoutes)

app.use('/api/admin/users', adminUserRoutes)
app.use('/api/admin/orders', adminOrderRoutes)
app.use('/api/admin/messages', adminMessageRoutes)
app.use('/api/admin/transactions', adminTranasctionRoutes)
app.use('/api/admin/settings', adminSettingRoutes)
app.use('/api/admin/geru/messages', adminMessageGeRuRoutes)
app.use('/api/admin/geru/orders', adminGeRuRoutes)

app.use('/api/public/orders', publicOrderRoutes)
app.use('/api/public/geru/orders', publicOrderGeRuRoutes)

app.use(errorMiddleware)

if (process.env.ENVIRONMENT == 'prod') {
	cron.schedule('0 0 * * *', () => {
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
			const correlationId = randomUUID()

			try {
				if (error) {
					const extra = {
						exception: getErrorData(error as Error),
					}

					await log(correlationId, LogLevel.ERROR, 'Backup failed', extra)
					return
				} else {
					await log(correlationId, LogLevel.INFO, `Backup created: ${filePath}`)

					const auth = new google.auth.GoogleAuth({
						scopes: 'https://www.googleapis.com/auth/drive',
						credentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS!),
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

					await log(correlationId, LogLevel.INFO, `Backup uploaded: ${fileName}`)
				}
			} catch (ex) {
				const extra = {
					exception: getErrorData(ex as Error),
				}

				await log(correlationId, LogLevel.ERROR, 'Could not upload backup file', extra)
			}
		})
	})
}

app.listen(port, async () => {
	await mongoose.connect(process.env.MONGODB_CONNECTION_STRING!)
	console.log(`Server running at http://localhost:${port}`)
})
