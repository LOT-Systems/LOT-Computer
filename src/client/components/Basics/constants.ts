/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// LOT-FM-001 — BASIC RATION MODULE
// 23-ITEM CIVILIAN RATION LOAD

export * from '#shared/constants/basic-ration'

export const SIZING_OPTIONS = {
  shirt: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  pants_waist: ['28', '30', '32', '34', '36', '38', '40', '42'],
  pants_length: ['28', '30', '32', '34', '36'],
  shoe: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
} as const
