import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	sendBonusAppliedMessage,
	sendCashbackAppliedMessage,
	sendStageUpdateGeEuMessage,
	sendStageUpdateGeRuMessage,
	sendStageUpdateMessage,
} from '../../utils/notification'
import tgClient from '../../utils/tgClient'
import { OrderStatus } from '../../enums/OrderStatus'
import { log } from '../../utils/log'
import { LogLevel } from '../../models/log.model'
import { OrderStatusGeEu, OrderStatusGeRu } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

vi.mock('../../utils/tgClient', () => {
	return {
		default: {
			sendMessage: vi.fn().mockResolvedValue(undefined),
		},
	}
})

const { messageFindUniqueMock, messageGeRuFindUniqueMock, messageGeEuFindUniqueMock } = vi.hoisted(() => ({
	messageFindUniqueMock: vi.fn(),
	messageGeRuFindUniqueMock: vi.fn(),
	messageGeEuFindUniqueMock: vi.fn(),
}))

vi.mock('@prisma/client', async () => {
	var actualPrismaClient = await vi.importActual('@prisma/client')

	return {
		...actualPrismaClient,
		PrismaClient: vi.fn().mockImplementation(() => {
			return {
				message: {
					findUnique: messageFindUniqueMock,
				},
				message_ge_ru: {
					findUnique: messageGeRuFindUniqueMock,
				},
				message_ge_eu: {
					findUnique: messageGeEuFindUniqueMock,
				},
			}
		}),
	}
})

vi.mock('../../utils/log', () => {
	return {
		log: vi.fn().mockResolvedValue(undefined),
	}
})

beforeEach(() => {
	vi.clearAllMocks()

	messageFindUniqueMock.mockResolvedValue({ text: 'Some text' })
	messageGeRuFindUniqueMock.mockResolvedValue({ text: 'Some text' })
	messageGeEuFindUniqueMock.mockResolvedValue({ text: 'Some text' })
})

describe('sendStageUpdateMessage tests', () => {
	it('should send a message, if order status is in the list', async () => {
		const recipient = {
			orderCode: 'A1',
			orderStatus: OrderStatus.New,
			tgId: 123,
		} as any

		await sendStageUpdateMessage(recipient)

		expect(tgClient.sendMessage).toHaveBeenCalled()
	})

	it('should not send a message, if order status is not in the list', async () => {
		const recipient = {
			orderCode: 'A1',
			orderStatus: OrderStatus.Delivered,
			tgId: 123,
		} as any

		messageFindUniqueMock.mockResolvedValue(null)

		await sendStageUpdateMessage(recipient)

		expect(tgClient.sendMessage).not.toHaveBeenCalled()
	})

	it('should silently log an error if sending message fails', async () => {
		const recipient = {
			orderCode: 'A1',
			orderStatus: OrderStatus.New,
			tgId: 123,
		} as any

		const error = {
			name: 'TestError',
			message: 'Test error message',
			cause: 'Cause',
			stack: 'Stack',
		}

		;(tgClient.sendMessage as any).mockRejectedValue(error)

		await expect(sendStageUpdateMessage(recipient)).resolves.not.toThrow()

		expect(log as any).toHaveBeenCalledWith(expect.any(String), LogLevel.ERROR, expect.any(String), {
			tgId: recipient.tgId,
			orderCode: recipient.orderCode,
			orderStatus: recipient.orderStatus,
			exception: error,
		})
	})
})

describe('sendStageUpdateGeRuMessage tests', async () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should send a message, if order status is in the list', async () => {
		const recipient = {
			orderCode: 'A1',
			orderStatus: OrderStatusGeRu.InvoiceCreated,
			tgId: 123,
		} as any

		await sendStageUpdateGeRuMessage(recipient)

		expect(tgClient.sendMessage).toHaveBeenCalled()
	})

	it('should not send a message, if order status is not in the list', async () => {
		const recipient = {
			orderCode: 'A1',
			orderStatus: OrderStatusGeRu.Delivered,
			tgId: 123,
		} as any

		messageGeRuFindUniqueMock.mockResolvedValue(null)

		await sendStageUpdateGeRuMessage(recipient)

		expect(tgClient.sendMessage).not.toHaveBeenCalled()
	})

	it('should silently log an error if sending message fails', async () => {
		const recipient = {
			orderCode: 'A1',
			orderStatus: OrderStatusGeRu.InvoiceCreated,
			tgId: 123,
		} as any

		const error = {
			name: 'TestError',
			message: 'Test error message',
			cause: 'Cause',
			stack: 'Stack',
		}

		;(tgClient.sendMessage as any).mockRejectedValue(error)

		await expect(sendStageUpdateGeRuMessage(recipient)).resolves.not.toThrow()

		expect(log as any).toHaveBeenCalledWith(expect.any(String), LogLevel.ERROR, expect.any(String), {
			tgId: recipient.tgId,
			orderCode: recipient.orderCode,
			orderStatus: recipient.orderStatus,
			exception: error,
		})
	})
})

