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
import { Button, ResizibleGhostInput } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import {
  useEmails,
  useSendEmail,
  useMarkEmailRead,
  LotEmailPerson,
  LotEmailRecord,
} from '#client/queries'
import { sync } from '../sync'
import { MAX_EMAIL_BODY_LENGTH } from '#shared/utils'

const nameOf = (p: LotEmailPerson | null | undefined) =>
  p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown' : 'Unknown'

/**
 * LOT® Email inbox + compose, rendered at the top of Sync.
 * New mail arrives live over SSE ('email' event, addressee only).
 */
export const EmailInbox: React.FC = () => {
  const me = useStore(stores.me)
  const draft = useStore(stores.emailDraft)
  const queryClient = useQueryClient()
  const { data } = useEmails()
  const { mutate: markRead } = useMarkEmailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/emails']),
  })

  const [openId, setOpenId] = React.useState<string | null>(null)
  const [composeOpen, setComposeOpen] = React.useState(false)
  const [receiver, setReceiver] = React.useState<{ receiverId?: string; name: string } | null>(null)
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const { mutate: sendEmail, isLoading: isSending } = useSendEmail({
    onSuccess: () => {
      setBody('')
      setSubject('')
      setError(null)
      setComposeOpen(false)
      setReceiver(null)
    },
    onError: (err: any) => setError(err?.response?.data?.error || 'Send failed'),
  })

  // Cohort / Community hands over a recipient
  React.useEffect(() => {
    if (!draft) return
    setReceiver({ receiverId: draft.receiverId, name: draft.name })
    setComposeOpen(true)
    stores.emailDraft.set(null)
  }, [draft])

  // Live delivery
  React.useEffect(() => {
    const { dispose } = sync.listen('email', (d: any) => {
      if (d?.receiverId === me?.id) queryClient.invalidateQueries(['/api/emails'])
    })
    return () => dispose()
  }, [me?.id])

  const emails = data?.emails || []
  const unread = data?.unread ?? emails.filter((e) => !e.readAt).length

  const onOpen = (e: LotEmailRecord) => {
    setOpenId(openId === e.id ? null : e.id)
    if (!e.readAt) {
      markRead({ id: e.id })
    }
  }

  const onReply = (e: LotEmailRecord) => {
    setReceiver({ receiverId: e.senderId, name: nameOf(e.from) })
    setSubject(/^re:/i.test(e.subject) ? e.subject : `Re: ${e.subject}`)
    setComposeOpen(true)
  }

  const onSend = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!receiver?.receiverId || !body.trim()) return
    sendEmail({
      receiverId: receiver.receiverId,
      subject: subject.trim() || undefined,
      body,
    })
  }

  if (!emails.length && !composeOpen) {
    return (
      <div className="mb-40 text-acc/40">
        MAIL · empty · write from Log: /email to Name. Message
      </div>
    )
  }

  return (
    <div className="mb-40">
      <div className="flex items-center gap-x-8 mb-8">
        <span>MAIL</span>
        <span className="text-acc/40">{unread > 0 ? `${unread} new` : 'no new'}</span>
      </div>

      {composeOpen && (
        <form onSubmit={onSend} className="mb-16 flex flex-col gap-y-4">
          <div className="text-acc/60">
            To {receiver?.name || '—'}
            {!receiver?.receiverId && (
              <span className="text-acc/40"> (pick someone from Cohort, or reply to a mail)</span>
            )}
          </div>
          <ResizibleGhostInput
            direction="vh"
            value={subject}
            onChange={setSubject}
            placeholder="Subject (optional)"
            containerClassName="leading-normal"
            className="leading-normal"
          />
          <ResizibleGhostInput
            direction="vh"
            value={body}
            onChange={(v: string) => setBody(v.slice(0, MAX_EMAIL_BODY_LENGTH))}
            placeholder="Write…"
            containerClassName="leading-normal"
            className="leading-normal"
          />
          <div className="flex items-center gap-x-8">
            <Button
              type="submit"
              kind="secondary"
              size="small"
              disabled={isSending || !receiver?.receiverId || !body.trim()}
            >
              {isSending ? 'Sending…' : 'Send'}
            </Button>
            <Button
              type="button"
              kind="secondary"
              size="small"
              onClick={() => { setComposeOpen(false); setError(null) }}
            >
              Cancel
            </Button>
            {error && <span className="text-acc/60">{error}</span>}
          </div>
        </form>
      )}

      {emails.slice(0, 10).map((e) => {
        const isOpen = openId === e.id
        return (
          <div key={e.id} className="-mx-4 px-4 py-2 rounded grid-fill-hover">
            <div className="flex items-start gap-x-8 cursor-pointer" onClick={() => onOpen(e)}>
              <span className={cn('whitespace-nowrap', !e.readAt && 'font-bold')}>
                {nameOf(e.from)}
              </span>
              <span className={cn('flex-1 truncate', e.readAt && 'text-acc/60')}>{e.subject}</span>
              <span className="text-acc/40 whitespace-nowrap">
                {dayjs(e.createdAt).fromNow()}
              </span>
            </div>
            {isOpen && (
              <div className="pl-0 py-4">
                <div className="whitespace-breakspaces" style={{ wordBreak: 'break-word' }}>
                  {e.body}
                </div>
                <div className="mt-4">
                  <Button type="button" kind="secondary" size="small" onClick={() => onReply(e)}>
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
