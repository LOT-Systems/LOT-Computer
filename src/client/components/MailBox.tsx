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
import { Button, ResizibleGhostInput, Tag } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useMail, useMarkMailRead, useSendMail } from '#client/queries'
import { sync } from '../sync'
import { PublicMail } from '#shared/types'

const fullName = (u: { firstName: string | null; lastName: string | null }) =>
  `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown'

/**
 * LOT® Email inbox. Mail is composed in Log with "/email to Name." and
 * lands here (Sync). Cohort members can also be mailed via a draft handed
 * over through stores.mailDraftTo.
 */
export const MailBox = React.memo(function MailBoxInner() {
  const queryClient = useQueryClient()
  const draftTo = useStore(stores.mailDraftTo)
  const { data } = useMail()
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [reply, setReply] = React.useState('')
  const [replyTo, setReplyTo] = React.useState<{ id: string; name: string } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(() => {
    queryClient.invalidateQueries(['/api/mail'])
  }, [queryClient])

  const { mutate: markRead } = useMarkMailRead({ onSuccess: refresh })
  const { mutate: sendMail, isLoading: sending } = useSendMail({
    onSuccess: () => {
      setReply('')
      setReplyTo(null)
      setError(null)
      stores.mailDraftTo.set(null)
      refresh()
    },
    onError: (err: any) => setError(err?.response?.data?.error || 'Unable to send'),
  })

  React.useEffect(() => {
    const { dispose } = sync.listen('mail', () => refresh())
    return () => dispose()
  }, [refresh])

  // A cohort hand-off opens the reply box for that person
  React.useEffect(() => {
    if (draftTo) setReplyTo(draftTo)
  }, [draftTo])

  const inbox: PublicMail[] = data?.inbox || []
  const unread = data?.unread || 0
  if (!inbox.length && !replyTo) return null

  const onOpen = (m: PublicMail) => {
    setOpenId(openId === m.id ? null : m.id)
    if (!m.readAt) markRead({ id: m.id })
  }

  return (
    <div className="mb-80">
      <div className="flex items-center gap-x-8 mb-8">
        <span className="text-acc/40">MAIL</span>
        {unread > 0 && <Tag fill={false}>{unread} new</Tag>}
      </div>

      {replyTo && (
        <div className="mb-8">
          <div className="text-acc/40">To {replyTo.name}</div>
          <ResizibleGhostInput
            direction="vh"
            value={reply}
            onChange={setReply}
            placeholder="Write an email..."
            containerClassName="leading-normal"
            className="leading-normal"
          />
          <div className="flex items-center gap-x-8 mt-4">
            <Button
              size="small"
              kind="secondary"
              disabled={!reply.trim() || sending}
              onClick={() => sendMail({ toUserId: replyTo.id, body: reply })}
            >
              Send
            </Button>
            <Button
              size="small"
              onClick={() => {
                setReplyTo(null)
                stores.mailDraftTo.set(null)
              }}
            >
              Cancel
            </Button>
            {error && <span className="text-acc/40">{error}</span>}
          </div>
        </div>
      )}

      {inbox.map((m) => (
        <div key={m.id} className="-mx-4 px-4 py-2 rounded grid-fill-hover cursor-pointer" onClick={() => onOpen(m)}>
          <div className="flex items-start gap-x-8">
            <span className={cn('whitespace-nowrap', m.readAt && 'text-acc/40')}>
              {fullName(m.from)}
            </span>
            <span
              className={cn('flex-1 truncate', m.readAt && 'text-acc/40', openId === m.id && 'whitespace-breakspaces')}
              style={{ wordBreak: 'break-word' }}
            >
              {m.body}
            </span>
            <span className="text-acc/40 whitespace-nowrap">{dayjs(m.createdAt).fromNow()}</span>
          </div>
          {openId === m.id && (
            <div className="mt-4">
              <Button
                size="small"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  setReplyTo({ id: m.from.id, name: fullName(m.from) })
                }}
              >
                Reply
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
})
