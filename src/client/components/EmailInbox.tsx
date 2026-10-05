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
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import {
  LotEmailRecord,
  useEmails,
  useSendEmail,
} from '#client/queries'
import { sync } from '../sync'

const personName = (p: { firstName: string | null; lastName: string | null }) =>
  `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown'

/**
 * LOT® Email — the Sync inbox. Compose happens in Log
 * ("/email to Name. text /send"), or here when replying or when a
 * recipient is handed over from Community.
 */
export const EmailInbox: React.FC = () => {
  const queryClient = useQueryClient()
  const compose = useStore(stores.emailCompose)
  const [box, setBox] = React.useState<'inbox' | 'sent'>('inbox')
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const { data } = useEmails(box)
  const { data: inboxData } = useEmails('inbox')
  const unread = inboxData?.unread || 0
  const emails = data?.emails || []

  const refresh = React.useCallback(() => {
    queryClient.invalidateQueries(['/api/emails?box=inbox'])
    queryClient.invalidateQueries(['/api/emails?box=sent'])
  }, [queryClient])

  React.useEffect(() => {
    const { dispose } = sync.listen('lot_email', () => { refresh() })
    return () => dispose()
  }, [refresh])

  const { mutate: sendEmail, isLoading: isSending } = useSendEmail({
    onSuccess: () => {
      setDraft('')
      setError(null)
      stores.emailCompose.set(null)
      setBox('sent')
      refresh()
    },
    onError: (e: any) => setError(e?.response?.data?.error || 'Could not send'),
  })

  const onSubmit = (ev?: React.FormEvent) => {
    ev?.preventDefault()
    if (!compose || !draft.trim() || isSending) return
    sendEmail({ receiverId: compose.toId, body: draft })
  }

  const onOpen = (m: LotEmailRecord) => {
    setOpenId(openId === m.id ? null : m.id)
    if (box === 'inbox' && !m.readAt) {
      // fire-and-forget; the list refreshes right after
      fetch(`/api/emails/${m.id}/read`, { method: 'POST', credentials: 'include' })
        .then(() => refresh())
        .catch(() => undefined)
    }
  }

  if (!emails.length && !compose && box === 'inbox' && !unread) return null

  return (
    <div className="mb-40">
      <div className="flex items-center gap-x-16 mb-16">
        <span className="opacity-40">Email</span>
        <GhostButton onClick={() => setBox('inbox')} className={cn(box !== 'inbox' && 'opacity-40')}>
          Inbox{unread ? ` (${unread})` : ''}
        </GhostButton>
        <GhostButton onClick={() => setBox('sent')} className={cn(box !== 'sent' && 'opacity-40')}>
          Sent
        </GhostButton>
      </div>

      {compose && (
        <form onSubmit={onSubmit} className="mb-24">
          <div className="opacity-40 mb-4">To {compose.toName}</div>
          <div className="flex items-start gap-x-8">
            <ResizibleGhostInput
              direction="vh"
              value={draft}
              onChange={setDraft}
              placeholder="Write an email..."
              containerClassName="flex-grow leading-normal"
              className="leading-normal"
            />
            <Button type="submit" kind="secondary" size="small" disabled={!draft.trim() || isSending}>
              Send
            </Button>
            <GhostButton onClick={() => stores.emailCompose.set(null)}>Cancel</GhostButton>
          </div>
          {error && <div className="text-acc/40 mt-4">{error}</div>}
        </form>
      )}

      {emails.length === 0 && <div className="opacity-40">No emails.</div>}
      {emails.map((m) => {
        const other = box === 'inbox' ? m.from : m.to
        const isUnread = box === 'inbox' && !m.readAt
        return (
          <div key={m.id} className="mb-4">
            <div
              className="flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded"
              onClick={() => onOpen(m)}
            >
              <span className="whitespace-nowrap">{isUnread ? '● ' : ''}{personName(other)}</span>
              <span className={cn('flex-1 truncate', !isUnread && 'opacity-60')}>{m.subject}</span>
              <span className="opacity-40 whitespace-nowrap">{dayjs(m.createdAt).fromNow()}</span>
            </div>
            {openId === m.id && (
              <div className="pl-8 py-8">
                <div className="whitespace-breakspaces" style={{ wordBreak: 'break-word' }}>{m.body}</div>
                {box === 'inbox' && (
                  <GhostButton
                    className="mt-8 opacity-60"
                    onClick={() => stores.emailCompose.set({ toId: m.from.id, toName: personName(m.from) })}
                  >
                    Reply
                  </GhostButton>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
