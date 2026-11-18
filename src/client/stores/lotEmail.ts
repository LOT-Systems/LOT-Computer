/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { atom } from 'nanostores'

/**
 * A pending "/email to <Name>." line handed from another surface
 * (Cohort, Community) to the primary Log entry. The Log consumes it once.
 */
export const $pendingEmailTo = atom<{ to: string; receiverId?: string } | null>(null)

export function composeEmailInLog(to: string, receiverId?: string) {
  $pendingEmailTo.set({ to, receiverId })
}
