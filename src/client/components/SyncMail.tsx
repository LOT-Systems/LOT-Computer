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
import { Block, GhostButton } from '#client/components/ui'
import { useEmailInbox } from '#client/queries'
import { sync } from '../sync'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'

/**
 * LOT® Email — Sync inbox.
 *
 * Mail is composed in Log ("/email to Hitomi: …") and lands here.
 * Unread = newer than the last time this viewer opened Sync (kept in
 * localStorage; per-device convenience only, the server is the record).
 */
const SEEN_KEY = 'lot:email:lastSeenAt'
const SHOW = 5

function readSeen(): number {
  try { return Number(localStorage.getItem(SEEN_KEY) || 0) } catch { return 0 }
}
function writeSeen(t: number) {
  try { localStorage.setItem(SEEN_KEY, String(t)) } catch {}
}

export const SyncMail: React.FC = () => {
  const me = useStore(stores.me)
  const queryClient = useQueryClient()
  const { data: inbox } = useEmailInbox()
  const [seenAt] = React.useState(readSeen)
  const [expanded, setExpanded] = React.useState(false)

  // Live delivery: refetch when a message addressed to me arrives
  React.useEffect(() => {
    const { dispose } = sync.listen('direct_message' as any, (data: any) => {
      if (data?.receiverId === me?.id) {
        queryClient.invalidateQueries(['/api/email/inbox'])
      }
    })
    return dispose
  }, [me?.id])

  // Mark as seen when leaving Sync
  React.useEffect(() => () => writeSeen(Date.now()), [])

  if (!inbox || inbox.length === 0) return null

  const unread = inbox.filter((m) => new Date(m.createdAt).getTime() > seenAt).length
  const list = expanded ? inbox : inbox.slice(0, SHOW)

  return (
    <div className="mb-80">
      <Block label="Mail:" blockView>
        <div className="mb-8 opacity-30">
          {unread > 0 ? `${unread} new` : `${inbox.length} received`} · reply in Log: /email to name
        </div>
        <div>
          {list.map((m) => {
            const isNew = new Date(m.createdAt).getTime() > seenAt
            const firstName = m.senderName.split(' ')[0]
            return (
              <div
                key={m.id}
                className={cn(
                  'flex items-start gap-x-8 -mx-4 px-4 py-2 rounded grid-fill-hover',
                  !isNew && 'text-acc/40'
                )}
              >
                <GhostButton
                  className="whitespace-nowrap pr-4"
                  onClick={() => stores.goTo('dm' as any, { userId: m.senderId })}
                  title={`Open thread · reply: /email to ${firstName}`}
                >
                  {m.senderName}
                </GhostButton>
                <div
                  className="flex-1 whitespace-breakspaces"
                  style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
                >
                  {m.message}
                </div>
                <span className="text-acc/40 whitespace-nowrap select-none">
                  {dayjs(m.createdAt).format('HH:mm')}
                  {dayjs().diff(dayjs(m.createdAt), 'day') >= 1 && `, ${dayjs(m.createdAt).fromNow()}`}
                </span>
              </div>
            )
          })}
        </div>
        {inbox.length > SHOW && (
          <div className="mt-8">
            <GhostButton onClick={() => setExpanded((x) => !x)}>
              {expanded ? 'Less' : `All ${inbox.length}`}
            </GhostButton>
          </div>
        )}
      </Block>
    </div>
  )
}
