/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar alert toast — military-grade signal card.
 *
 *   ■ FLASH · CAL ALERT              171430L NOV 26
 *   T-0 · NOW
 *   CLL  Call with operator
 *   14:30 · TUE 17 NOV
 *   ACK   SNZ +5   DONE                    1 / 2
 *
 * FLASH alerts hold until acknowledged. IMMEDIATE / ROUTINE auto-clear.
 * SNZ re-arms the alert in SNOOZE_MINUTES; DONE closes a task/call.
 * Keys: Enter = ACK, S = snooze, D = done (while a FLASH holds focus).
 */

import * as React from 'react'
import { cn } from '#client/utils'
import dayjs from '#client/utils/dayjs'
import {
  type CalendarAlert,
  PHASE_LABEL,
  SNOOZE_MINUTES,
  TYPE_CODE,
  alertPriority,
  formatDTG,
} from '#client/utils/calendar'

const AUTO_CLEAR_MS = {
  FLASH: 0,
  IMMEDIATE: 45_000,
  ROUTINE: 15_000,
} as const

type Props = {
  alerts: CalendarAlert[]
  onAck: (key: string) => void
  onAckAll: () => void
  onSnooze: (alert: CalendarAlert) => void
  onDone: (alert: CalendarAlert) => void
}

export function CalendarAlertToast({ alerts, onAck, onAckAll, onSnooze, onDone }: Props) {
  const current = alerts[0]
  const priority = current ? alertPriority(current.entry, current.phase) : null

  React.useEffect(() => {
    if (!current || !priority) return
    const ms = AUTO_CLEAR_MS[priority]
    if (!ms) return
    const t = setTimeout(() => onAck(current.key), ms)
    return () => clearTimeout(t)
  }, [current?.key, priority])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!current) return
    const k = e.key.toLowerCase()
    if (k === 's') {
      e.preventDefault()
      onSnooze(current)
    } else if (k === 'd' && current.entry.type !== 'note') {
      e.preventDefault()
      onDone(current)
    } else if (k === 'escape') {
      onAck(current.key)
    }
  }

  if (!current || !priority) return null

  const { entry, phase } = current
  const when = entry.time
    ? `${entry.time} · ${dayjs(entry.date).format('ddd D MMM').toUpperCase()}`
    : `ALL DAY · ${dayjs(entry.date).format('ddd D MMM').toUpperCase()}`

  return (
    <div
      role="alert"
      aria-live="assertive"
      onKeyDown={onKeyDown}
      className={cn(
        'fixed top-16 right-16 left-16 phone:left-auto phone:w-[360px] z-50',
        'px-16 py-16 border bg-bac text-acc',
        'tabular-nums',
        priority === 'FLASH' ? 'border-acc' : 'border-acc/30'
      )}
    >
      <div className="flex justify-between items-baseline gap-8 mb-4">
        <span className="flex items-baseline gap-8">
          <span
            className={cn(
              'inline-block w-[7px] h-[7px] bg-acc self-center',
              priority !== 'ROUTINE' && 'animate-pulse'
            )}
          />
          <span>{priority} · CAL ALERT</span>
        </span>
        <span className="text-acc/40 tabular-nums">{formatDTG(new Date(current.firedAt))}</span>
      </div>
      <div className={cn('mb-4 tabular-nums', priority === 'FLASH' ? 'text-acc' : 'text-acc/70')}>
        {PHASE_LABEL[phase]}
      </div>
      <div className="flex gap-8 mb-1">
        <span className="text-acc/40">{TYPE_CODE[entry.type]}</span>
        <span className="break-words min-w-0">{entry.text}</span>
      </div>
      <div className="text-acc/40 tabular-nums mb-8">{when}</div>
      <div className="flex justify-between items-baseline">
        <span className="flex gap-16">
          <button
            className="hover:underline"
            onClick={() => onAck(current.key)}
            autoFocus={priority === 'FLASH'}
          >
            ACK
          </button>
          <button className="text-acc/40 hover:text-acc" onClick={() => onSnooze(current)}>
            SNZ +{SNOOZE_MINUTES}
          </button>
          {entry.type !== 'note' && (
            <button className="text-acc/40 hover:text-acc" onClick={() => onDone(current)}>
              DONE
            </button>
          )}
          {alerts.length > 1 && (
            <button className="text-acc/40 hover:text-acc" onClick={onAckAll}>
              ACK ALL
            </button>
          )}
        </span>
        {alerts.length > 1 && (
          <span className="text-acc/40 tabular-nums">1 / {alerts.length}</span>
        )}
      </div>
    </div>
  )
}
