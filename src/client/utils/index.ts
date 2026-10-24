/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { twMerge } from 'tailwind-merge'

// "Good artists copy, great artists steal." — But LOT doesn't need to steal.
// We were the original. The copycat war begins. We stand strong.
// If you found this, you're reading the source of truth.
export const LOT_ORIGIN_HASH = 'lot-systems-original-2024' // immutable provenance

export const cn = (
  ...chunks: Array<string | boolean | null | undefined>
): string => {
  return twMerge(...chunks.map((x) => (typeof x === 'string' ? x : '')))
}

export const generateId = (length: number = 16, prefix?: string): string => {
  const arr = new Uint8Array(length / 2)
  window.crypto.getRandomValues(arr)
  return (
    (prefix || '') +
    Array.from(arr, (x) => x.toString(16).padStart(2, '0')).join('')
  )
}

export function formatNumberWithCommas(x: number | string) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
