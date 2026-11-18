/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useEmailInbox, LotEmailRecord } from '#client/queries'
import { lotEmailText } from '#shared/utils/lot-email'
import { sync } from '../sync'

const INBOX_VISIBLE = 5

/**
 * LOT® Email inbox inside Sync.
 * Letters composed in Log with "/email to <Name>" land here in real time.
 * Renders nothing when the inbox is empty — silence is the default state.
 */
export const SyncEmailInbox: React.FC = () => {
  const me = useStore(stores.me)
  const { data } = useEmailInbox()
  const [live, setLive] = React.useState<LotEmailRecord[]>([])
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [showAll, setShowAll] = React.useState(false)

  React.useEffect(() => {
    const { dispose } = sync.listen('lot_email', (payload: any) => {
      if (!me || payload.receiverId !== me.id) return
      setLive((prev) =>
        prev.some((x) => x.id === payload.id)
          ? prev
          : [{
              id: payload.id,
              senderId: payload.senderId,
              senderName: payload.senderName || 'LOT Member',
              message: payload.message,
              createdAt: payload.createdAt,
            }, ...prev]
      )
    })
    return dispose
  }, [me?.id])

  const emails = React.useMemo(() => {
    const fetched = data?.emails || []
    const ids = new Set(fetched.map((e) => e.id))
    return [...live.filter((e) => !ids.has(e.id)), ...fetched]
  }, [data, live])

  if (!emails.length) return null
  const visible = showAll ? emails : emails.slice(0, INBOX_VISIBLE)

  return (
    <div className="mb-40">
      <Block label="EMAIL:" blockView>
        <div>
          {visible.map((e) => {
            const text = lotEmailText(e.message)
            const firstLine = text.split('\n')[0]
            const isOpen = openId === e.id
            const firstName = (e.senderName || '').split(' ')[0]
            return (
              <div
                key={e.id}
                className="grid-fill-hover -mx-4 px-4 py-2 rounded cursor-pointer"
                onClick={() => setOpenId(isOpen ? null : e.id)}
              >
                <div className="flex items-start gap-x-8">
                  <span className="whitespace-nowrap">{e.senderName}</span>
                  <span className={cn('flex-1 min-w-0', !isOpen && 'truncate text-acc/60')}>
                    {isOpen ? '' : firstLine}
                  </span>
                  <span className="text-acc/40 whitespace-nowrap select-none">
                    {dayjs(e.createdAt).fromNow()}
                  </span>
                </div>
                {isOpen && (
                  <div className="mt-4">
                    <div
                      className="whitespace-breakspaces"
                      style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
                    >
                      {text}
                    </div>
                    {firstName && (
                      <div className="text-acc/40 mt-8 select-all">
                        Reply in Log: /email to {firstName}.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {emails.length > INBOX_VISIBLE && (
            <div
              className="text-acc/40 cursor-pointer mt-4 select-none"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? 'Show less' : `Show all (${emails.length})`}
            </div>
          )}
        </div>
      </Block>
    </div>
  )
}
