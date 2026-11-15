/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email
 *
 *   LogEmailComposer — appears under the Log editor when the log
 *                      contains "/email to <Name>". Resolves the name,
 *                      previews the letter, sends on explicit SEND.
 *   SyncMail         — MAIL block at the top of Sync: inbox, live
 *                      arrivals over SSE, inline reply, and letters
 *                      opened from Cohort Connect (LOT Community).
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import { Block, Button, GhostButton, ResizibleGhostInput } from '#client/components/ui'
import {
  LotEmailPerson,
  LotEmailRecord,
  resolveEmailRecipients,
  useEmails,
  useMarkEmailRead,
  useSendEmail,
} from '#client/queries'
import { parseEmailCommand } from '#client/utils/emailCommand'
import { sync } from '../sync'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { LOT_EMAIL_MAX_LENGTH } from '#shared/constants'

const MONO: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '14px',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap',
}

const nameOf = (p?: LotEmailPerson | null) =>
  p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Operator' : 'Operator'

const errorText = (err: any): string =>
  err?.response?.data?.error || 'MAIL OFFLINE'

const SENT_KEY = 'lot-email-sent'
const readSent = (): string[] => {
  try { return JSON.parse(localStorage.getItem(SENT_KEY) || '[]') } catch { return [] }
}
const writeSent = (key: string) => {
  try {
    const next = [key, ...readSent().filter((k) => k !== key)].slice(0, 50)
    localStorage.setItem(SENT_KEY, JSON.stringify(next))
  } catch {}
}

// ---------------------------------------------------------------------------
// Log: /email to Hitomi
// ---------------------------------------------------------------------------

