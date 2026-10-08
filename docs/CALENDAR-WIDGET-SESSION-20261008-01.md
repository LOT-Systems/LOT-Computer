# Calendar Widget — Session Report 2026-10-08 #01

**Branch:** `claude/dreamy-babbage-y7pr33` · **Mode:** scheduled, autonomous

## Objective
Make the Calendar widget reliable: track time, log into Log, military-style notifications, minimalist UI preserved.

## Starting state
Date-only entries (`calendar_entry` logs), no time, no alerts, no delete, index-keyed lists, double-submit possible.

## Changes
| File | Change |
|---|---|
| `src/client/utils/calendarAlerts.ts` (new) | Pure staging logic: `WARN` (T-15) → `DUE` (T-0) → `MISSED` (T+5..T+60); `DAY` notice for untimed entries; once-only dedupe keys; `T-hh:mm` countdown. |
| `src/client/components/CalendarWidget.tsx` | Optional time input (`metadata.time`); stable ids (log id) replace index keys; double-submit guard; delete (×); alert engine (15 s tick, visibility-aware, fires on tab refocus); fixed bottom-right mono/uppercase alert stack (WARN/TODAY auto-clear 20 s, DUE pulses, DUE/MISSED need ack); optional browser Notification (permission asked on time-field focus). |
| `src/client/queries.ts` | `useDeleteCalendarEntry`. |
| `src/server/routes/api.ts` | `calendar_alert` added to displayable events; `DELETE /logs/:id` (owner-only, `calendar_entry` only). |
| `src/client/components/Logs.tsx` | `CAL-ALERT:` log block; time shown on `CAL:` block. |

## Reliability design
- Each `(entryId, stage)` fires once. Ledger = `localStorage` + seeded from `calendar_alert` logs, so reloads and other devices don't replay.
- Every alert is written to Log as `calendar_alert` with `entryId, stage, date, time, firedAt`.
- Server enforces ownership on delete.

## Verification
- Stage logic unit-checked (boundaries 9:45/10:00/10:05/11:00, DAY, dedupe, countdown): **ALL PASS**.
- Widget type-check: no errors beyond unresolved modules — `node_modules` is not installed in this container, so **full `tsc`/build/lint were NOT run**. Treat as unverified until CI/local build.

## Known limits / next
1. Alerts only run while the System page (widget) is mounted and tab visible; no service-worker/push yet. Next: lift engine to app root or add Web Push.
2. Races: two open devices can both log the same alert if they tick before either logs (seed happens on log refresh). Next: server-side idempotency key on `calendar_alert`.
3. Times are local-device; no timezone stored on entry.
4. `/api/logs` staleTime is 5 min, so the fired-ledger seed from other devices can lag.
5. Edit-in-place for entries not yet added (delete + re-add).
6. Weekly/AI summaries don't yet count `calendar_alert` (intentionally untouched).
