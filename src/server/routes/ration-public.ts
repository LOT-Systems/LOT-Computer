/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT-FM-001 — OPEN TAB public API. Read-only. No auth.
 * Publishes the manifest and the envelope VERDICT. COGS figures are withheld.
 */

import { FastifyInstance } from 'fastify'
import {
  RATION_FM,
  RATION_MODULE,
  RATION_PRICE_USD,
  RATION_LOAD,
  RATION_DOCTRINE,
  RATION_TERMS,
} from '#shared/constants/ration'
import { envelopeCycle } from '#server/ration/cogs'

export default async (fastify: FastifyInstance) => {
  fastify.get('/ration', async (_req, reply) => {
    const env = envelopeCycle()
    reply.header('Cache-Control', 'public, max-age=300')
    return {
      fm: RATION_FM,
      module: RATION_MODULE,
      priceUsd: RATION_PRICE_USD,
      doctrine: RATION_DOCTRINE,
      terms: RATION_TERMS,
      load: RATION_LOAD.map(({ line, stock, nomenclature, unit, qty, cadence, cls, sized }) => ({
        line, stock, nomenclature, unit, qty, cadence, cls, sized: !!sized,
      })),
      envelope: env.green ? 'HOLDING' : 'BREACH',
      phase: 'MONTH 1 — LEDGER & DOCTRINE',
      intake: 'CLOSED',
    }
  })
}
