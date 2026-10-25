# LOT-SR-20261025-CALENDAR-01 — Calendar Widget: Time Tracking + Alerts

**Date:** 2026-10-25 · **Branch:** claude/dreamy-babbage-m478st · **Mode:** scheduled, unattended

## Summary
Calendar widget upgraded from date-only notes to a timed scheduler that tracks time, fires staged alerts, and writes every state change to Log. Minimal UI preserved (same grid, same Block; additions are one optional time field, a countdown column, `[OK]`).

## Changes
| File | Change |
|---|---|
| `src/client/utils/calendar.ts` (new) | Pure logic: `parseTime`, `entryStart`, `dueStage`, `formatCountdown`, alert keys |
| `src/client/components/CalendarWidget.tsx` | Optional `HH:MM` on entries; 15 s tick; live `T-hh:mm` countdown; `OVERDUE` marker; `[OK]` to complete tasks/calls; alert banner; browser Notification (permission requested only when a timed entry is added) |
| `src/client/components/Logs.tsx` | Renderers for `CAL ALERT:` and `CAL DONE:` |
| `src/server/routes/api.ts` | `calendar_alert`, `calendar_done` added to displayable `/logs` events |
| `scripts/tests/test-calendar.ts`, `package.json` | `yarn test:calendar` (13 assertions, pass in UTC and America/New_York) |

## Behaviour
- **Stages:** `T-15 MIN` (timed entries only) → `NOW` (at start) → `OVERDUE` (30 min after, tasks/calls only; notes never go overdue). All-day entries anchor at 09:00, no T-15.
- **Catch-up:** if the page opens late only the highest due stage fires; nothing older than 24 h alerts.
- **Dedup:** key `entryId:stage` checked against existing `calendar_alert` logs, an in-memory set, and localStorage, so reloads and refetches do not repeat alerts. Two simultaneous tabs may still log one duplicate.
- **Banner:** fixed top strip, black, mono, uppercase, red rule for OVERDUE; `ACK` dismisses, `DONE` completes.
- **Log trail:** `calendar_entry` → `calendar_alert` (per stage) → `calendar_done`, all append-only, linked by `entryId`.

## Verification
- `yarn test:calendar`: PASS (UTC + NY timezone).
- esbuild syntax parse of `CalendarWidget.tsx` and `Logs.tsx`: PASS.
- **Not run:** full `tsc` build and in-browser run. `node_modules` is absent in this environment and the repo tsconfig errors on TS 6 deprecation unrelated to this change. Treat as **unverified in-app**; run `yarn build` before shipping.

## Known limits / next
1. Alerts fire only while the app is open (client tick). Closed-app delivery needs a server job or web push.
2. `/logs` returns the latest 500 events; very old entries can drop out of the widget.
3. Entries cannot yet be edited or deleted (logs are append-only); add a `calendar_cancel` event.
4. Optional: soft alert sound via existing `sound.ts`; recurring entries; per-entry custom lead time.
