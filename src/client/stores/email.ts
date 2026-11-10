/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { atom } from 'nanostores'

/**
 * LOT® Email compose draft. Set by Community surfaces (Cohort Connect) so the
 * Sync Mail panel opens pre-addressed. `toUserId` wins over `to` on the server.
 */
export type EmailDraft = { to: string; toUserId?: string; body?: string }
export const $emailDraft = atom<EmailDraft | null>(null)
