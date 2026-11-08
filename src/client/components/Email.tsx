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
import { Button } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import {
  useEmails,
  useEmailRecipients,
  useMarkEmailRead,
  useSendEmail,
} from '#client/queries'
import { sync } from '../sync'

/** Parse the recipient name out of "/email to Hitomi." */
export function parseEmailRecipient(text: string): string {
  const m = text.match(/(?:^|\s)\/email\b(?:\s+to)?\s+([^\n:]*)/i)
  if (!m) return ''
  return m[1].trim().replace(/[.,;!?]+$/, '').trim()
}

const fullName = (u: { firstName: string | null; lastName: string | null }) =>
  `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown'

/**
 * Composer: To (resolved against LOT users) / Subject / Body.
 * Used by Log (/email to <name>) and by Sync.
 */
export const EmailComposer: React.FC<{
  initialName?: string
  initialTo?: { id: string; name: string } | null
  onSent?: () => void
  onClose?: () => void
}> = ({ initialName = '', initialTo = null, onSent, onClose }) => {
  const queryClient = useQueryClient()
  const [query, setQuery] = React.useState(initialName)
  const [to, setTo] = React.useState<{ id: string; name: string } | null>(initialTo)
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [status, setStatus] = React.useState('')

  // Follow the Log text while the user is still typing "/email to <name>"
  React.useEffect(() => {
    if (initialName && !to) setQuery(initialName)
  }, [initialName])

  const { data: found } = useEmailRecipients(to ? '' : query)
  // Auto-pick when the name resolves to exactly one person
  React.useEffect(() => {
    if (!to && found?.users?.length === 1) {
      setTo({ id: found.users[0].id, name: fullName(found.users[0]) })
    }
  }, [found, to])

  const { mutate: send, isLoading } = useSendEmail({
    onSuccess: () => {
      setStatus('SENT')
      setBody('')
      setSubject('')
      queryClient.invalidateQueries(['/api/emails'])
      onSent?.()
    },
    onError: () => setStatus('FAILED'),
  })

  const canSend = !!to && !!body.trim() && !isLoading
  const submit = (ev?: React.FormEvent) => {
    ev?.preventDefault()
    if (!canSend || !to) return
    setStatus('')
    send({ receiverId: to.id, subject, body })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-y-4 max-w-[700px]">
      <div className="flex items-center gap-x-8">
        <span className="opacity-40 w-[64px]">TO</span>
        {to ? (
          <button
            type="button"
            className="underline"
            title="Change recipient"
            onClick={() => { setTo(null); setQuery(to.name.split(' ')[0]) }}
          >
            {to.name}
          </button>
        ) : (
          <input
            className="bg-transparent outline-none flex-1"
            value={query}
            placeholder="name"
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
      </div>
      {!to && query.trim() && (
        <div className="pl-[72px] opacity-60">
          {found?.users?.length
            ? found.users.map((u) => (
                <button
                  type="button"
                  key={u.id}
                  className="block hover:underline"
                  onClick={() => setTo({ id: u.id, name: fullName(u) })}
                >
                  {fullName(u)}
                  {u.city ? ` — ${u.city}` : ''}
                </button>
              ))
            : 'No match'}
        </div>
      )}
      <div className="flex items-center gap-x-8">
        <span className="opacity-40 w-[64px]">SUBJECT</span>
        <input
          className="bg-transparent outline-none flex-1"
          value={subject}
          maxLength={200}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <textarea
        className="bg-transparent outline-none w-full min-h-[120px] mt-4"
        value={body}
        maxLength={10000}
        placeholder="Message..."
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex items-center gap-x-8">
        <Button type="submit" kind="secondary" size="small" disabled={!canSend}>
          Send
        </Button>
        {onClose && (
          <Button type="button" size="small" onClick={onClose}>
            Close
          </Button>
        )}
        {status && <span className="opacity-60">{status}</span>}
      </div>
    </form>
  )
}

/** Sync-side mail: unread badge, inbox list, read-on-open, reply, compose. */
export const MailInbox: React.FC = () => {
  const queryClient = useQueryClient()
  const me = useStore(stores.me)
  const draft = useStore(stores.emailDraftTo)
  const { data } = useEmails()
  const { mutate: markRead } = useMarkEmailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/emails']),
  })
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [composing, setComposing] = React.useState<{ id: string; name: string } | 'new' | null>(null)

  // Recipient handed over from the cohort widget
  React.useEffect(() => {
    if (draft) {
      setComposing(draft)
      stores.emailDraftTo.set(null)
    }
  }, [draft])

  // New mail arrives over SSE
  React.useEffect(() => {
    const { dispose } = sync.listen('email', (payload: any) => {
      if (payload.receiverId === me?.id) {
        queryClient.invalidateQueries(['/api/emails'])
      }
    })
    return () => dispose()
  }, [me?.id])

  const emails = data?.emails || []
  const unread = data?.unread || 0
  if (!emails.length && !composing) {
    return (
      <div className="mb-40">
        <button className="opacity-40 hover:opacity-100" onClick={() => setComposing('new')}>
          MAIL — empty · compose
        </button>
      </div>
    )
  }

  return (
    <div className="mb-40 max-w-[700px]">
      <div className="flex items-center gap-x-8 mb-8">
        <span>MAIL{unread ? ` (${unread})` : ''}</span>
        <button className="opacity-40 hover:opacity-100" onClick={() => setComposing('new')}>
          compose
        </button>
      </div>
      {composing && (
        <div className="mb-16">
          <EmailComposer
            initialTo={composing === 'new' ? null : composing}
            onClose={() => setComposing(null)}
          />
        </div>
      )}
      {emails.map((m) => {
        const isOpen = openId === m.id
        return (
          <div key={m.id} className="py-2">
            <button
              className="flex w-full items-start gap-x-8 text-left grid-fill-hover -mx-4 px-4 rounded"
              onClick={() => {
                setOpenId(isOpen ? null : m.id)
                if (!isOpen && !m.readAt) markRead({ id: m.id })
              }}
            >
              <span className={m.readAt ? 'opacity-40' : ''}>{m.readAt ? ' ' : '●'}</span>
              <span className="whitespace-nowrap">{m.senderName}</span>
              <span className={m.readAt ? 'opacity-60 flex-1' : 'flex-1'}>
                {m.subject || '(no subject)'}
              </span>
              <span className="opacity-40 whitespace-nowrap">{dayjs(m.createdAt).fromNow()}</span>
            </button>
            {isOpen && (
              <div className="pl-[24px] py-4">
                <div className="whitespace-breakspaces" style={{ wordBreak: 'break-word' }}>
                  {m.body}
                </div>
                <button
                  className="opacity-40 hover:opacity-100 mt-4"
                  onClick={() => setComposing({ id: m.senderId, name: m.senderName })}
                >
                  reply
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
