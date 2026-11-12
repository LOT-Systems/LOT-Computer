/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { atom } from 'nanostores'

/**
 * LOT® Email draft hand-off. Cohort Dating / Community surfaces set a
 * recipient name here and route to Log; the primary Log editor picks it
 * up, inserts "/email to <Name>" and clears the atom.
 */
export const lotEmailDraftTo = atom<string | null>(null)

export function composeLotEmail(name: string) {
  lotEmailDraftTo.set(name.trim())
}
