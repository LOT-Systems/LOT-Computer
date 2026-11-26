/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { atom } from 'nanostores'

export type LotEmailSource = 'log' | 'sync' | 'cohort'

/**
 * Draft hand-off into Log. Cohort Dating (LOT Community) and Sync set
 * this; the primary Log editor appends `/email to <name>` and clears it.
 */
export const lotEmailDraft = atom<{ to: string; source: LotEmailSource } | null>(null)

/** Unread LOT Email count — shown on Sync. */
export const lotEmailUnread = atom<number>(0)

export function composeLotEmail(to: string, source: LotEmailSource = 'log') {
  lotEmailDraft.set({ to, source })
}
