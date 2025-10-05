import pino from 'pino'
import { FastifyBaseLogger } from 'fastify'

export default pino({
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      singleLine: true,
    },
  },
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  formatters: {
    bindings: () => ({}),
  },
}) as FastifyBaseLogger

