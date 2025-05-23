import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Log, LogLevel } from '../../models/log.model'
import { log } from '../../utils/log'

vi.mock('../../models/log.model', () => {
  return {
    Log: vi.fn().mockImplementation(function (this: any, data: any) {
      Object.assign(this, data)
      this.save = vi.fn().mockResolvedValue(this)
    }),
    LogLevel: {
      INFO: 'INFO',
      ERROR: 'ERROR',
      WARN: 'WARN'
    }
  }
})

describe('log tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create and save a log entry', async () => {
    const correlationId = 'test-corr-id'
    const level = LogLevel.INFO
    const message = 'Test message'
    const extra = { foo: 'bar' }

    await log(correlationId, level, message, extra)

    // Check that Log was called with correct data
    expect(Log).toHaveBeenCalledWith({
      correlationId,
      level: level.toString(),
      message,
      extra,
    })

    // Check that save was called
    const logInstance = (Log as any).mock.instances[0]
    expect(logInstance.save).toHaveBeenCalled()
  })
})