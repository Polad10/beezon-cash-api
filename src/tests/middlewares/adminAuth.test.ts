import { describe, expect, it, vi } from 'vitest'
import { adminAuthMiddleware } from '../../middlewares/adminAuth'
import httpStatusCodes from '../../constants/httpStatusCodes'

vi.mock('../../utils/log', () => {
	return {
		log: vi.fn().mockResolvedValue(undefined),
	}
})

vi.mock('../../localStorage/sessions', () => {
	return {
		sessions: new Set(['valid-token']),
	}
})

describe('adminAuthMiddleware tests', () => {
	it('should return Unauthorized if there is no token', async () => {
		const req = {
			method: 'GET',
		} as any

		const res = {
			sendStatus: vi.fn(),
		} as any

		await adminAuthMiddleware(req, res, () => {})

		expect(res.sendStatus).toBeCalledWith(httpStatusCodes.unauthorized)
	})

	it('should return Unauthorized if token is not correct', async () => {
		vi.stubEnv('BEEZON_API_SECRET', 'correct-token')

		const req = {
			method: 'GET',
			cookies: {
				admin_session: 'invalid-token',
			},
		} as any

		const res = {
			sendStatus: vi.fn(),
		} as any

		await adminAuthMiddleware(req, res, () => {})

		expect(res.sendStatus).toBeCalledWith(httpStatusCodes.unauthorized)
	})

	it('should call next if token is correct', async () => {
		const req = {
			method: 'GET',
			cookies: {
				admin_session: 'valid-token',
			},
		} as any

		const res = {
			sendStatus: vi.fn(),
		} as any

		const next = vi.fn()

		await adminAuthMiddleware(req, res, next)

		expect(next).toBeCalled()
	})
})
