import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getTgId } from '../../utils/telegram'
import tgClient from '../../utils/tgClient'
import { TelegramEntityError } from '../../exceptions/TelegramEntityError'
import { TelegramEntityErrorType } from '../../enums/exceptions/TelegramEntityErrorType'

vi.mock('../../utils/tgClient', () => ({
	default: {
		getEntity: vi.fn(),
	},
}))

describe('getTgId tests', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should return id when entity is found', async () => {
		;(tgClient.getEntity as any).mockResolvedValue({ id: 1234 })

		const result = await getTgId('testUser')
		expect(result).toBe('1234')
	})

	it('should throw TelegramEntityError (Flood) when FloodWaitError is thrown', async () => {
		;(tgClient.getEntity as any).mockRejectedValue({
			name: 'FloodWaitError',
			message: 'Test flood wait error',
		})

		await expect(getTgId('user')).rejects.toThrow(TelegramEntityError)
		await expect(getTgId('user')).rejects.toMatchObject({
			type: TelegramEntityErrorType.Flood,
		})
	})

	it('should throw TelegramEntityError (EntityNotFound) as default exception', async () => {
		;(tgClient.getEntity as any).mockRejectedValue({
			name: 'RandomName',
			message: 'User not found',
		})

		await expect(getTgId('user')).rejects.toThrow(TelegramEntityError)
		await expect(getTgId('user')).rejects.toMatchObject({
			type: TelegramEntityErrorType.EntityNotFound,
		})
	})
})
