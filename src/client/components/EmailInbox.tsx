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
import { useEmails, useMarkEmailRead, EmailRecord } from '#client/queries'
import { sync } from '../sync'

/**
 * LOT Email inbox. Lives at the top of Sync, above the chat stream.
 * New mail arrives over SSE (email_received) and is composed in Log
 * with "/email to <name>". Hidden entirely while the inbox is empty.
 */
export const EmailInbox: React.FC = () => {
  const queryClient = useQueryClient()
  const { data } = useEmails()
  const { mutate: markRead } = useMarkEmailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/emails']),
  })
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [showAll, setShowAll] = React.useState(false)

  React.useEffect(() => {
    const { dispose } = sync.listen('email_received', () => {
      queryClient.invalidateQueries(['/api/emails'])
    })
    return dispose
  }, [])

  const inbox = data?.inbox || []
  if (inbox.length === 0) return null

  const rows = showAll ? inbox : inbox.slice(0, 5)

  const onOpen = (m: EmailRecord) => {
    const willOpen = openId !== m.id
    setOpenId(willOpen ? m.id : null)
    if (willOpen && !m.readAt) markRead({ id: m.id })
  }

  const onReply = (m: EmailRecord) => (ev: React.MouseEvent) => {
    ev.stopPropagation()
    stores.emailDraft.set({ id: m.senderId, name: m.senderName })
    stores.goTo('logs')
  }

  return (
    <div className="mb-40">
      <div className="mb-8 text-acc/40">
        MAIL{data!.unread > 0 && ` · ${data!.unread} NEW`}
      </div>
      {rows.map((m) => {
        const unread = !m.readAt
        const isOpen = openId === m.id
        return (
          <div
            key={m.id}
            className="cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded"
            onClick={() => onOpen(m)}
          >
            <div className="flex items-start gap-x-8">
              <span className={cn('whitespace-nowrap', !unread && 'text-acc/60')}>
                {m.senderName}
              </span>
              <span className={cn('flex-1 truncate', !unread && 'text-acc/60')}>
                {m.subject || '(no subject)'}
              </span>
              {unread && <Tag fill={false}>NEW</Tag>}
              <span className="text-acc/40 whitespace-nowrap">
                {dayjs(m.createdAt).fromNow()}
              </span>
            </div>
            {isOpen && (
              <div className="mt-4 mb-8">
                <div className="whitespace-breakspaces" style={{ wordBreak: 'break-word' }}>
                  {m.body}
                </div>
                <GhostButton className="mt-4 text-acc/60" onClick={onReply(m)}>
                  Reply
                </GhostButton>
              </div>
            )}
          </div>
        )
      })}
      {inbox.length > 5 && (
        <GhostButton className="mt-4 text-acc/40" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Less' : `All ${inbox.length}`}
        </GhostButton>
      )}
    </div>
  )
}
