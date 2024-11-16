import { Schema, model } from 'mongoose'

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

const LogSchema = new Schema({
  correlationId: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: Object.values(LogLevel),
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  extra: {
    type: Object,
  },
  timestamp: {
    type: Date,
    default: () => Date.now(),
  },
  app: {
    type: String,
    default: 'beezon-cash-api',
  },
})

export const Log = model('log', LogSchema)
