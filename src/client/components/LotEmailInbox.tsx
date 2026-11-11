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
import { Block, Button, GhostButton } from '#client/components/ui'
import { useLotEmailInbox, useMarkLotEmailRead } from '#client/queries'
import { useCohortIds } from '#client/components/LotEmailComposer'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import type { LotEmail } from '#shared/types'

const INBOX_TO_SHOW = 7

const nameOf = (p: LotEmail['counterpart']) =>
  `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Member'

/**
 * LOT® Email in Sync — newest first. Received mail is marked read the
 * moment Sync is the active tab. Clicking a row opens Log with
 * "/email to <Name>" ready for the reply.
 */
export const LotEmailInbox: React.FC = () => {
  const queryClient = useQueryClient()
  const router = useStore(stores.router)
  const isActive = router?.route === 'sync'
  const live = useStore(stores.lotEmailLive)
  const unread = useStore(stores.lotEmailUnread)
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const isTouchDevice = useStore(stores.isTouchDevice)
  const cohortIds = useCohortIds()
  const [expanded, setExpanded] = React.useState(false)
  const [freshIds, setFreshIds] = React.useState<Set<string>>(new Set())

  const { data } = useLotEmailInbox()
  const { mutate: markRead } = useMarkLotEmailRead({
    onSuccess: () => queryClient.invalidateQueries(['/api/lot-email/inbox']),
  })

  const emails = React.useMemo(() => {
    const fetched = data?.emails || []
    const ids = new Set(fetched.map((e) => e.id))
    return [...live.filter((e) => !ids.has(e.id)), ...fetched]
  }, [data, live])

  // Opening Sync reads the mail. Remember which ones were new so they
  // stay highlighted for this visit.
  React.useEffect(() => {
    if (!isActive || unread === 0 || !data) return
    const fresh = emails.filter((e) => !e.isMine && !e.readAt).map((e) => e.id)
    if (fresh.length) setFreshIds((prev) => new Set([...prev, ...fresh]))
    stores.lotEmailUnread.set(0)
    markRead()
  }, [isActive, unread, data, emails.length])

  const compose = (name: string) => stores.composeLotEmail(name, stores.goTo)

  const visible = expanded ? emails : emails.slice(0, INBOX_TO_SHOW)
  const timeFormat = isTimeFormat12h ? 'h:mm A' : 'HH:mm'

  return (
    <div className="mb-80">
      <Block label="Email:" blockView>
        {emails.length === 0 ? (
          <div className="opacity-40">
            No mail yet. In Log, write <span className="opacity-100">/email to Name</span>, the
            message below, then Ctrl+Enter.
          </div>
        ) : (
          <div className="flex flex-col">
            {visible.map((e) => {
              const isNew = freshIds.has(e.id) || (!e.isMine && !e.readAt)
              const cohort = cohortIds.has(e.counterpart.id)
              const date = dayjs(e.createdAt)
              const isPast = dayjs().diff(date, 'day') >= 1
              return (
                <div
                  key={e.id}
                  className={cn(
                    'group flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded',
                    e.isMine && 'opacity-40'
                  )}
                  title={e.isMine ? 'Write again' : 'Reply in Log'}
                  onClick={() => compose(nameOf(e.counterpart))}
                >
                  <span className="whitespace-nowrap">
                    {e.isMine ? '→ ' : isNew ? '✉ ' : ''}
                    {nameOf(e.counterpart)}
                    {cohort && <span className="opacity-40 ml-8">Cohort</span>}
                  </span>
                  <div
                    className="whitespace-breakspaces flex-1"
                    style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}
                  >
                    {e.message}
                  </div>
                  <span
                    className={cn(
                      'whitespace-nowrap select-none',
                      isTouchDevice ? 'opacity-40' : 'text-acc/0 group-hover:text-acc/40'
                    )}
                  >
                    {date.format(timeFormat)}
                    {isPast && `, ${date.fromNow()}`}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex gap-x-8 mt-16">
          <Button kind="secondary" size="small" onClick={() => stores.goTo('logs')}>
            Write in Log
          </Button>
          {emails.length > INBOX_TO_SHOW && (
            <GhostButton onClick={() => setExpanded((x) => !x)}>
              {expanded ? 'Less' : `All ${emails.length}`}
            </GhostButton>
          )}
        </div>
      </Block>
    </div>
  )
}
