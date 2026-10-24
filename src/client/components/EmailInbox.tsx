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
import { Button, ResizibleGhostInput } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useEmails, useSendEmail, useMarkEmailRead } from '#client/queries'
import { $emailDraftTo } from '#client/stores/emailDraft'
import { recordSignal } from '#client/stores/intentionEngine'
import { sync } from '../sync'

/**
 * LOT® Email inbox — rendered at the top of Sync.
 * Compose: Log "/email to Name. text" + "/send", or the Email button
 * on a Cohort match (opens the form below).
 */
export const EmailInbox: React.FC = () => {
  const queryClient = useQueryClient()
  const draftTo = useStore($emailDraftTo)
  const { data } = useEmails()
  const [body, setBody] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)

  const { mutate: sendEmail } = useSendEmail({
    onSuccess: (res) => {
      setBody('')
      setStatus(`Sent to ${res.to}`)
      $emailDraftTo.set(null)
      recordSignal('mood', 'email_sent', { hour: new Date().getHours() })
      queryClient.invalidateQueries(['/api/emails'])
    },
    onError: () => setStatus('Not sent'),
  })
  const { mutate: markRead } = useMarkEmailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/emails']),
  })

  React.useEffect(() => {
    const { dispose } = sync.listen('email', () => {
      queryClient.invalidateQueries(['/api/emails'])
    })
    return () => dispose()
  }, [])

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!draftTo || !body.trim()) return
    sendEmail({ receiverId: draftTo.id, body })
  }

  const emails = data?.emails ?? []
  if (!draftTo && !status && emails.length === 0) return null

  return (
    <div className="mb-80">
      <div className="opacity-40 mb-8">
        Email{data?.unread ? ` · ${data.unread} new` : ''}
      </div>

      {draftTo && (
        <form onSubmit={onSubmit} className="flex items-start gap-x-8 mb-16">
          <span className="whitespace-nowrap leading-normal">To {draftTo.name}</span>
          <ResizibleGhostInput
            direction="vh"
            value={body}
            onChange={setBody}
            placeholder="Write an email..."
            containerClassName="flex-grow leading-normal"
            className="leading-normal"
          />
          <Button type="submit" kind="secondary" size="small" disabled={!body.trim()}>
            Send
          </Button>
          <Button type="button" kind="secondary" size="small" onClick={() => $emailDraftTo.set(null)}>
            Cancel
          </Button>
        </form>
      )}
      {status && !draftTo && <div className="opacity-40 mb-8">{status}</div>}

      {emails.map((x) => {
        const unread = !x.isMine && !x.readAt
        return (
          <div
            key={x.id}
            className={cn(
              'flex items-start gap-x-8 -mx-4 px-4 py-2 rounded grid-fill-hover',
              !x.isMine && 'cursor-pointer',
              x.isMine && 'text-acc/40'
            )}
            onClick={() => unread && markRead({ id: x.id })}
          >
            <span className="whitespace-nowrap">
              {unread ? '● ' : ''}
              {x.isMine ? `→ ${x.receiverName}` : x.senderName}
            </span>
            <div className="whitespace-breakspaces" style={{ wordBreak: 'break-word' }}>
              {x.body}
            </div>
            <span className="text-acc/40 whitespace-nowrap ml-auto">
              {dayjs(x.createdAt).fromNow()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
