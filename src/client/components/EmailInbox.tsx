/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useLotMailInbox, useMarkMailRead, LotMailRecord } from '#client/queries'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import { LotMailSyncPayload } from '#shared/types'

export const EmailInbox: React.FC<{
  newMailEvents: LotMailSyncPayload[]
}> = ({ newMailEvents }) => {
  const queryClient = useQueryClient()
  const { data: inbox = [], isLoading } = useLotMailInbox()
  const { mutate: markRead } = useMarkMailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/mail/inbox']),
  })
  const [openId, setOpenId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (newMailEvents.length) {
      queryClient.invalidateQueries(['/api/mail/inbox'])
      queryClient.invalidateQueries(['/api/mail/unread-count'])
    }
  }, [newMailEvents.length])

  const onOpen = React.useCallback(
    (mail: LotMailRecord) => {
      setOpenId((prev) => (prev === mail.id ? null : mail.id))
      if (!mail.read) markRead({ id: mail.id })
    },
    [markRead]
  )

  if (isLoading) {
    return (
      <div className="opacity-30 uppercase tracking-widest text-xs">Loading...</div>
    )
  }

  if (!inbox.length) {
    return (
      <div className="opacity-30 uppercase tracking-widest text-xs">
        No messages yet.
      </div>
    )
  }

  return (
    <div>
      {inbox.map((mail) => {
        const isOpen = openId === mail.id
        const senderName = mail.fromUser
          ? `${mail.fromUser.firstName || ''} ${mail.fromUser.lastName || ''}`.trim() || 'Unknown'
          : 'Unknown'

        return (
          <div
            key={mail.id}
            className={cn(
              'cursor-pointer -mx-4 px-4 py-2 rounded grid-fill-hover',
              !mail.read && 'font-medium'
            )}
            onClick={() => onOpen(mail)}
          >
            <div className="flex items-start gap-x-8">
              <span className={cn('whitespace-nowrap', !mail.read && 'opacity-100', mail.read && 'opacity-60')}>
                {senderName}
              </span>
              <span className={cn('flex-1 truncate', mail.read && 'opacity-40')}>
                {mail.subject || mail.body.slice(0, 60)}
              </span>
              <span className="text-acc/40 whitespace-nowrap text-xs">
                {dayjs(mail.createdAt).fromNow()}
              </span>
            </div>
            {isOpen && (
              <div className="mt-4 opacity-60 whitespace-pre-wrap pl-0">
                {mail.subject && (
                  <div className="mb-4 opacity-80">{mail.subject}</div>
                )}
                {mail.body}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
