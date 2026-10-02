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
import { useEmails, useMarkEmailRead, useSendEmail } from '#client/queries'
import { sync } from '../sync'

/**
 * LOT® Email inbox — new mail lands in Sync, above the chat stream.
 * Compose primarily happens in Log (/email to NAME); this adds reply and
 * the hand-off from Cohort Connect (stores.emailComposeTo).
 */
export const SyncMail = React.memo(function SyncMailInner() {
  const queryClient = useQueryClient()
  const composeTo = useStore(stores.emailComposeTo)
  const { data } = useEmails()
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [to, setTo] = React.useState('')
  const [body, setBody] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)

  const refresh = React.useCallback(() => queryClient.invalidateQueries(['/api/emails']), [])
  const { mutate: markRead } = useMarkEmailRead({ onSuccess: refresh })
  const { mutate: send, isLoading: isSending } = useSendEmail({
    onSuccess: (r) => {
      setBody('')
      setStatus(`Sent to ${r.receiverName}`)
    },
    onError: (err: any) => setStatus(String(err?.response?.data?.error || 'Mail offline')),
  })

  React.useEffect(() => {
    const { dispose } = sync.listen('email', refresh)
    return () => dispose()
  }, [])

  // Hand-off from Cohort Connect
  React.useEffect(() => {
    if (composeTo) {
      setTo(composeTo)
      stores.emailComposeTo.set('')
    }
  }, [composeTo])

  const emails = data?.emails || []
  const unread = data?.unread || 0
  const showComposer = !!to || !!body

  const onOpen = (id: string, isUnread: boolean) => {
    setOpenId((cur) => (cur === id ? null : id))
    if (isUnread) markRead({ id })
  }

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!to.trim() || !body.trim() || isSending) return
    setStatus(null)
    send({ to: to.trim(), body: body.trim(), subject: body.trim().split('\n')[0].slice(0, 80) })
  }

  if (emails.length === 0 && !showComposer) return null

  return (
    <div className="mb-40">
      <div className="mb-8 text-acc/40 uppercase tracking-widest text-[11px]">
        Mail{unread > 0 && ` · ${unread} new`}
      </div>

      {showComposer && (
        <form onSubmit={onSubmit} className="mb-16 flex items-center gap-x-8">
          <span className="text-acc/40 whitespace-nowrap">To</span>
          <ResizibleGhostInput
            direction="v"
            value={to}
            onChange={setTo}
            placeholder="Name"
            containerClassName="w-[120px]"
          />
          <ResizibleGhostInput
            direction="vh"
            value={body}
            onChange={setBody}
            placeholder="Message..."
            containerClassName="flex-grow leading-normal"
          />
          <Button type="submit" kind="secondary" size="small" disabled={!to.trim() || !body.trim() || isSending}>
            Send
          </Button>
        </form>
      )}
      {status && <div className="mb-16 text-acc/40">{status}</div>}

      {emails.map((m) => {
        const isUnread = !m.readAt
        const isOpen = openId === m.id
        return (
          <div key={m.id} className="mb-4">
            <div
              className="group flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded"
              onClick={() => onOpen(m.id, isUnread)}
            >
              <span className={cn('whitespace-nowrap', !isUnread && 'text-acc/40')}>
                {isUnread && '● '}
                {m.senderName}
              </span>
              <span className={cn('flex-1 truncate', !isUnread && 'text-acc/40')}>
                {m.subject || '(no subject)'}
              </span>
              <span className="text-acc/40 whitespace-nowrap">{dayjs(m.createdAt).fromNow()}</span>
            </div>
            {isOpen && (
              <div className="pl-8 py-4">
                <div className="whitespace-breakspaces" style={{ wordBreak: 'break-word' }}>{m.body}</div>
                <GhostButton
                  className="mt-4 text-acc/40"
                  onClick={() => setTo(m.senderName.split(' ')[0])}
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
})
