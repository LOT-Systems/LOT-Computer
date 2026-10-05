# LOT-SR-20261005-CALENDAR-01 — Calendar Widget: timekeeping + alerts

DATE: 2026-10-05 · CLASS: ENGINEERING · BRANCH: claude/dreamy-babbage-gasbkw

## Intake
Make the Calendar widget reliable: track time, log to Log, military-style
alerts, keep the minimalist UI.

## Findings (baseline)
- Entries were date-only; no time, no completion state, no alerts.
- Keys were array indices; sort by date string only.
- Nothing in Log recorded that an event actually came due.

## Changes
| File | Change |
|---|---|
| `src/client/utils/calendar.ts` (new) | Pure logic: `entryTimestamp`, `getAlertStage`, `formatCountdown`, `isValidTime`. |
| `src/client/components/CalendarWidget.tsx` | Optional `HH:mm` per entry; stable ids; sort by timestamp; `[DONE]` action; live alert banner; alert → Log. |
| `src/client/components/Logs.tsx` | Renders `calendar_alert` / `calendar_done` as `CAL-ALRT:` blocks. |
| `src/server/routes/api.ts` | `calendar_alert`, `calendar_done` added to displayable `/logs` events. |

## Alert protocol
- STANDBY at T-15 min · EXECUTE at T-0 · OVERDUE at T+15 min (stale >24h ignored).
- Date-only entries are all-day, armed at 09:00 local. Notes never alert (task/call only).
- Banner: `STANDBY T-14:59 …` uppercase tracked text, left rule; EXECUTE pulses; OVERDUE dims.
- Ticker: 15 s idle, 1 s while an alert is live.
- Each stage is written to Log once per entry (`calendar_alert`, metadata entryId/stage).
  Dedup via existing logs + in-memory set; nothing fires until logs have loaded.
- OVERDUE is logged only if the entry previously reached STANDBY/EXECUTE
  (entries added after their time get a banner, not log spam).
- `[DONE]` writes `calendar_done`; done entries leave the upcoming list and strike through.

## Verification
- Stage boundaries, countdown format and all-day default: PASS (node, ad-hoc script).
- tsc / build: NOT RUN — registry.yarnpkg.com blocked by egress proxy, no node_modules.
  Typecheck by inspection only. Run `yarn build` before shipping.

## Known gaps / next
1. Alerts fire only while the app is open (client ticker). Next: server scheduled job or
   Web Notification API / service worker for closed-app delivery.
2. Two open tabs/devices can double-log a stage (race before refetch).
3. `useLogs` staleTime is 5 min; alerts refetch after write, but cross-device done-state lags.
4. Entries can't be edited/deleted yet. Next: cancel (`calendar_cancel`) event.
5. Timezone: local browser time; no per-user tz stored on entries.
