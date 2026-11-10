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
import { $emailDraft } from '#client/stores/email'
import { Button, GhostButton } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useEmails, useSendEmail, useMarkEmailsRead } from '#client/queries'
import { sync } from '../sync'
import { MAX_EMAIL_LENGTH } from '#shared/email'

/**
 * LOT® Email — Sync panel. New mail lands here (live via SSE `email`).
 * Compose here, or from Log with `/email to <name>: message`.
 */
export const MailPanel = React.memo(function MailPanelInner() {
  const me = useStore(stores.me)
  const draft = useStore($emailDraft)
  const queryClient = useQueryClient()
  const { data: emails } = useEmails({ refetchInterval: 60e3 })
  const { mutate: markRead } = useMarkEmailsRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/emails']),
  })

  const [composing, setComposing] = React.useState(false)
  const [to, setTo] = React.useState('')
  const [toUserId, setToUserId] = React.useState<string | undefined>()
  const [body, setBody] = React.useState('')
  const [error, setError] = React.useState('')
  const [showAll, setShowAll] = React.useState(false)

  const { mutate: sendEmail, isLoading: sending } = useSendEmail({
    onSuccess: () => {
      setBody('')
      setError('')
      setComposing(false)
      $emailDraft.set(null)
      queryClient.invalidateQueries(['/api/emails'])
    },
    onError: (err: any) => {
      const d = err?.response?.data
      setError(
        d?.error
          ? d.candidates ? `${d.error}: ${d.candidates.join(', ')}` : d.error
          : 'Email failed'
      )
    },
  })

  // Pre-addressed compose from Community / Cohort Connect
  React.useEffect(() => {
    if (!draft) return
    setTo(draft.to)
    setToUserId(draft.toUserId)
    setBody(draft.body || '')
    setComposing(true)
    $emailDraft.set(null)
  }, [draft])

  // Live delivery
  React.useEffect(() => {
    const { dispose } = sync.listen('email', () => {
      queryClient.invalidateQueries(['/api/emails'])
    })
    return () => dispose()
  }, [])

  const unread = React.useMemo(
    () => (emails || []).filter((e) => !e.isMine && !e.readAt),
    [emails]
  )
  const visible = showAll ? emails || [] : (emails || []).slice(0, 5)

  const onSend = (ev?: React.FormEvent) => {
    ev?.preventDefault()
    if (!body.trim() || (!to.trim() && !toUserId) || sending) return
    sendEmail(toUserId ? { toUserId, body } : { to: to.trim(), body })
  }

  if (!me) return null

  return (
    <div className="mb-40">
      <div className="flex items-center gap-x-8 mb-8">
        <span className="whitespace-nowrap">Mail</span>
        {unread.length > 0 && (
          <GhostButton onClick={() => markRead({})} title="Mark all as read">
            {unread.length} new
          </GhostButton>
        )}
        <div className="flex-1" />
        <Button size="small" kind="secondary" onClick={() => setComposing((v) => !v)}>
          {composing ? 'Cancel' : 'New'}
        </Button>
      </div>

      {composing && (
        <form onSubmit={onSend} className="mb-16 flex flex-col gap-y-8">
          <div className="flex items-center gap-x-8">
            <span className="text-acc/40 whitespace-nowrap">To</span>
            <input
              className="flex-1 bg-transparent outline-none border-b border-acc/20 py-2"
              value={to}
              onChange={(e) => { setTo(e.target.value); setToUserId(undefined) }}
              placeholder="Name"
              autoFocus={!to}
            />
          </div>
          <textarea
            className="w-full bg-transparent outline-none border border-acc/20 rounded p-8 min-h-[96px]"
            value={body}
            maxLength={MAX_EMAIL_LENGTH}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSend()
            }}
            placeholder="Message… (Ctrl+Enter to send)"
            autoFocus={!!to}
          />
          <div className="flex items-center gap-x-8">
            <Button type="submit" size="small" disabled={sending || !body.trim() || !(to.trim() || toUserId)}>
              Send
            </Button>
            {error && <span className="text-acc/60">{error}</span>}
          </div>
        </form>
      )}

      {(emails || []).length === 0 && !composing && (
        <div className="text-acc/40">
          No mail. In Log, type <span className="text-acc/60">/email to Name: message</span> and press Ctrl+Enter.
        </div>
      )}

      {visible.map((e) => {
        const isUnread = !e.isMine && !e.readAt
        return (
          <div
            key={e.id}
            className={cn(
              'group flex items-start gap-x-8 -mx-4 px-4 py-2 rounded grid-fill-hover cursor-pointer',
              !isUnread && 'text-acc/60'
            )}
            onClick={() => isUnread && markRead({ id: e.id })}
          >
            <span className="whitespace-nowrap">
              {e.isMine ? `→ ${e.receiverName}` : e.senderName}
            </span>
            <div className="flex-1 whitespace-breakspaces" style={{ wordBreak: 'break-word' }}>
              {e.body}
            </div>
            {isUnread && <span title="Unread">●</span>}
            <span className="text-acc/40 whitespace-nowrap">{dayjs(e.createdAt).fromNow()}</span>
          </div>
        )
      })}

      {(emails || []).length > 5 && (
        <div className="mt-8">
          <GhostButton onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Show less' : `Show all (${(emails || []).length})`}
          </GhostButton>
        </div>
      )}
    </div>
  )
})
