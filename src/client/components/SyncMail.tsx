/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — MAIL block at the top of Sync.
 * Inbox (unread first-class), tap to open + mark read, inline reply,
 * or "Write in Log" to compose with `/email to <name>`.
 * Live via SSE `lot_email` (delivered only to sender + receiver).
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import { Block, Button, GhostButton, ResizibleGhostInput } from '#client/components/ui'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import {
  LotEmailRecord,
  useLotEmail,
  useMarkLotEmailRead,
  useSendLotEmail,
} from '#client/queries'
import { composeLotEmail, lotEmailUnread } from '#client/stores/lotEmail'
import { sync } from '../sync'

const INBOX_TO_SHOW = 10
const SOURCE_LABEL: Record<string, string> = { log: 'Log', sync: 'Sync', cohort: 'Cohort' }

export const SyncMail: React.FC = () => {
  const queryClient = useQueryClient()
  const { data } = useLotEmail()
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [showSent, setShowSent] = React.useState(false)
  const [reply, setReply] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)

  const refresh = React.useCallback(
    () => queryClient.invalidateQueries(['/api/lot-email']),
    [queryClient]
  )

  React.useEffect(() => {
    const { dispose } = sync.listen('lot_email' as any, () => refresh())
    return dispose
  }, [refresh])

  React.useEffect(() => {
    lotEmailUnread.set(data?.unread || 0)
  }, [data?.unread])

  const { mutate: markRead } = useMarkLotEmailRead({ onSuccess: refresh })
  const { mutate: send, isLoading: isSending } = useSendLotEmail({
    onSuccess: () => {
      setReply('')
      setStatus('SENT')
      refresh()
    },
    onError: (err: any) =>
      setStatus(String(err?.response?.data?.error || 'LOT Email offline').toUpperCase()),
  })

  const list: LotEmailRecord[] = showSent ? data?.sent || [] : data?.inbox || []
  const unread = data?.unread || 0

  const onOpen = (e: LotEmailRecord) => {
    setStatus(null)
    setReply('')
    setOpenId(openId === e.id ? null : e.id)
    if (!e.isMine && !e.readAt) markRead({ id: e.id })
  }

  const onReply = (e: LotEmailRecord) => {
    if (!reply.trim()) return
    send({
      receiverId: e.isMine ? e.receiverId : e.senderId,
      body: reply,
      source: 'sync',
      replyToId: e.id,
    })
  }

  const onWriteInLog = (e: LotEmailRecord) => {
    const name = (e.isMine ? e.receiverName : e.senderName).split(' ')[0]
    composeLotEmail(name, 'sync')
    stores.goTo('logs')
  }

  const label = unread > 0 ? `MAIL · ${unread} NEW` : 'MAIL'

  return (
    <div className="mb-80">
      <Block label={label + ':'} blockView>
        <div className="flex gap-x-12 mb-8 opacity-60">
          <GhostButton onClick={() => setShowSent(false)}>
            <span className={cn(!showSent && 'underline')}>Inbox</span>
          </GhostButton>
          <GhostButton onClick={() => setShowSent(true)}>
            <span className={cn(showSent && 'underline')}>Sent</span>
          </GhostButton>
        </div>

        {list.length === 0 && (
          <div className="opacity-40">
            {showSent ? 'Nothing sent yet.' : 'No LOT Email yet.'} Type{' '}
            <GhostButton onClick={() => stores.goTo('logs')}>/email to [name]</GhostButton>{' '}
            in Log.
          </div>
        )}

        {list.slice(0, INBOX_TO_SHOW).map((e) => {
          const isOpen = openId === e.id
          const isUnread = !e.isMine && !e.readAt
          const who = e.isMine ? `To ${e.receiverName}` : e.senderName
          const preview = (e.subject || e.body).split('\n')[0].slice(0, 80)
          return (
            <div key={e.id} className="-mx-4 px-4 py-2 rounded">
              <div
                className={cn(
                  'group flex items-start gap-x-8 cursor-pointer grid-fill-hover',
                  !isUnread && !isOpen && 'opacity-40'
                )}
                onClick={() => onOpen(e)}
              >
                <span className="whitespace-nowrap">{isUnread ? '● ' : ''}{who}</span>
                <span className="flex-1 truncate">{isOpen ? '' : preview}</span>
                <span className="whitespace-nowrap opacity-40">
                  {dayjs(e.createdAt).fromNow()}
                </span>
              </div>

              {isOpen && (
                <div className="mt-8 mb-16">
                  {e.subject && <div className="mb-8">{e.subject}</div>}
                  <div
                    className="whitespace-breakspaces"
                    style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
                  >
                    {e.body}
                  </div>
                  <div className="mt-8 opacity-30">
                    {dayjs(e.createdAt).format('HH:mm DD/MM/YY')} · via {SOURCE_LABEL[e.source] || 'Log'}
                  </div>
                  <div className="flex items-center gap-x-8 mt-16">
                    <ResizibleGhostInput
                      direction="vh"
                      value={reply}
                      onChange={setReply}
                      placeholder="Reply..."
                      containerClassName="flex-grow leading-normal"
                      className="leading-normal"
                    />
                    <Button
                      kind="secondary"
                      size="small"
                      disabled={!reply.trim() || isSending}
                      onClick={() => onReply(e)}
                    >
                      {isSending ? 'Sending...' : 'Reply'}
                    </Button>
                    <GhostButton onClick={() => onWriteInLog(e)}>
                      <span className="opacity-40 whitespace-nowrap">Write in Log</span>
                    </GhostButton>
                  </div>
                  {status && <div className="mt-8 opacity-40">{status}</div>}
                </div>
              )}
            </div>
          )
        })}
      </Block>
    </div>
  )
}
