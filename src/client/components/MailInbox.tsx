/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import { GhostButton } from '#client/components/ui'
import { MailComposer } from '#client/components/MailComposer'
import { useMailInbox, useMarkMailRead } from '#client/queries'
import { $mailCompose } from '#client/stores/mail'
import { sync } from '../sync'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'

const MAIL_KEY = ['/api/mail']

/**
 * Sync → MAIL. Shows incoming LOT Email (unread first in view order = newest
 * first) and hosts the reply / cohort composer.
 */
export const MailInbox: React.FC = () => {
  const queryClient = useQueryClient()
  const compose = useStore($mailCompose)
  const { data: inbox } = useMailInbox()
  const { mutate: markRead } = useMarkMailRead({
    onSuccess: () => queryClient.invalidateQueries(MAIL_KEY),
  })
  const [replyTo, setReplyTo] = React.useState<string | null>(null)

  React.useEffect(() => {
    const { dispose } = sync.listen('mail_message', () => {
      queryClient.invalidateQueries(MAIL_KEY)
    })
    return () => dispose()
  }, [])

  const items = inbox || []
  const unread = items.filter((m) => !m.isRead).length
  if (!items.length && !compose) return null

  return (
    <div className="mb-40">
      <div className="text-[11px] tracking-[0.08em] opacity-40 mb-8">
        MAIL{unread > 0 ? ` · ${unread} NEW` : ''}
      </div>

      {compose && (
        <div className="mb-16">
          <MailComposer
            recipient={{ id: compose.recipientId, name: compose.name }}
            source={compose.source}
            onDone={() => setTimeout(() => $mailCompose.set(null), 1500)}
          />
        </div>
      )}

      {items.slice(0, 10).map((m) => (
        <div
          key={m.id}
          className={cn('py-2', m.isRead && 'text-acc/40')}
          onClick={() => !m.isRead && markRead({ id: m.id })}
        >
          <div className="flex items-baseline gap-x-8">
            <span className="whitespace-nowrap">
              {!m.isRead && '● '}
              {m.senderName}
            </span>
            <span
              className="whitespace-breakspaces"
              style={{ wordBreak: 'break-word' }}
            >
              {m.body}
            </span>
            <span className="text-acc/40 whitespace-nowrap">
              {dayjs(m.createdAt).fromNow()}
            </span>
            <GhostButton
              onClick={(ev: React.MouseEvent) => {
                ev.stopPropagation()
                setReplyTo(replyTo === m.id ? null : m.id)
              }}
            >
              Reply
            </GhostButton>
          </div>
          {replyTo === m.id && (
            <div className="mt-8 mb-8">
              <MailComposer
                recipient={{ id: m.senderId, name: m.senderName }}
                source="sync"
                onDone={() => setTimeout(() => setReplyTo(null), 1500)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
