/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — BASIC RATION MODULE (client re-export of shared manifest + engine)
export * from '#shared/utils/ration'
import type { RationCadence } from '#shared/utils/ration'
export const DOCTRINE_LINES = [
  'THE BASIC RATION IS A MONTHLY ISSUE, NOT A PURCHASE.',
  'LOT ISSUES TO MEMBERS ON STRENGTH. THE LEDGER IS THE MARKETING.',
  'NO LAYER BETWEEN THE PUBLIC AND THE MANIFEST.',
  'ADDITIVE TO USERSHIP (AI) PLAN. STAND DOWN DROPS RATION, RETAINS AI.',
]

export const RATION_STATES = {
  USERSHIP: 'USERSHIP',
  PENDING: 'PENDING',
  ON_STRENGTH: 'ON_STRENGTH',
  STEADY_STATE: 'STEADY_STATE',
} as const

export type RationState = (typeof RATION_STATES)[keyof typeof RATION_STATES]

export const SIZING_OPTIONS = {
  shirt: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  pants_waist: ['28', '30', '32', '34', '36', '38', '40', '42'],
  pants_length: ['28', '30', '32', '34', '36'],
  shoe: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
} as const
