import { describe, expect, it, vi } from 'vitest'
import { errorMiddleware } from '../../middlewares/error'
import { LogLevel } from '../../models/log.model'
import { log } from '../../utils/log'
import httpStatusCodes from '../../constants/httpStatusCodes'
import { TelegramEntityError } from '../../exceptions/TelegramEntityError'
import { TelegramEntityErrorType } from '../../enums/exceptions/TelegramEntityErrorType'

vi.mock('../../utils/log', () => {
	return {
		log: vi.fn().mockResolvedValue(undefined),
	}
})

describe('errorMiddleware', () => {
	it('should log requests', async () => {
		const req = {
			method: 'GET',
			originalUrl: 'https://example.com',
			headers: 'headers',
			ip: 'ip',
			body: 'body',
		} as any

		const res = {
			locals: { correlationId: '123' },
			sendStatus: vi.fn(),
		} as any

		const error = new Error('Error message')

		await errorMiddleware(error, req, res, () => {})

		expect(log as any).toHaveBeenCalledWith(
			'123',
			LogLevel.ERROR,
			'Error message',
			error
		)
	})

	it('should return InternalServerError by default', async () => {
		const req = {
			method: 'GET',
			originalUrl: 'https://example.com',
			headers: 'headers',
			ip: 'ip',
			body: 'body',
		} as any

		const res = {
			locals: { correlationId: '123' },
			sendStatus: vi.fn(),
		} as any

		const error = new Error('Error message')

		await errorMiddleware(error, req, res, () => {})

		expect(res.sendStatus).toBeCalledWith(httpStatusCodes.internalServerError)
	})

	it('should return BadRequest for TelegramEntityError', async () => {
		const req = {
			method: 'GET',
			originalUrl: 'https://example.com',
			headers: 'headers',
			ip: 'ip',
			body: 'body',
		} as any

		const res = {
			locals: { correlationId: '123' },
			sendStatus: vi.fn(),
			status: vi.fn().mockReturnValue({ json: vi.fn() }),
		} as any

		const error = new TelegramEntityError(
			'Error message',
			TelegramEntityErrorType.EntityNotFound
		)

		await errorMiddleware(error, req, res, () => {})

		expect(res.status).toBeCalledWith(httpStatusCodes.badRequest)
		expect(res.status().json).toBeCalledWith({
			errorName: error.name,
			errorType: error.type,
		})
	})
})
