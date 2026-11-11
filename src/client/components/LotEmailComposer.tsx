/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { Block, Button } from '#client/components/ui'
import { useDebounce } from '#client/utils/hooks'
import {
  useLotEmailRecipients,
  useSendLotEmail,
  type CohortMatch,
  type LotEmailRecipient,
} from '#client/queries'
import { recordSignal } from '#client/stores/intentionEngine'
import { LOT_EMAIL_MAX_LENGTH, type LotEmailCommand } from '#shared/utils/lot-email'

/**
 * LOT® Email composer — rendered under the primary Log entry while it
 * contains "/email to <Name>". Nothing is sent until the operator
 * presses Send or Ctrl/Cmd+Enter; autosave never transmits.
 */

const fullName = (r: { firstName: string | null; lastName: string | null }) =>
  `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Member'

/** Cohort member ids from the react-query cache — never triggers a fetch */
export function useCohortIds(): Set<string> {
  const queryClient = useQueryClient()
  const data = queryClient.getQueryData<{ matches?: CohortMatch[] }>(['/api/cohorts'])
  return React.useMemo(
    () => new Set((data?.matches || []).map((m) => m.user.id)),
    [data]
  )
}

const Row: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (
  <div className="flex gap-x-16">
    <span className="opacity-40 min-w-[96px] uppercase tracking-widest">{k}</span>
    <span className="min-w-0 break-words">{children}</span>
  </div>
)

export const LotEmailComposer: React.FC<{
  cmd: LotEmailCommand
  onSent: (recipientName: string) => void
  sendRef: React.MutableRefObject<(() => void) | null>
}> = ({ cmd, onSent, sendRef }) => {
  const debouncedTo = useDebounce(cmd.to, 400) as string
  const { data, isFetching } = useLotEmailRecipients(debouncedTo)
  const cohortIds = useCohortIds()
  const [chosen, setChosen] = React.useState<LotEmailRecipient | null>(null)
  const [conflict, setConflict] = React.useState<LotEmailRecipient[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Reset choices when the name changes
  React.useEffect(() => {
    setChosen(null)
    setConflict(null)
    setError(null)
  }, [cmd.to])

  const candidates = React.useMemo(() => {
    const list = data?.recipients || []
    // Cohort members first — LOT Community → Cohort is the dating layer
    return [...list].sort(
      (a, b) =>
        (b.score || 0) - (a.score || 0) ||
        Number(cohortIds.has(b.id)) - Number(cohortIds.has(a.id))
    )
  }, [data, cohortIds])

  const top = candidates[0]
  const tied = top ? candidates.filter((c) => c.score === top.score) : []
  const tiedCohort = tied.filter((c) => cohortIds.has(c.id))
  const resolved: LotEmailRecipient | null =
    chosen ||
    (tied.length === 1 ? top : tiedCohort.length === 1 ? tiedCohort[0] : null)
  const ambiguous = !resolved && (conflict || (tied.length > 1 ? tied : null))

  const { mutate: send, isLoading: isSending } = useSendLotEmail({
    onSuccess: (res) => {
      const name = fullName(res.email.counterpart)
      try {
        recordSignal('mood', 'lot_email_sent', {
          cohort: cohortIds.has(res.email.counterpart.id),
          length: cmd.body.length,
          hour: new Date().getHours(),
        })
      } catch {}
      onSent(name)
    },
    onError: (err: any) => {
      const status = err?.response?.status
      if (status === 409) {
        setConflict(err.response.data?.recipients || [])
        setError(null)
      } else if (status === 404) {
        setError('NO MEMBER — CHECK THE NAME')
      } else if (status === 400) {
        setError('BODY EMPTY — WRITE BELOW THE COMMAND')
      } else {
        setError('TRANSMISSION FAILED — RETRY')
      }
    },
  })

  const canSend = !!cmd.body && !!resolved && !isSending

  const doSend = React.useCallback(() => {
    if (!cmd.body || isSending) return
    if (!resolved) {
      if (!ambiguous) setError(isFetching ? 'RESOLVING…' : 'NO MEMBER — CHECK THE NAME')
      return
    }
    setError(null)
    send({ receiverId: resolved.id, to: cmd.to, message: cmd.body })
  }, [cmd.body, cmd.to, resolved, ambiguous, isSending, isFetching, send])

  React.useEffect(() => {
    sendRef.current = doSend
    return () => {
      sendRef.current = null
    }
  }, [doSend, sendRef])

  const status = isSending
    ? 'TRANSMITTING…'
    : error
      ? error
      : !cmd.body
        ? 'WRITE THE MESSAGE BELOW THE COMMAND'
        : resolved
          ? 'READY — CTRL+ENTER OR SEND'
          : ambiguous
            ? 'SELECT RECIPIENT'
            : isFetching || debouncedTo !== cmd.to
              ? 'RESOLVING…'
              : 'NO MEMBER — CHECK THE NAME'

  return (
    <div className="mt-8">
      <Block label="EMAIL [DRAFT]:" blockView>
        <div className="flex flex-col gap-y-4">
          <Row k="To">
            {resolved ? (
              <>
                {fullName(resolved)}
                {cohortIds.has(resolved.id) && <span className="opacity-40 ml-8">COHORT</span>}
              </>
            ) : (
              <span className="opacity-60">{cmd.to}</span>
            )}
          </Row>
          {ambiguous && ambiguous.length > 0 && (
            <div className="flex flex-wrap gap-8 my-4">
              {ambiguous.map((r) => (
                <Button
                  key={r.id}
                  kind="secondary"
                  size="small"
                  onClick={() => {
                    setChosen(r)
                    setConflict(null)
                    setError(null)
                  }}
                >
                  {fullName(r)}
                  {cohortIds.has(r.id) ? ' · Cohort' : ''}
                </Button>
              ))}
            </div>
          )}
          <Row k="Via">LOT Community → Sync</Row>
          <Row k="Body">
            <span className="tabular-nums">
              {cmd.body.length} / {LOT_EMAIL_MAX_LENGTH}
            </span>
          </Row>
          <Row k="Status">{status}</Row>
          <div className="mt-8">
            <Button kind="secondary" size="small" disabled={!canSend} onClick={doSend}>
              Send
            </Button>
          </div>
        </div>
      </Block>
    </div>
  )
}
