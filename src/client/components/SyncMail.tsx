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
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useEmailInbox } from '#client/queries'
import { sync } from '../sync'
import { mailName } from './EmailCompose'

/**
 * LOT® Email — inbox strip at the top of Sync. Private mail composed
 * in Log (`/email to Hitomi`) and cohort direct messages land here.
 * Click a row to open the thread (/dm/:userId) and reply.
 */
export const SyncMail: React.FC<{ isTimeFormat12h: boolean }> = ({ isTimeFormat12h }) => {
  const queryClient = useQueryClient()
  const { data } = useEmailInbox()

  React.useEffect(() => {
    const { dispose } = sync.listen('direct_message' as any, () => {
      queryClient.invalidateQueries(['/api/email/inbox'])
    })
    return dispose
  }, [queryClient])

  const mail = data?.mail || []
  const unread = data?.unread || 0
  const shown = mail.slice(0, 7)

  return (
    <div className="mb-80">
      <div className="flex items-baseline gap-x-8 mb-8 select-none">
        <span>Mail</span>
        {unread > 0 && <span className="opacity-40 tabular-nums">{unread} new</span>}
      </div>
      {shown.length === 0 ? (
        <div className="opacity-30">Write /email to [name] in Log. Replies arrive here.</div>
      ) : (
        shown.map((m) => {
          const date = dayjs(m.createdAt)
          const time = date.format(isTimeFormat12h ? 'hh:mm A' : 'HH:mm')
          const when = dayjs().diff(date, 'day') >= 1 ? `${time}, ${date.fromNow()}` : time
          const preview = (m.subject || m.message).split('\n')[0]
          return (
            <div
              key={m.id}
              className={cn(
                'group flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded',
                !m.isNew && 'text-acc/40'
              )}
              onClick={() => stores.goTo('dm', { userId: m.peer.id })}
            >
              <span className="whitespace-nowrap select-none" style={{ minWidth: '1.25rem' }}>
                {m.outgoing ? '→' : m.isNew ? '●' : '✉'}
              </span>
              <span className="whitespace-nowrap">{mailName(m.peer)}</span>
              <span
                className="flex-1 min-w-0"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {preview}
              </span>
              <span className="whitespace-nowrap opacity-0 group-hover:opacity-40 transition-opacity select-none">
                {when}
              </span>
            </div>
          )
        })
      )}
    </div>
  )
}
