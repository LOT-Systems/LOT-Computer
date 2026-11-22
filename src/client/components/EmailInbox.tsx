/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — Inbox, rendered inside Sync.
 *
 * New mail arrives live over SSE ('lot_email'). Unread mail is full
 * strength, read mail fades to the LOT secondary tone. Opening Sync
 * marks the inbox read after a short dwell. Reply inline, or compose
 * from Log with "/email to <Name>. <message>".
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import { Block, Button, GhostButton, ResizibleGhostInput } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useLotEmails, useMarkLotEmailsRead, useSendLotEmail } from '#client/queries'
import { sync } from '../sync'
import { PublicLotEmail } from '#shared/types'
import { MAX_LOT_EMAIL_LENGTH } from '#shared/utils/lot-email'

const INBOX_TO_SHOW = 12
const READ_DWELL_MS = 2500

const shortName = (u: { firstName: string | null; lastName: string | null }) => {
  const first = (u.firstName || '').trim() || 'Member'
  const last = (u.lastName || '').trim()
  return last ? `${first} ${last.charAt(0)}.` : first
}

export const EmailInbox: React.FC = () => {
  const me = useStore(stores.me)
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const queryClient = useQueryClient()
  const { data } = useLotEmails()
  const { mutate: markRead } = useMarkLotEmailsRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/emails']),
  })

  const [live, setLive] = React.useState<PublicLotEmail[]>([])
  const [replyTo, setReplyTo] = React.useState<PublicLotEmail | null>(null)
  const [replyText, setReplyText] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const { mutate: send, isLoading: isSending } = useSendLotEmail({
    onSuccess: (email) => {
      setLive((prev) => (prev.some((x) => x.id === email.id) ? prev : [email, ...prev]))
      setReplyTo(null)
      setReplyText('')
      setError(null)
    },
    onError: (err: any) => setError(err?.response?.data?.error || 'Not sent'),
  })

  React.useEffect(() => {
    const { dispose } = sync.listen('lot_email', (email: PublicLotEmail) => {
      setLive((prev) => (prev.some((x) => x.id === email.id) ? prev : [email, ...prev]))
    })
    return dispose
  }, [])

  const emails = React.useMemo(() => {
    const fetched = data?.emails || []
    const ids = new Set(fetched.map((e) => e.id))
    return [...live.filter((e) => !ids.has(e.id)), ...fetched]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, INBOX_TO_SHOW)
  }, [data, live])

  const unreadIds = React.useMemo(
    () => emails.filter((e) => !e.isMine && !e.readAt).map((e) => e.id),
    [emails]
  )

  // Dwell → mark read. Keep the ids stable in a key so new mail restarts the timer.
  const unreadKey = unreadIds.join(',')
  React.useEffect(() => {
    if (!unreadKey) return
    const t = setTimeout(() => markRead({ ids: unreadKey.split(',') }), READ_DWELL_MS)
    return () => clearTimeout(t)
  }, [unreadKey])

  if (!me || emails.length === 0) return null

  const onReply = (email: PublicLotEmail) => (ev: React.MouseEvent) => {
    ev.preventDefault()
    ev.stopPropagation()
    setError(null)
    setReplyTo((cur) => (cur?.id === email.id ? null : email))
  }

  const onSubmitReply = (ev?: React.FormEvent) => {
    ev?.preventDefault()
    if (!replyTo || !replyText.trim() || isSending) return
    const other = replyTo.isMine ? replyTo.to : replyTo.from
    send({ toUserId: other.id, body: replyText, source: 'sync' })
  }

  const unread = unreadIds.length

  return (
    <div className="mb-80">
      <Block label="Email:" blockView>
        <div className="mb-8 text-acc/40">
          {unread > 0 ? `${unread} new` : 'Inbox'} · compose in Log: /email to Name. message
        </div>
        <div>
          {emails.map((e) => {
            const isUnread = !e.isMine && !e.readAt
            const label = e.isMine ? `→ ${shortName(e.to)}` : shortName(e.from)
            const date = dayjs(e.createdAt)
            const time = date.format(isTimeFormat12h ? 'hh:mm A' : 'HH:mm')
            const when = dayjs().diff(date, 'day') >= 1 ? `${time}, ${date.fromNow()}` : time
            return (
              <div key={e.id}>
                <div
                  className={cn(
                    'group flex items-start gap-x-8 grid-fill-hover -mx-4 px-4 py-2 rounded',
                    !isUnread && 'text-acc/40'
                  )}
                >
                  <GhostButton className="whitespace-nowrap pr-4" onClick={onReply(e)}>
                    {label}
                  </GhostButton>
                  <div
                    className="flex-1 whitespace-breakspaces"
                    style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
                  >
                    {e.body}
                  </div>
                  <div className="whitespace-nowrap select-none text-acc/40">{when}</div>
                </div>
                {replyTo?.id === e.id && (
                  <form onSubmit={onSubmitReply} className="flex items-center gap-x-8 mt-4 mb-8">
                    <span className="whitespace-nowrap text-acc/40">
                      → {shortName(e.isMine ? e.to : e.from)}
                    </span>
                    <ResizibleGhostInput
                      direction="vh"
                      value={replyText}
                      onChange={(v: string) => setReplyText(v.slice(0, MAX_LOT_EMAIL_LENGTH))}
                      onKeyDown={(ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
                        if (ev.key === 'Enter' && !ev.shiftKey && !ev.metaKey) {
                          ev.preventDefault()
                          onSubmitReply()
                        }
                      }}
                      placeholder="Reply..."
                      containerClassName="flex-grow leading-normal"
                      className="leading-normal"
                    />
                    <Button
                      type="submit"
                      kind="secondary"
                      size="small"
                      disabled={!replyText.trim() || isSending}
                    >
                      Send
                    </Button>
                  </form>
                )}
              </div>
            )
          })}
        </div>
        {error && <div className="mt-8 text-acc/40">EMAIL: {error.toUpperCase()}</div>}
      </Block>
    </div>
  )
}
