/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar Alert Toast
 *
 * Tactical, terminal-styled notification fired when a timed Calendar
 * entry comes due. Logs a `calendar_alert` event into the field archive
 * (Logs.tsx CAL-ALERT: handler) so time tracking has a durable record,
 * not just a transient popup.
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useLogs, useCreateLog } from '#client/queries'
import { isRouteActive } from '#client/stores/router'
import { recordCalendarAlertSignal } from '#client/stores/intentionEngine'
import {
  findDueCalendarEntry,
  markCalendarAlertFired,
  type DueCalendarEntry,
} from '#client/stores/calendarAlerts'

const CHECK_INTERVAL_MS = 20000
const AUTO_DISMISS_MS = 9000

export function CalendarAlertToast() {
  const queryClient = useQueryClient()
  const { data: logs = [] } = useLogs()
  const { mutate: createLog } = useCreateLog()

  const [activeAlert, setActiveAlert] = React.useState<DueCalendarEntry | null>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const check = () => {
      if (document.hidden || !isRouteActive('system')) return

      const due = findDueCalendarEntry(logs)
      if (!due) return

      markCalendarAlertFired(due.id)
      setActiveAlert(due)
      setVisible(true)
      setTimeout(() => setVisible(false), AUTO_DISMISS_MS)

      createLog({
        text: `[ALERT] ${due.entryType}: ${due.text} (${due.date} ${due.time})`,
        event: 'calendar_alert',
        metadata: {
          date: due.date,
          time: due.time,
          entryType: due.entryType,
          text: due.text,
          sourceLogId: due.id,
        },
      }, {
        onSuccess: () => {
          queryClient.refetchQueries(['/api/logs'])
        },
      })
      try { recordCalendarAlertSignal(due.entryType, due.date) } catch (_) {}
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [logs])

  if (!visible || !activeAlert) return null

  return (
    <div
      className={
        'fixed bottom-16 right-16 z-50 w-[288px] font-mono ' +
        'border border-acc/40 bg-[var(--base-color)] grid-fill-light px-16 py-12'
      }
      style={{ animation: 'calAlertIn 0.3s ease-out, calAlertOut 0.4s ease-in 8.5s forwards' }}
      role="alert"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-8">
          <span className="cal-alert-dot" />
          <span className="uppercase tracking-widest text-acc">CAL-ALERT</span>
        </div>
        <button
          className="uppercase tracking-widest text-xs text-acc/40 hover:text-acc transition-opacity"
          onClick={() => setVisible(false)}
        >
          ACK
        </button>
      </div>
      <div className="uppercase tracking-widest text-acc/60 mb-4">{activeAlert.entryType}</div>
      <div className="text-acc mb-4">{activeAlert.text}</div>
      <div className="text-acc/40 tabular-nums">{activeAlert.date} · {activeAlert.time}</div>
    </div>
  )
}

// CSS animations + blinking status dot
const style = document.createElement('style')
style.textContent = `
  @keyframes calAlertIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes calAlertOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  @keyframes calAlertBlink {
    50% { opacity: 0.2; }
  }
  .cal-alert-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: rgb(var(--acc-color-default));
    animation: calAlertBlink 1s step-start infinite;
  }
`

if (typeof document !== 'undefined') {
  document.head.appendChild(style)
}
