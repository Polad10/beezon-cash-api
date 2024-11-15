import { Log, LogLevel } from '../models/log.model'

export async function log(correlationId: String, level: LogLevel, message: String, extra: Object | null = null) {
  const logData = {
    correlationId: correlationId,
    level: level.toString(),
    message: message,
    extra: extra,
  }

  const log = new Log(logData)

  await log.save()
}
