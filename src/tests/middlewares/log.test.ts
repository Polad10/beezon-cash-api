import { describe, expect, it, vi } from 'vitest'
import { logMiddleware } from '../../middlewares/log'
import { log } from '../../utils/log'
import { LogLevel } from 'telegram/extensions/Logger'

vi.mock('../../utils/log', () => {
	return {
		log: vi.fn().mockResolvedValue(undefined),
	}
})

describe('logMiddleware tests', () => {
	it('should log requests', async () => {
		const req = {
			method: 'GET',
			originalUrl: 'https://example.com',
			headers: 'headers',
			ip: 'ip',
			body: 'body',
		} as any

		const res = {
			locals: {},
		} as any

		await logMiddleware(req, res, () => {})

		expect(log as any).toHaveBeenCalledWith(
			expect.any(String),
			LogLevel.INFO,
			'GET https://example.com',
			{ headers: req.headers, ip: req.ip, body: req.body }
		)
	})
})
