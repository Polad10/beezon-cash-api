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

// Proxy configuration
const proxyConfig = process.env.SOCKS5_PROXY_IP
	? {
			ip: process.env.SOCKS5_PROXY_IP,
			port: Number(process.env.SOCKS5_PROXY_PORT || 1080),
			socksType: 5 as const,
			timeout: 30000, // Increase timeout to 30 seconds
			...(process.env.SOCKS5_PROXY_USER && {
				username: process.env.SOCKS5_PROXY_USER,
				password: process.env.SOCKS5_PROXY_PASS,
			}),
		}
	: undefined

const tgClient = new TelegramClient(stringSession, tgApiId, tgApiHash, {
	connectionRetries: 3,
	...(proxyConfig && { proxy: proxyConfig }),
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
