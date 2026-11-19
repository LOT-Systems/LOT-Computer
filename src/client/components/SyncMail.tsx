/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import { GhostButton, Tag } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useEmailInbox, type CohortMatch } from '#client/queries'
import { sync } from '../sync'

const LAST_SEEN_KEY = 'lot:mail:lastSeenAt'

const readLastSeen = (): number => {
  try { return Number(localStorage.getItem(LAST_SEEN_KEY) || 0) } catch { return 0 }
}
const writeLastSeen = (t: number) => {
  try { localStorage.setItem(LAST_SEEN_KEY, String(t)) } catch {}
}

/**
 * LOT® Email inbox inside Sync.
 * One line per correspondent, newest first. Mail composed in Log with
 * "/email to Name: …" lands here. Cohort matches (LOT Community /
 * Cohort Dating) are marked so a shared-pattern connection reads as such.
 */
export const SyncMail: React.FC<{ meId?: string }> = ({ meId }) => {
  const queryClient = useQueryClient()
  const { data } = useEmailInbox()
  const [lastSeen] = React.useState(readLastSeen)

  React.useEffect(() => {
    const { dispose } = sync.listen('direct_message', (msg: any) => {
      if (msg?.receiverId === meId) queryClient.invalidateQueries(['/api/email/inbox'])
    })
    return dispose
  }, [meId])

  const mail = data?.mail || []

  // Mark as seen once rendered (next visit shows only newer as NEW)
  React.useEffect(() => {
    if (mail.length) writeLastSeen(Date.now())
  }, [mail.length])

  // Cohort set from cache only — never trigger the heavy cohort analysis here
  const cohortIds = React.useMemo(() => {
    const cached = queryClient.getQueryData<{ matches?: CohortMatch[] }>(['/api/cohorts'])
    return new Set((cached?.matches || []).map((m) => m.user.id))
  }, [data])

  if (!mail.length) return null

  return (
    <div className="mb-80">
      <div className="mb-16 opacity-30" style={{ fontSize: '11px', letterSpacing: '0.08em' }}>
        MAIL · {mail.length}
      </div>
      {mail.map((m) => {
        const isNew = new Date(m.createdAt).getTime() > lastSeen
        return (
          <div key={m.id} className="group flex items-start gap-x-8 -mx-4 px-4 py-2 rounded grid-fill-hover">
            <GhostButton
              className="whitespace-nowrap pr-4"
              onClick={() => stores.goTo('dm', { userId: m.fromId })}
            >
              ✉ {m.from}
            </GhostButton>
            <div
              className={cn('whitespace-breakspaces flex-1', !isNew && 'opacity-60')}
              style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
            >
              {m.message.length > 160 ? `${m.message.slice(0, 160)}…` : m.message}
            </div>
            {isNew && <Tag className="text-acc/60 select-none -mt-[2px]" fill={false}>NEW</Tag>}
            {cohortIds.has(m.fromId) && (
              <Tag className="text-acc/40 select-none -mt-[2px]" fill={false}>COHORT</Tag>
            )}
            <span className="text-acc/0 group-hover:text-acc/40 whitespace-nowrap select-none">
              {dayjs(m.createdAt).fromNow()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
