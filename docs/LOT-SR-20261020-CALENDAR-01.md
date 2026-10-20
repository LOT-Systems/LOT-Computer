# LOT-SR-20261020-CALENDAR-01 — Calendar Widget: Time Tracking + Alerts

**Date:** 2026-10-20 · **Branch:** claude/dreamy-babbage-3my6sn · **Mode:** scheduled, autonomous

## Scope
Make the Calendar widget reliable: track time, log to Log, military-style alerts. Minimalist UI retained.

## Changes
| File | Change |
|---|---|
| `src/client/components/CalendarWidget.tsx` | Optional `HH:mm` time per entry; 5s clock tick; two-stage alerts (PRE-ALERT at T-10:00, ALERT at T-0); live banner with `T-MM:SS` / `T+MM:SS` countdown and `[ACK]`; browser Notification + vibrate when permitted; time shown in day list and upcoming list |
| `src/server/routes/api.ts` | `calendar_alert` added to `/logs` displayable events |

## Reliability design
- Entries now carry the Log `id`; alert state is derived from `calendar_alert` logs (`entryId` + `stage` = pre/due/ack), so it survives reloads and syncs across devices.
- localStorage guard (`lot-calendar-fired`) prevents duplicate posts before the refetch lands; wrapped in try/catch.
- Entries more than 6h overdue are not alerted (no stale spam on load); un-acked alerts remain visible for that window.
- Log format: `[ALERT] 14:30 CALL: text (T+00:02)`; stages PRE-ALERT / ALERT / ACK.
- Entries without time behave exactly as before.

## Verification
- Standalone `tsc` on the component: no errors beyond unresolved-module noise (node_modules not installed in this environment).
- Full build and runtime/browser test NOT run (no dependencies installed). Treat as unverified in-app.

## Known limits / next
- Alerts fire only while the app is open (client-side timer); no server push/background alerts.
- No edit/delete of entries (Log API only permits editing `note`).
- Candidates next: server-side scheduled alert job, recurring entries, snooze, all-day vs timed grouping.
