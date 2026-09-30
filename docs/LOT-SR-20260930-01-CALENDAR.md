# LOT SYSTEMS — SESSION REPORT · CALENDAR WIDGET v1.1 (ALERT ENGINE)

| Field | Value |
|---|---|
| ID | LOT-SR-20260930-01-CALENDAR |
| DATE | 2026-09-30 |
| CLASS | ENGINEERING (scheduled routine) |
| BRANCH | claude/dreamy-babbage-5ysqvq |

## INTAKE
Directive: continue the Calendar widget — keep the minimalist UI, make it reliable, have it track time and log to Log, with military-grade event notifications.

## ORIENT
`CalendarWidget.tsx` (281 lines) supported date-only entries (note/task/call) logged as `calendar_entry`. No time-of-day, no alerts, no alert logging.

## ACTIONS
1. **`src/client/utils/calendarAlerts.ts` (new, pure logic)** — `parseTime` (accepts `930`, `9:30`, `14`), `computeDueAlerts`, `formatCountdown`. Stages: `T-15` (STANDBY), `T-00` (EXECUTE), `OVERDUE` (up to 2h, then silent). One stage per entry per tick; later stages suppress earlier ones; dedupe by key `entryId:stage`.
2. **`CalendarWidget.tsx`**
   - Optional `HH:MM` field on entry form (red border when invalid; invalid time blocks submit). Stored in `metadata.time`; shown in day view and upcoming list; entries sorted by date+time.
   - 15s ticker evaluates alerts; each fired alert is written to Log as `calendar_alert` (`metadata.alertKey`, stage, entry, date, time). Existing `calendar_alert` logs seed the dedupe set, so reloads / other devices do not re-fire.
   - Minimal banner above the widget: `EXECUTE T+00:00 · 10:00 · call · text  [ACK]`; uppercase tracked mono, left rule, pulse only on T-00, dimmer for STANDBY. `role="alert"`; device vibration where supported.
3. **`api.ts`** — `calendar_alert` added to `/logs` displayable events.
4. **`Logs.tsx`** — `ALERT:` block renderer (stage · type, text, date/time); `CAL:` block now shows time.

## CHECKS
```
Alert logic unit checks (tsx): 10 cases PASS — early, T-15, dedupe, T-00 after T-15,
  OVERDUE, overdue dedupe, stale suppression, untimed, parseTime, formatCountdown
  (initially FAILED "stale": a 3h-old entry fell through to T-00 -> fixed, re-run green)
tsc --noEmit: 0 errors in CalendarWidget.tsx, calendarAlerts.ts, routes/api.ts, my Logs.tsx edits
  (4 pre-existing Logs.tsx errors at lines 99/103/3799/3866 — unrelated, untouched)
Full build / browser run: NOT performed this session
```

## KNOWN LIMITS / NEXT
- Alerts only fire while the app is open (client-side ticker). Next: server-side scheduled job in `scheduled-jobs.ts` + Web Push so alerts fire when closed.
- No entry edit/delete/complete yet (logs are append-only); add `calendar_done` event to mark complete and suppress alerts.
- Alerts use the device clock/local timezone; entries store no timezone.
- Consider wiring alert events into QIE signals (`recordSignal`) and a "snooze" action.
- Runtime UI not visually verified (no browser pass).
