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
import { Button, GhostButton, ResizibleGhostInput } from '#client/components/ui'
import { useMail, useMarkMailRead, useSendMail } from '#client/queries'
import { sync } from '../sync'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import { MAX_MAIL_BODY_LENGTH } from '#shared/utils'

const fullName = (u: { firstName: string | null; lastName: string | null }) =>
  `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown'

/**
 * LOT® Mail — inbox lives in Sync. Compose in Log with "/email to Name."
 * or here (also reachable from Cohort → "Send message").
 */
export const Mail: React.FC = () => {
  const queryClient = useQueryClient()
  const target = useStore(stores.mailComposeTarget)
  const { data } = useMail()
  const [to, setTo] = React.useState('')
  const [toUserId, setToUserId] = React.useState<string | undefined>()
  const [body, setBody] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  const refresh = React.useCallback(
    () => queryClient.invalidateQueries(['/api/mail']),
    [queryClient]
  )
  const { mutate: markRead } = useMarkMailRead({ onSuccess: refresh })
  const { mutate: send, isLoading: sending } = useSendMail({
    onSuccess: () => {
      setBody('')
      setError(null)
      refresh()
    },
    onError: (err: any) =>
      setError(err?.response?.data?.error || 'Mail failed to send'),
  })

  // New mail arrives via SSE (private per recipient)
  React.useEffect(() => {
    const { dispose } = sync.listen('mail', () => refresh())
    return () => dispose()
  }, [refresh])

  // Cohort → "Send message" preselects a recipient
  React.useEffect(() => {
    if (!target) return
    setTo(target.name)
    setToUserId(target.id)
    setOpen(true)
    stores.mailComposeTarget.set(null)
  }, [target])

  const mails = data?.mails || []
  const unread = data?.unread || 0
  const inbox = mails.filter((m) => !m.isMine)
  const sent = mails.filter((m) => m.isMine)

  const onSend = (ev?: React.FormEvent) => {
    ev?.preventDefault()
    if (!to.trim() || !body.trim() || sending) return
    setError(null)
    send({ to: toUserId ? undefined : to.trim(), toUserId, body })
  }

  const row = (m: (typeof mails)[number]) => {
    const other = m.isMine ? m.to : m.from
    const isNew = !m.isMine && !m.readAt
    return (
      <div
        key={m.id}
        className={cn(
          'group flex items-start gap-x-8 -mx-4 px-4 py-2 rounded grid-fill-hover',
          !m.isMine && 'cursor-pointer',
          m.isMine && 'text-acc/40'
        )}
        onClick={() => isNew && markRead({ ids: [m.id] })}
      >
        <span className="whitespace-nowrap">
          {isNew ? '● ' : ''}
          {m.isMine ? '→ ' : ''}
          {fullName(other)}
        </span>
        <div
          className="whitespace-breakspaces flex-1"
          style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
        >
          {m.body}
        </div>
        {!m.isMine && (
          <GhostButton
            className="text-acc/40 whitespace-nowrap"
            onClick={(ev: React.MouseEvent) => {
              ev.stopPropagation()
              setTo(fullName(m.from))
              setToUserId(m.from.id)
              setOpen(true)
            }}
          >
            Reply
          </GhostButton>
        )}
        <span className="text-acc/40 whitespace-nowrap select-none">
          {dayjs(m.createdAt).format('MMM D, HH:mm')}
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-[700px] mb-40">
      <div className="flex items-center gap-x-8 mb-16">
        <span>MAIL{unread > 0 ? ` (${unread} new)` : ''}</span>
        <GhostButton className="text-acc/40" onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Compose'}
        </GhostButton>
        {unread > 0 && (
          <GhostButton className="text-acc/40" onClick={() => markRead({})}>
            Mark all read
          </GhostButton>
        )}
      </div>

      {open && (
        <form onSubmit={onSend} className="mb-24">
          <div className="flex items-center gap-x-8 mb-8">
            <span className="text-acc/40">To</span>
            <ResizibleGhostInput
              direction="vh"
              value={to}
              onChange={(v: string) => {
                setTo(v)
                setToUserId(undefined)
              }}
              placeholder="Name"
              containerClassName="flex-grow leading-normal"
              className="leading-normal"
            />
          </div>
          <div className="flex items-start gap-x-8">
            <ResizibleGhostInput
              direction="vh"
              value={body}
              onChange={(v: string) => setBody(v.slice(0, MAX_MAIL_BODY_LENGTH))}
              placeholder="Message..."
              containerClassName="flex-grow leading-normal"
              className="leading-normal"
            />
            <Button
              type="submit"
              kind="secondary"
              size="small"
              disabled={!to.trim() || !body.trim() || sending}
            >
              Send
            </Button>
          </div>
          {error && <div className="mt-8 text-acc/60">{error}</div>}
        </form>
      )}

      {inbox.length === 0 && sent.length === 0 ? (
        <div className="text-acc/40">
          No mail. In Log type: /email to Name. Your message
        </div>
      ) : (
        <>
          {inbox.slice(0, 20).map(row)}
          {sent.length > 0 && <div className="mt-16" />}
          {sent.slice(0, 10).map(row)}
        </>
      )}
    </div>
  )
}
