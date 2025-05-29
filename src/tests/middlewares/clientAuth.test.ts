import { describe, expect, it, vi } from 'vitest'
import { clientAuthMiddleware } from '../../middlewares/clientAuth'
import httpStatusCodes from '../../constants/httpStatusCodes'

vi.mock('../../utils/log', () => {
	return {
		log: vi.fn().mockResolvedValue(undefined),
	}
})

vi.mock('@telegram-apps/init-data-node', () => {
	return {
		parse: vi.fn().mockReturnValue({}),
		validate: vi.fn(),
	}
})

describe('clientAuthMiddleware tests', async () => {
	it('should return Unauthorized if there is no token', async () => {
		const req = {
			method: 'GET',
			originalUrl: 'https://example.com',
			headers: 'headers',
			ip: 'ip',
			body: 'body',
			header: vi.fn(),
		} as any

		const res = {
			locals: {},
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as any

		await clientAuthMiddleware(req, res, () => {})

		expect(res.status).toBeCalledWith(httpStatusCodes.unauthorized)
		expect(res.send).toBeCalled()
	})

	it('should return Unauthorized if token is not tma', async () => {
		vi.stubEnv('TG_API_TOKEN', 'correct-token')

		const req = {
			method: 'GET',
			originalUrl: 'https://example.com',
			headers: 'headers',
			ip: 'ip',
			body: 'body',
			header: vi.fn().mockReturnValue('not-tma correct-token'),
		} as any

		const res = {
			locals: {},
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as any

		await clientAuthMiddleware(req, res, () => {})

		expect(res.status).toBeCalledWith(httpStatusCodes.unauthorized)
		expect(res.send).toBeCalled()
	})

	it('should return Unauthorized if token is not correct', async () => {
		const req = {
			method: 'GET',
			originalUrl: 'https://example.com',
			headers: 'headers',
			ip: 'ip',
			body: 'body',
			header: vi.fn().mockReturnValue('Bearer wrong-token'),
		} as any

		const res = {
			locals: {},
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as any

		await clientAuthMiddleware(req, res, () => {})

		expect(res.status).toBeCalledWith(httpStatusCodes.unauthorized)
		expect(res.send).toBeCalled()
	})

	it('should call next if token is correct', async () => {
		vi.stubEnv('TG_API_TOKEN', 'correct-token')

		const req = {
			method: 'GET',
			originalUrl: 'https://example.com',
			headers: 'headers',
			ip: 'ip',
			body: 'body',
			header: vi.fn().mockReturnValue('tma correct-token'),
		} as any

		const res = {
			locals: {},
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as any

		const next = vi.fn()

		await clientAuthMiddleware(req, res, next)

		expect(next).toBeCalled()
	})
})
