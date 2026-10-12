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
import { $emailDraftTo } from '#client/stores/email'
import { Button, GhostButton, ResizibleGhostInput } from '#client/components/ui'
import { useEmails, useMarkEmailRead, useSendEmail } from '#client/queries'
import { sync } from '../sync'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'

const personName = (p: { firstName: string | null; lastName: string | null }) =>
  `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown'

/**
 * Mail section of Sync: new emails land here. Compose to a community
 * member from Log with `/email to Name.` or via Reply / Cohort Connect.
 */
export const SyncMail: React.FC = () => {
  const me = useStore(stores.me)
  const draftTo = useStore($emailDraftTo)
  const queryClient = useQueryClient()
  const { data } = useEmails()
  const { mutate: markRead } = useMarkEmailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/emails']),
  })
  const [body, setBody] = React.useState('')
  const [open, setOpen] = React.useState(true)
  const { mutate: sendEmail, isLoading: sending } = useSendEmail({
    onSuccess: () => {
      setBody('')
      $emailDraftTo.set(null)
      queryClient.invalidateQueries(['/api/emails'])
    },
  })

  // New mail arrives over SSE (private to the receiver)
  React.useEffect(() => {
    const { dispose } = sync.listen('email', () => {
      queryClient.invalidateQueries(['/api/emails'])
    })
    return dispose
  }, [])

  const emails = data?.emails || []
  const unread = data?.unread || 0
  if (!emails.length && !draftTo) return null

  return (
    <div className="mb-80">
      <div className="flex items-center gap-x-8 mb-8">
        <GhostButton onClick={() => setOpen((v) => !v)}>
          Mail{unread ? ` (${unread} new)` : ''}
        </GhostButton>
      </div>

      {draftTo && (
        <form
          className="flex items-center gap-x-8 mb-8"
          onSubmit={(ev) => {
            ev.preventDefault()
            if (body.trim()) sendEmail({ receiverId: draftTo.id, body })
          }}
        >
          <span className="whitespace-nowrap">To {draftTo.name}</span>
          <ResizibleGhostInput
            direction="vh"
            value={body}
            onChange={setBody}
            placeholder="Write an email..."
            containerClassName="flex-grow leading-normal"
            className="leading-normal"
          />
          <Button type="submit" kind="secondary" size="small" disabled={!body.trim() || sending}>
            Send
          </Button>
          <GhostButton onClick={() => $emailDraftTo.set(null)}>Cancel</GhostButton>
        </form>
      )}

      {open &&
        emails.map((e) => {
          const other = e.isMine ? e.to : e.from
          const isNew = !e.isMine && !e.readAt
          return (
            <div
              key={e.id}
              className={cn(
                'flex items-start gap-x-8 -mx-4 px-4 py-2 rounded grid-fill-hover cursor-pointer',
                e.isMine && 'text-acc/40'
              )}
              onClick={() => isNew && markRead({ id: e.id })}
            >
              <span className="whitespace-nowrap">
                {e.isMine ? `→ ${personName(other)}` : personName(other)}
                {isNew ? ' •' : ''}
              </span>
              <div className="whitespace-breakspaces flex-1" style={{ wordBreak: 'break-word' }}>
                {e.body}
              </div>
              {!e.isMine && other.id !== me?.id && (
                <GhostButton
                  onClick={(ev: React.MouseEvent) => {
                    ev.stopPropagation()
                    $emailDraftTo.set({ id: other.id, name: personName(other) })
                  }}
                >
                  Reply
                </GhostButton>
              )}
              <span className="text-acc/40 whitespace-nowrap">{dayjs(e.createdAt).fromNow()}</span>
            </div>
          )
        })}
    </div>
  )
}
