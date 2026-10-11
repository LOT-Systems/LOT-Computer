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
import { Button, GhostButton } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useMail, useMarkMailRead, useSendMail } from '#client/queries'
import { sync } from '../sync'

export const MAIL_PREFILL_KEY = 'lot-mail-to'

/** Cohort Connect → Sync handoff: open the composer addressed to this member */
export function prefillMailTo(id: string, name: string) {
  try {
    sessionStorage.setItem(MAIL_PREFILL_KEY, JSON.stringify({ id, name }))
  } catch {}
}

export function readMailPrefill(): { id: string; name: string } | null {
  try {
    const raw = sessionStorage.getItem(MAIL_PREFILL_KEY)
    if (!raw) return null
    sessionStorage.removeItem(MAIL_PREFILL_KEY)
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Unread count for the Sync MAIL tab label */
export function useUnreadMail(): number {
  const { data } = useMail()
  return data?.unread || 0
}

/** Keeps the inbox fresh when SSE announces new mail */
export function useMailLiveRefresh() {
  const queryClient = useQueryClient()
  const me = useStore(stores.me)
  React.useEffect(() => {
    const { dispose } = sync.listen('mail', (data: any) => {
      if (data?.receiverId && me?.id && data.receiverId !== me.id) return
      queryClient.invalidateQueries(['/api/mail'])
    })
    return () => dispose()
  }, [me?.id])
}

export const SyncMail: React.FC<{
  prefill: { id: string; name: string } | null
}> = ({ prefill }) => {
  const queryClient = useQueryClient()
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const { data } = useMail()
  const { mutate: markRead } = useMarkMailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/mail']),
  })
  const [box, setBox] = React.useState<'inbox' | 'sent'>('inbox')
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [reply, setReply] = React.useState<{ id: string; name: string } | null>(prefill)
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)

  const { mutate: sendMail, isLoading } = useSendMail({
    onSuccess: (res) => {
      setStatus(`Sent to ${res.toName}`)
      setReply(null)
      setSubject('')
      setBody('')
      queryClient.invalidateQueries(['/api/mail'])
    },
    onError: (err: any) => setStatus(err?.response?.data?.error || 'Send failed'),
  })

  const mails = (data?.mails || []).filter((m) => (box === 'inbox' ? !m.isMine : m.isMine))
  const timeFormat = isTimeFormat12h ? 'MMM D, hh:mm A' : 'MMM D, HH:mm'

  const onOpen = (id: string, isRead: boolean, isMine: boolean) => {
    setOpenId((cur) => (cur === id ? null : id))
    if (!isRead && !isMine) markRead({ id })
  }

  return (
    <div>
      <div className="flex gap-x-16 mb-16">
        {(['inbox', 'sent'] as const).map((b) => (
          <GhostButton
            key={b}
            className={cn(box !== b && 'text-acc/40')}
            onClick={() => setBox(b)}
          >
            {b === 'inbox' ? `Inbox${data?.unread ? ` (${data.unread})` : ''}` : 'Sent'}
          </GhostButton>
        ))}
      </div>

      {reply && (
        <div className="mb-32">
          <div className="mb-8">To {reply.name}</div>
          <input
            className="w-full bg-transparent outline-none mb-8 placeholder:text-acc/40"
            placeholder="Subject"
            value={subject}
            maxLength={200}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="w-full bg-transparent outline-none mb-8 placeholder:text-acc/40 min-h-[96px]"
            placeholder="Write a message…"
            value={body}
            maxLength={5000}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex gap-x-8">
            <Button
              kind="secondary"
              size="small"
              disabled={!body.trim() || isLoading}
              onClick={() => sendMail({ toUserId: reply.id, subject, body })}
            >
              {isLoading ? 'Sending…' : 'Send'}
            </Button>
            <GhostButton className="text-acc/40" onClick={() => setReply(null)}>
              Cancel
            </GhostButton>
          </div>
        </div>
      )}
      {status && <div className="text-acc/40 mb-16">{status}</div>}

      {mails.length === 0 && (
        <div className="text-acc/40">
          {box === 'inbox'
            ? 'No mail yet. In Log, type “/email to Name” to write one.'
            : 'Nothing sent yet.'}
        </div>
      )}

      {mails.map((m) => {
        const who = m.isMine ? `To ${m.toName}` : m.fromName
        const isOpen = openId === m.id
        return (
          <div key={m.id} className="mb-4">
            <div
              className="group flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded"
              onClick={() => onOpen(m.id, m.isRead, m.isMine)}
            >
              <span className={cn('whitespace-nowrap', !m.isRead && 'underline')}>{who}</span>
              <span className={cn('flex-1 truncate', m.isRead && 'text-acc/60')}>
                {m.subject || m.body.split('\n')[0]}
              </span>
              <span className="text-acc/40 whitespace-nowrap">
                {dayjs(m.createdAt).format(timeFormat)}
              </span>
            </div>
            {isOpen && (
              <div className="px-0 py-8 whitespace-breakspaces" style={{ wordBreak: 'break-word' }}>
                {m.body}
                {!m.isMine && (
                  <div className="mt-8">
                    <GhostButton
                      onClick={() => {
                        setReply({ id: m.senderId, name: m.fromName })
                        setSubject(m.subject ? `Re: ${m.subject.replace(/^Re:\s*/i, '')}` : '')
                        setStatus(null)
                      }}
                    >
                      Reply
                    </GhostButton>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
