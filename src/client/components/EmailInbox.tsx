/**
 * LOT SYSTEMS CORPORATION
 * Made in the USA | brand.lot-systems.com
 *
 * LOT Email — Sync inbox. New mail on top of LOT Chat; reply inline;
 * cohort "Send email" opens the composer pre-addressed.
 */
import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import { $emailCompose } from '#client/stores/emailCompose'
import { useEmails, useSendEmail, useMarkEmailRead, EmailRecord } from '#client/queries'
import { sync } from '../sync'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'

const nameOf = (p: { firstName: string | null; lastName: string | null } | null) =>
  p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown' : 'Unknown'

export const EmailInbox: React.FC = () => {
  const me = useStore(stores.me)
  const target = useStore($emailCompose)
  const qc = useQueryClient()
  const { data } = useEmails()
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState('')
  const [to, setTo] = React.useState<{ receiverId?: string; name: string } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [showSent, setShowSent] = React.useState(false)

  const { mutate: markRead } = useMarkEmailRead({
    onSuccess: () => qc.invalidateQueries(['/api/emails']),
  })
  const { mutate: send, isLoading } = useSendEmail({
    onSuccess: () => {
      setDraft('')
      setTo(null)
      setError(null)
      qc.invalidateQueries(['/api/emails'])
    },
    onError: (err: any) =>
      setError(String(err?.response?.data?.error || 'Send failed')),
  })

  // Pending compose target from Cohort / Community
  React.useEffect(() => {
    if (target) {
      setTo(target)
      $emailCompose.set(null)
    }
  }, [target])

  // Live: new mail for me
  React.useEffect(() => {
    const { dispose } = sync.listen('email_received', (d: any) => {
      if (d.receiverId === me?.id) qc.invalidateQueries(['/api/emails'])
    })
    return dispose
  }, [me?.id])

  const all = data?.emails || []
  const inbox = all.filter((e) => !e.isMine)
  const sent = all.filter((e) => e.isMine)
  const list = showSent ? sent : inbox
  const unread = data?.unread || 0

  const open = (e: EmailRecord) => {
    setOpenId(openId === e.id ? null : e.id)
    if (!e.isMine && !e.readAt) markRead({ id: e.id })
  }

  if (!all.length && !to) return null

  return (
    <div className="mb-40">
      <div className="flex items-center gap-x-8 mb-8 text-acc/60">
        <span>MAIL{unread ? ` · ${unread} NEW` : ''}</span>
        <button type="button" className="underline" onClick={() => setShowSent(!showSent)}>
          {showSent ? 'Inbox' : 'Sent'}
        </button>
      </div>

      {to && (
        <div className="mb-16">
          <div className="text-acc/60">TO {to.name || '…'}</div>
          <textarea
            className="w-full bg-transparent border border-acc/20 p-4 mt-4"
            rows={3}
            autoFocus
            value={draft}
            maxLength={5000}
            onChange={(ev) => setDraft(ev.target.value)}
          />
          <div className="flex gap-x-8 items-center">
            <button
              type="button"
              className="underline disabled:opacity-30"
              disabled={!draft.trim() || isLoading}
              onClick={() => send({ receiverId: to.receiverId, to: to.receiverId ? undefined : to.name, body: draft })}
            >
              Send email
            </button>
            <button type="button" className="underline text-acc/40" onClick={() => setTo(null)}>
              Cancel
            </button>
            {error && <span className="text-acc/60">{error}</span>}
          </div>
        </div>
      )}

      {list.map((e) => {
        const who = e.isMine ? e.to : e.from
        const isNew = !e.isMine && !e.readAt
        return (
          <div key={e.id} className="py-2">
            <div className={cn('flex gap-x-8 cursor-pointer', !isNew && 'text-acc/60')} onClick={() => open(e)}>
              <span className="whitespace-nowrap">{isNew ? '● ' : ''}{e.isMine ? 'To ' : ''}{nameOf(who)}</span>
              <span className={cn('truncate', openId === e.id && 'hidden')}>{e.body.split('\n')[0]}</span>
              <span className="ml-auto text-acc/40 whitespace-nowrap">{dayjs(e.createdAt).fromNow()}</span>
            </div>
            {openId === e.id && (
              <div className="whitespace-pre-wrap pl-16 py-4" style={{ wordBreak: 'break-word' }}>
                {e.body}
                {!e.isMine && who && (
                  <div className="mt-4">
                    <button
                      type="button"
                      className="underline text-acc/60"
                      onClick={() => setTo({ receiverId: who.id, name: nameOf(who) })}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
      {!list.length && <div className="text-acc/40">{showSent ? 'No sent mail' : 'No mail'}</div>}
    </div>
  )
}
