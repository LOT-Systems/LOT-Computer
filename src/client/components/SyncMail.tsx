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
import * as stores from '#client/stores'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useEmailInbox } from '#client/queries'
import { sync } from '../sync'

const SEEN_KEY = 'lot:mail:seen'

const readSeen = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * LOT® Email inbox — new messages appear at the top of Sync.
 * Unread = received and not yet clicked (tracked per browser).
 * Click a message to mark it read and open the reply thread.
 */
export const SyncMail: React.FC = () => {
  const me = useStore(stores.me)
  const queryClient = useQueryClient()
  const { data } = useEmailInbox()
  const [seen, setSeen] = React.useState<string[]>(readSeen)
  const [open, setOpen] = React.useState(true)

  React.useEffect(() => {
    const { dispose } = sync.listen('direct_message', () => {
      queryClient.invalidateQueries(['/api/email/inbox'])
    })
    return dispose
  }, [])

  const mail = data?.mail || []
  const received = mail.filter((m) => !m.isMine)
  const unread = received.filter((m) => !seen.includes(m.id))
  if (!mail.length) return null

  const markRead = (id: string) => {
    if (seen.includes(id)) return
    const next = [...seen, id].slice(-500)
    setSeen(next)
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(next))
    } catch {}
  }

  const onOpen = (m: (typeof mail)[number]) => {
    markRead(m.id)
    stores.goTo('dm', { userId: m.isMine ? m.receiverId : m.senderId })
  }

  return (
    <div className="mb-40">
      <button
        className="text-acc/40 mb-8 select-none"
        onClick={() => setOpen((v) => !v)}
      >
        MAIL{unread.length ? ` · ${unread.length} NEW` : ''} {open ? '−' : '+'}
      </button>
      {open &&
        mail.slice(0, 8).map((m) => {
          const isNew = !m.isMine && !seen.includes(m.id)
          return (
            <div
              key={m.id}
              className="flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded"
              onClick={() => onOpen(m)}
            >
              <span className={cn('whitespace-nowrap', !isNew && 'text-acc/60')}>
                {isNew && '● '}
                {m.isMine ? `→ ${m.receiverName}` : m.senderName}
              </span>
              <span
                className={cn('flex-1 truncate', !isNew && 'text-acc/60')}
                title={m.message}
              >
                {m.message}
              </span>
              <span className="text-acc/40 whitespace-nowrap">
                {dayjs(m.createdAt).fromNow()}
              </span>
            </div>
          )
        })}
    </div>
  )
}
