import { describe, expect, it, vi } from 'vitest'
import { adminAuthMiddleware } from '../../middlewares/adminAuth'
import httpStatusCodes from '../../constants/httpStatusCodes'

vi.mock('../../utils/log', () => {
	return {
		log: vi.fn().mockResolvedValue(undefined),
	}
})

describe('adminAuthMiddleware tests', () => {
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

		await adminAuthMiddleware(req, res, () => {})

		expect(res.status).toBeCalledWith(httpStatusCodes.unauthorized)
		expect(res.send).toBeCalled()
	})

	it('should return Unauthorized if token is not Bearer', async () => {
		vi.stubEnv('BEEZON_API_SECRET', 'correct-token')

		const req = {
			method: 'GET',
			originalUrl: 'https://example.com',
			headers: 'headers',
			ip: 'ip',
			body: 'body',
			header: vi.fn().mockReturnValue('NotBearer correct-token'),
		} as any

		const res = {
			locals: {},
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as any

		await adminAuthMiddleware(req, res, () => {})

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

		await adminAuthMiddleware(req, res, () => {})

		expect(res.status).toBeCalledWith(httpStatusCodes.unauthorized)
		expect(res.send).toBeCalled()
	})

	it('should call next if token is correct', async () => {
		vi.stubEnv('BEEZON_API_SECRET', 'correct-token')

		const req = {
			method: 'GET',
			originalUrl: 'https://example.com',
			headers: 'headers',
			ip: 'ip',
			body: 'body',
			header: vi.fn().mockReturnValue('Bearer correct-token'),
		} as any

		const res = {
			locals: {},
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as any

		const next = vi.fn()

		await adminAuthMiddleware(req, res, next)

		expect(next).toBeCalled()
	})
})
