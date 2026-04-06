import { StringSession } from 'telegram/sessions'
import { TelegramClient } from 'telegram'
import readline from 'readline'
import fs from 'fs'
import { getErrorData } from './error'
import { log } from './log'
import { randomUUID } from 'crypto'
import { LogLevel } from '../models/log.model'

const tgApiId = Number(process.env.TG_API_ID)
const tgApiHash = String(process.env.TG_API_HASH)
const sessionFile = 'data/session.txt'
const stringSession = new StringSession(fs.existsSync(sessionFile) ? fs.readFileSync(sessionFile).toString() : '')

// Set DC 2 (Amsterdam, Netherlands) for initial connection
// Other options: DC 1: 149.154.175.53, DC 3: 149.154.175.100, DC 4: 149.154.167.91, DC 5: 91.108.56.130
stringSession.setDC(1, '149.154.175.53', 443)

const tgClient = new TelegramClient(stringSession, tgApiId, tgApiHash, {
	connectionRetries: 3,
})

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

tgClient
	.start({
		phoneNumber: async () => new Promise((resolve) => rl.question('Please enter your number: ', resolve)),
		password: async () => new Promise((resolve) => rl.question('Please enter your password: ', resolve)),
		phoneCode: async () => new Promise((resolve) => rl.question('Please enter the code you received: ', resolve)),
		onError: async (error) => {
			const extra = {
				exception: getErrorData(error),
			}

			await log(randomUUID(), LogLevel.ERROR, "Couldn't initialize tg client.", extra)
			return true
		},
	})
	.then((result) => {
		fs.writeFileSync(sessionFile, stringSession.save())
	})

export default tgClient
