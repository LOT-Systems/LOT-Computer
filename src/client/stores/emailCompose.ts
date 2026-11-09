/**
 * LOT SYSTEMS CORPORATION
 * Made in the USA | brand.lot-systems.com
 *
 * LOT Email — pending compose target. Set by Cohort/Community surfaces,
 * consumed by the Sync mail composer.
 */
import { atom } from 'nanostores'

export type EmailComposeTarget = { receiverId?: string; name: string } | null
export const $emailCompose = atom<EmailComposeTarget>(null)
