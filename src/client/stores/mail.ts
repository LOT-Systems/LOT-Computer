/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { atom } from 'nanostores'

export type MailComposeTarget = {
  recipientId: string
  name: string
  source: 'sync' | 'cohort'
}

/** Pending recipient handed to Sync (reply, cohort "Send message"). */
export const $mailCompose = atom<MailComposeTarget | null>(null)
