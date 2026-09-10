/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { Tag } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useLotMailInbox, useMarkMailRead, LotMailRecord } from '#client/queries'

/**
 * LOT Mail inbox — the delivery surface for messages sent with the
 * /email log trigger. Lives inside Sync's "Mail" tab.
 */
export const EmailInbox: React.FC = () => {
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const { data } = useLotMailInbox()
  const { mutate: markRead } = useMarkMailRead({
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/mail/inbox'])
      queryClient.invalidateQueries(['/api/mail/unread-count'])
    },
  })

  const mails = data?.mails || []

  const onToggle = React.useCallback(
    (mail: LotMailRecord) => () => {
      const willExpand = expandedId !== mail.id
      setExpandedId(willExpand ? mail.id : null)
      if (willExpand && !mail.read) {
        markRead({ id: mail.id })
      }
    },
    [expandedId, markRead]
  )

  if (mails.length === 0) {
    return (
      <div className="max-w-[700px] text-acc/40 py-8">
        No LOT Mail yet. Write "/email to [name]" in a Log entry to send one.
      </div>
    )
  }

  return (
    <div className="max-w-[700px]">
      {mails.map((mail) => {
        const fromName = mail.fromUser
          ? `${mail.fromUser.firstName || ''} ${mail.fromUser.lastName || ''}`.trim() || 'Unknown'
          : 'Unknown'
        const isExpanded = expandedId === mail.id

        return (
          <div
            key={mail.id}
            className="group cursor-pointer grid-fill-hover -mx-4 px-4 py-8 rounded"
            onClick={onToggle(mail)}
          >
            <div className="flex items-start gap-x-8">
              {!mail.read && (
                <Tag className="text-acc/60 -mt-[2px]" fill={false}>
                  NEW
                </Tag>
              )}
              <span className={cn('whitespace-nowrap', !mail.read && 'font-medium')}>
                {fromName}
              </span>
              {mail.subject && (
                <span className="opacity-60 truncate">{mail.subject}</span>
              )}
              <div className="flex-1" />
              <span className="text-acc/40 whitespace-nowrap">
                {dayjs(mail.createdAt).fromNow()}
              </span>
            </div>
            {isExpanded && (
              <div
                className="mt-4 opacity-80"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {mail.body}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
