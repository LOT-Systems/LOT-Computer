import { Sequelize } from 'sequelize/types'
import { Models, UserRecord } from './models/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    models: Models
    sequelize: Sequelize
  }
  interface FastifyRequest {
    user: UserRecord
  }
  interface FastifyReply {
    ok: (msg?: string) => void
    throw: {
      notFound: (msg?: string) => void
      badParams: (msg?: string) => void
      rejected: (msg?: string) => void
      misconfigured: (msg?: string) => void
      authException: (msg?: string) => void
      accessDenied: (msg?: string) => void
      conflict: (msg?: string) => void
      gone: (msg?: string) => void
      internalError: (msg?: string) => void
    }
  }
}

export type SafeResponse<T = undefined> = T extends undefined
  ? { success: true } | { success: false; error: Error }
  : { success: true; data: T } | { success: false; error: Error }
