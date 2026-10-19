# LOT-SR-20261019-CALENDAR-01 — Calendar Widget: Time Tracking + Alert Engine

**Date:** 2026-10-19 · **Branch:** claude/dreamy-babbage-vts80k · **Mode:** scheduled, autonomous

## Objective
Make the Calendar widget reliable: track time of day, notify with a military-style staged alert sequence, log everything to Log. Keep the UI minimal.

## Changes
| File | Change |
|---|---|
| `src/client/utils/calendarAlerts.ts` (new) | Pure engine: stage windows, T-minus clock, HH:MM parsing, fired-stage ledger, desktop notification helper |
| `src/client/components/CalendarWidget.tsx` | Optional `HH:MM` field on entries; alert banners; ticker; ACK; "Enable alerts"; time shown in lists; timed entries sorted by time |
| `src/client/components/Logs.tsx` | New `CAL-ALERT:` block; `calendar_entry` shows time |
| `src/server/routes/api.ts` | `calendar_alert` added to displayable `/logs` events |

## Alert sequence
| Stage | Window | Label | Look |
|---|---|---|---|
| standby | T-15:00 → T-05:00 | STAND BY | dim border |
| armed | T-05:00 → T-0 | ARMED | bright border |
| now | T-0 → T+1:00 | EXECUTE | pulsing |
| overdue | T+1:00 → T+60:00 | OVERDUE | pulsing |

Banner format: `STAND BY · call 14:30   <text>   T-09:12   ACK`. Each stage fires once: a `calendar_alert` Log row (`[CAL] ARMED · CALL 14:30 · text`) plus a browser notification if permission was granted. ACK hides the banner and logs `stage: ack`.

## Reliability
- **No double-fire:** per-browser localStorage ledger of `entryId:stage`, plus a check of existing `calendar_alert` logs (covers other devices/reloads).
- **Adaptive tick:** 1 s only while an alert window is live, 15 s otherwise; clock re-syncs on tab visibility (background-throttled timers).
- **Validation:** invalid `HH:MM` blocks submit (field outlines); past times rejected; untimed entries behave as before (backward compatible).
- Entries use the Log row `id` as the stable key.

## Verification
- Pure engine unit-checked via tsx: 11/11 PASS (stage boundaries, countdown format, parsing, active-alert selection).
- `tsc --noEmit`: 33 errors before and after; none in touched files.
- Not run: full build, live browser/E2E (no DB/session in this environment).

## Known gaps / next
1. Alerts only fire while the app is open; closed-tab alerts need a service worker / server scheduler (web push).
2. Notification permission request needs a user click (done via "Enable alerts").
3. No end time / duration, edit, delete, or recurrence yet.
4. Optional audio cue (reuse `sovietChime`) at EXECUTE.
5. `useLogs` staleTime is 5 min — entries added on another device appear late; consider a targeted refetch.
