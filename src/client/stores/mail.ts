/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { atom } from 'nanostores'
import { goTo } from './router.js'

/**
 * Pending LOT® Mail draft handed to Sync > Mail by other surfaces
 * (Cohort widget, Log). Sync consumes and clears it.
 */
export interface MailDraft {
  receiverId: string
  receiverName: string
  body?: string
}

export const $mailDraft = atom<MailDraft | null>(null)

export function composeMail(draft: MailDraft) {
  $mailDraft.set(draft)
  goTo('sync')
}

export const $mailUnread = atom<number>(0)
