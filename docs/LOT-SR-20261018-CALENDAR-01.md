# LOT-SR-20261018-CALENDAR-01 — Calendar Widget: Time Tracking + Alert Engine

```
DATE     : 2026-10-18
CLASS    : ENGINEERING
BRANCH   : claude/dreamy-babbage-pu8ps5
TRIGGER  : Scheduled routine — "make a reliable Calendar widget that tracks time
           and logs into Log, with military-grade event notifications. Keep UI minimal."
```

## BASELINE
- `CalendarWidget.tsx` (281 lines): month grid, add note/task/call per date, upcoming list.
- No time-of-day, no alerts, no completion state, no dedupe, no error handling on create.
- `/api/logs` whitelist did not include calendar alert/status events.

## CHANGES
| File | Change |
|---|---|
| `src/client/utils/calendar.ts` (new) | Pure engine: `buildEntries` (dedupe by entryId, latest status wins), `currentStage`, `formatCountdown`, `formatAlertLine`, `loggedAlertKeys` |
| `src/client/components/CalendarWidget.tsx` | Optional HH:mm time; alert ticker (10 s); alert banners with ACK/DONE; done/cancel controls; live countdown; optimistic add with rollback on error; opt-in browser notifications ("Alerts: ON/OFF") |
| `src/client/components/Logs.tsx` | Renders `calendar_entry` (now with time), `calendar_alert`, `calendar_status` |
| `src/server/routes/api.ts` | `calendar_alert`, `calendar_status` added to the `/logs` display whitelist |

## ALERT DOCTRINE
- Stages: `T-15` → `T-05` → `T-00` → `MISSED` (5 min after start, unacknowledged and not done).
- Line format: `T-05 // CALL // 14:30 // text`. T-00 pulses; MISSED is struck through; nothing else animates.
- Only the latest applicable stage fires, so a late load logs one alert, not three.
- Each (entry, stage) is logged to Log **once**: guarded by existing `calendar_alert` logs, a localStorage set, and an in-memory ref. Ticker waits for logs to finish loading first.
- Untimed entries never alert. Entries older than 12 h are history, not alerts.
- Done/cancelled state is an append-only `calendar_status` log (Log has no delete for non-notes); latest event wins.
- Entries carry a client `entryId`; legacy entries (no id) are keyed by date+type+text so they still display.

## VERIFY
```
Engine unit asserts (tsx): PASS — stage boundaries, done/untimed suppression,
                           12 h window, countdown format, dedupe + status merge
tsc --noEmit: 11 errors before and after — all pre-existing (tsconfig/deprecation),
              none in touched files
Full client build: NOT run (esbuild runner failed on module resolution in this
              sandbox, pre-existing) — verify on CI/deploy
Browser/manual UI test: NOT done
```

## KNOWN GAPS / NEXT
- Alerts only fire while the app is open in a tab (no service worker / push). Real background push needs a server job or SW — next candidate.
- Time is device-local; no timezone field on entries.
- No recurring events, no edit-in-place (cancel + re-add).
- No persistent test runner in repo for `utils/calendar.ts`; asserts were ad hoc.
- `useLogs` staleTime is 5 min; alert/status logs rely on `refetchQueries` after create.