describe('sendStageUpdateGeEuMessage tests', async () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should send a message, if order status is in the list', async () => {
		const recipient = {
			orderCode: 'A1',
			orderStatus: OrderStatusGeEu.InvoiceCreated,
			tgId: 123,
		} as any

		await sendStageUpdateGeEuMessage(recipient)

		expect(tgClient.sendMessage).toHaveBeenCalled()
	})

	it('should not send a message, if order status is not in the list', async () => {
		const recipient = {
			orderCode: 'A1',
			orderStatus: OrderStatusGeEu.Delivered,
			tgId: 123,
		} as any

		messageGeEuFindUniqueMock.mockResolvedValue(null)

		await sendStageUpdateGeEuMessage(recipient)

		expect(tgClient.sendMessage).not.toHaveBeenCalled()
	})

	it('should silently log an error if sending message fails', async () => {
		const recipient = {
			orderCode: 'A1',
			orderStatus: OrderStatusGeEu.InvoiceCreated,
			tgId: 123,
		} as any

		const error = {
			name: 'TestError',
			message: 'Test error message',
			cause: 'Cause',
			stack: 'Stack',
		}

		;(tgClient.sendMessage as any).mockRejectedValue(error)

		await expect(sendStageUpdateGeEuMessage(recipient)).resolves.not.toThrow()

		expect(log as any).toHaveBeenCalledWith(expect.any(String), LogLevel.ERROR, expect.any(String), {
			tgId: recipient.tgId,
			orderCode: recipient.orderCode,
			orderStatus: recipient.orderStatus,
			exception: error,
		})
	})
})

describe('sendBonusAppliedMessage tests', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should send a message', async () => {
		await sendBonusAppliedMessage('A1', 1, new Decimal(1))

		expect(tgClient.sendMessage).toHaveBeenCalled()
	})

	it('should silently log an error if sending message fails', async () => {
		const data = {
			tgId: 'A1',
			orderCode: 1,
			newPrice: new Decimal(1),
		}

		const error = {
			name: 'TestError',
			message: 'Test error message',
			cause: 'Cause',
			stack: 'Stack',
		}

		;(tgClient.sendMessage as any).mockRejectedValue(error)

		await expect(sendBonusAppliedMessage(data.tgId, data.orderCode, data.newPrice)).resolves.not.toThrow()

		expect(log as any).toHaveBeenCalledWith(expect.any(String), LogLevel.ERROR, expect.any(String), {
			tgId: data.tgId,
			orderCode: data.orderCode,
			exception: error,
		})
	})
})

describe('sendCashbackAppliedMessage tests', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should send a message', async () => {
		const recepient = {
			tgId: 'A1',
			orderCode: 1,
			cashback: new Decimal(1),
		}

		await sendCashbackAppliedMessage(recepient)

		expect(tgClient.sendMessage).toHaveBeenCalled()
	})

	it('should silently log an error if sending message fails', async () => {
		const recepient = {
			tgId: 'A1',
			orderCode: 1,
			cashback: new Decimal(1),
		}

		const error = {
			name: 'TestError',
			message: 'Test error message',
			cause: 'Cause',
			stack: 'Stack',
		}

		;(tgClient.sendMessage as any).mockRejectedValue(error)

		await expect(sendCashbackAppliedMessage(recepient)).resolves.not.toThrow()

		expect(log as any).toHaveBeenCalledWith(expect.any(String), LogLevel.ERROR, expect.any(String), {
			tgId: recepient.tgId,
			orderCode: recepient.orderCode,
			exception: error,
		})
	})
})
