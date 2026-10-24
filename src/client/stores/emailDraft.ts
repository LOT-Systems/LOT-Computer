/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { atom } from 'nanostores'

/**
 * Pending email recipient. Set by Cohort / Community surfaces
 * (stores.goTo('sync') afterwards) to open the compose form in Sync.
 */
export const $emailDraftTo = atom<{ id: string; name: string } | null>(null)
