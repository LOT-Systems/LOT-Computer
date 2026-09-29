# LOT-SR-20260929-CALENDAR-01 — Calendar Widget: Timed Alerts

DATE: 2026-09-29 · CLASS: ENGINEERING · BRANCH: claude/dreamy-babbage-p2ehu1

## Intake
Scheduled task: make the Calendar widget reliable, track time, log to Log, add
military-style event notifications, keep the UI minimal.

## Changes
- `CalendarWidget.tsx`
  - Entries take an optional time (`HH:mm`, stored in log metadata `time`); all-day entries unchanged.
  - Live clock (1 s tick, re-synced on tab wake) and `NEXT T-hh:mm:ss` countdown next to "Add date".
  - Alert engine, per timed entry: ADVISORY at T-15, WARNING at T-5, EXECUTE at T-0, MISSED at T+1 min
    (window closes 1 h after start). Only the most urgent stage is shown.
  - Banner: single bordered line `▌WARNING · T-04:59 | CALL · text | ACK`. Border strengthens per stage; EXECUTE/MISSED pulse. ACK hides it locally.
  - Exactly-once logging: each alert writes a `calendar_alert` log (`metadata.key = <entryId>:<stage>`), deduplicated by
    an in-memory set, localStorage, and existing server logs (so other devices/reloads do not re-fire). Failed writes are retried next tick.
  - Entry IDs and sort by date+time.
- `Logs.tsx`: renders `calendar_alert` (label `ALERT:`, stage, type, text, date/time).
- `api.ts`: `calendar_alert` added to displayable log events.

## Verification
- `tsc --noEmit`: no errors in the three touched files (pre-existing unrelated errors unchanged).
- Not exercised in a browser this session (no live time-travel test).

## Known gaps / next
- Alerts fire only while the app is open (no push/service-worker or server-side scheduler yet).
- No edit/delete/done for entries; no browser Notification API / sound; no recurring events.
- Suggested next session: server job for alerts when app closed, entry completion logging, unit tests for stage logic.
