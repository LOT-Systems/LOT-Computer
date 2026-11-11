/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { atom } from 'nanostores'
import axios from 'axios'
import type { LotEmail } from '#shared/types'
import { sync } from '../sync'

/**
 * LOT® Email client state.
 *  - lotEmailUnread:  count shown on the Sync nav button
 *  - lotEmailLive:    emails received over SSE since the inbox was fetched
 *  - lotEmailDraft:   a "/email to <Name>" line waiting to be inserted
 *                     into the primary Log entry (set by Sync / Cohort)
 */
export const lotEmailUnread = atom<number>(0)
export const lotEmailLive = atom<LotEmail[]>([])
export const lotEmailDraft = atom<string | null>(null)

let initialized = false

export function initLotEmail() {
  if (initialized) return
  initialized = true

  axios
    .get<{ unread: number }>('/api/lot-email/inbox', { withCredentials: true })
    .then((res) => lotEmailUnread.set(res.data?.unread || 0))
    .catch(() => {})

  sync.listen('lot_email', (email: LotEmail) => {
    if (!email?.id) return
    const prev = lotEmailLive.get()
    if (prev.some((e) => e.id === email.id)) return
    lotEmailLive.set([email, ...prev])
    if (!email.isMine) lotEmailUnread.set(lotEmailUnread.get() + 1)
  })
}

/** Open Log with "/email to <Name>" ready for the body */
export function composeLotEmail(name: string, goTo: (route: any) => void) {
  const clean = (name || '').trim()
  if (!clean) return
  lotEmailDraft.set(`/email to ${clean}\n`)
  goTo('logs')
}
