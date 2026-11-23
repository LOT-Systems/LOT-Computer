/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { atom } from 'nanostores'

/**
 * LOT® Email draft handoff. Any surface (Cohort, Sync, profiles) can
 * set a recipient first name; the primary Log editor consumes it once
 * and seeds "/email to <Name>: " into the current log.
 */
export const $emailDraftTo = atom<string | null>(null)

export function composeEmailInLog(firstName: string | null | undefined) {
  if (!firstName) return
  $emailDraftTo.set(firstName.trim().split(/\s+/)[0])
}