export const LogEmailComposer: React.FC<{ text: string }> = ({ text }) => {
  const queryClient = useQueryClient()
  const cmd = React.useMemo(() => parseEmailCommand(text), [text])
  const [candidates, setCandidates] = React.useState<LotEmailPerson[] | null>(null)
  const [picked, setPicked] = React.useState<LotEmailPerson | null>(null)
  const [status, setStatus] = React.useState<string | null>(null)
  const [sentKeys, setSentKeys] = React.useState<string[]>(readSent)

  const to = cmd?.to || ''

  // Resolve recipient name (debounced) whenever the "to" changes
  React.useEffect(() => {
    setPicked(null)
    setStatus(null)
    if (to.length < 2) { setCandidates(null); return }
    let cancelled = false
    const id = setTimeout(() => {
      resolveEmailRecipients(to)
        .then((list) => { if (!cancelled) setCandidates(list) })
        .catch(() => { if (!cancelled) setCandidates([]) })
    }, 400)
    return () => { cancelled = true; clearTimeout(id) }
  }, [to])

  const { mutate: send, isLoading } = useSendEmail({
    onSuccess: (data) => {
      if (cmd) { writeSent(cmd.key); setSentKeys(readSent()) }
      setStatus(`SENT ${dayjs(data.createdAt).format('HH:mm')} → ${nameOf(data.to).toUpperCase()}`)
      queryClient.invalidateQueries(['/api/emails'])
    },
    onError: (err: any) => {
      const list = err?.response?.data?.candidates
      if (Array.isArray(list)) setCandidates(list)
      setStatus(errorText(err))
    },
  })

  if (!cmd) return null

  const exact = (candidates || []).filter(
    (c) => nameOf(c).toLowerCase() === to.toLowerCase() || (c.firstName || '').toLowerCase() === to.toLowerCase()
  )
  const recipient = picked || (exact.length === 1 ? exact[0] : candidates?.length === 1 ? candidates[0] : null)
  const ambiguous = !recipient && (candidates?.length || 0) > 1
  const alreadySent = sentKeys.includes(cmd.key)
  const tooLong = cmd.body.length > LOT_EMAIL_MAX_LENGTH

  const onSend = () => {
    if (!recipient || !cmd.body || isLoading || tooLong) return
    send({ receiverId: recipient.id, body: cmd.body, source: 'log' })
  }

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div className="opacity-60" style={MONO}>
          {[
            `TO              ${
              recipient
                ? nameOf(recipient).toUpperCase() + (recipient.city ? ` · ${recipient.city.toUpperCase()}` : '')
                : candidates === null
                  ? `${to.toUpperCase()} · RESOLVING...`
                  : ambiguous
                    ? `${to.toUpperCase()} · ${candidates!.length} OPERATORS MATCH`
                    : `${to.toUpperCase()} · NO OPERATOR FOUND`
            }`,
            `LENGTH          ${cmd.body.length}/${LOT_EMAIL_MAX_LENGTH}`,
            `DELIVERY        SYNC`,
          ].join('\n')}
        </div>
        {ambiguous && (
          <div className="flex flex-wrap gap-8 mt-8">
            {candidates!.map((c) => (
              <Button key={c.id} size="small" kind="secondary" onClick={() => setPicked(c)}>
                {nameOf(c)}{c.city ? ` · ${c.city}` : ''}
              </Button>
            ))}
          </div>
        )}
        {!cmd.body && (
          <div className="opacity-30 mt-8">Write the letter on the next line.</div>
        )}
        <div className="flex items-center gap-8 mt-8">
          <Button
            size="small"
            kind="secondary"
            disabled={!recipient || !cmd.body || isLoading || tooLong || alreadySent}
            onClick={onSend}
          >
            {isLoading ? 'Sending...' : alreadySent ? 'Sent' : 'Send'}
          </Button>
          {status && <span className="opacity-40 tracking-wide">{status}</span>}
        </div>
      </Block>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sync: MAIL block
// ---------------------------------------------------------------------------

export const SyncMail: React.FC = () => {
  const queryClient = useQueryClient()
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const draft = useStore(stores.emailDraft)
  const { data } = useEmails()
  const [live, setLive] = React.useState<LotEmailRecord[]>([])
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [replyTo, setReplyTo] = React.useState<{ id: string; name: string; source: 'sync' | 'cohort' } | null>(null)
  const [reply, setReply] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)

  const { mutate: markRead } = useMarkEmailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/emails']),
  })
  const { mutate: send, isLoading } = useSendEmail({
    onSuccess: (sent) => {
      setReply('')
      setReplyTo(null)
      setStatus(`SENT ${dayjs(sent.createdAt).format('HH:mm')} → ${nameOf(sent.to).toUpperCase()}`)
      queryClient.invalidateQueries(['/api/emails'])
    },
    onError: (err: any) => setStatus(errorText(err)),
  })

  // Live arrivals
  React.useEffect(() => {
    const { dispose } = sync.listen('lot_email', (letter: LotEmailRecord) => {
      setLive((prev) => (prev.some((x) => x.id === letter.id) ? prev : [letter, ...prev]))
    })
    return dispose
  }, [])

  // Letter opened from Cohort Connect / LOT Community
  React.useEffect(() => {
    if (!draft) return
    setReplyTo({ id: draft.receiverId, name: draft.name, source: draft.source })
    setStatus(null)
    stores.emailDraft.set(null)
  }, [draft])

  const inbox = React.useMemo(() => {
    const fetched = data?.inbox || []
    const ids = new Set(fetched.map((x) => x.id))
    return [...live.filter((x) => !ids.has(x.id)), ...fetched]
  }, [data, live])

  const unread = inbox.filter((x) => !x.readAt).length

  const onOpen = (letter: LotEmailRecord) => {
    setOpenId(openId === letter.id ? null : letter.id)
    if (!letter.readAt) {
      setLive((prev) => prev.map((x) => (x.id === letter.id ? { ...x, readAt: new Date().toISOString() } : x)))
      markRead({ id: letter.id })
    }
  }

  const onSubmitReply = (ev?: React.FormEvent) => {
    ev?.preventDefault()
    if (!replyTo || !reply.trim() || isLoading) return
    send({ receiverId: replyTo.id, body: reply.trim(), source: replyTo.source })
  }

  if (!inbox.length && !replyTo && !status) return null

  return (
    <div className="mb-80">
      <div className="opacity-40 tracking-wide mb-8">
        MAIL{unread ? ` · ${unread} NEW` : ''}
      </div>

      {replyTo && (
        <form onSubmit={onSubmitReply} className="flex items-start gap-x-8 mb-16">
          <span className="whitespace-nowrap leading-normal opacity-60">To {replyTo.name}</span>
          <ResizibleGhostInput
            direction="vh"
            value={reply}
            onChange={setReply}
            placeholder="Write a letter..."
            containerClassName="flex-grow leading-normal"
            className="leading-normal"
          />
          <Button type="submit" kind="secondary" size="small" disabled={!reply.trim() || isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
          <GhostButton className="opacity-40" onClick={() => { setReplyTo(null); setReply('') }}>
            Cancel
          </GhostButton>
        </form>
      )}

      {status && <div className="opacity-40 tracking-wide mb-8">{status}</div>}

      {inbox.slice(0, 20).map((x) => {
        const isOpen = openId === x.id
        const date = dayjs(x.createdAt)
        const time = date.format(isTimeFormat12h ? 'hh:mm A' : 'HH:mm')
        return (
          <div key={x.id} className="-mx-4 px-4 py-2 rounded grid-fill-hover cursor-pointer" onClick={() => onOpen(x)}>
            <div className="flex items-start gap-x-8">
              <span className={cn('whitespace-nowrap', x.readAt ? 'opacity-40' : '')}>
                {!x.readAt ? '• ' : ''}{nameOf(x.from)}
              </span>
              <span
                className={cn('flex-1', x.readAt && !isOpen ? 'opacity-40' : '')}
                style={{ wordBreak: 'break-word', whiteSpace: isOpen ? 'pre-wrap' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {x.body}
              </span>
              <span className="opacity-40 whitespace-nowrap">
                {time}{dayjs().diff(date, 'day') >= 1 ? `, ${date.fromNow()}` : ''}
              </span>
            </div>
            {isOpen && x.from && (
              <div className="flex items-center gap-x-8 mt-4 opacity-60">
                {x.source === 'cohort' && <span className="opacity-60">via Cohort</span>}
                <GhostButton
                  onClick={(ev: React.MouseEvent) => {
                    ev.stopPropagation()
                    setStatus(null)
                    setReplyTo({ id: x.from!.id, name: nameOf(x.from), source: x.source === 'cohort' ? 'cohort' : 'sync' })
                  }}
                >
                  Reply
                </GhostButton>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
