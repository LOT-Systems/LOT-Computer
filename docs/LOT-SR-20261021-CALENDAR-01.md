```
╔══════════════════════════════════════════════════════════════════════╗
║              LOT SYSTEMS — TERMINAL SESSION REPORT                   ║
╠══════════════════════════════════════════════════════════════════════╣
║  ID       : LOT-SR-20261021-CALENDAR-01                              ║
║  DATE     : 2026-10-21                                               ║
║  CLASS    : ENGINEERING                                              ║
║  SCOPE    : Calendar widget — time tracking + alert pipeline         ║
╚══════════════════════════════════════════════════════════════════════╝
```

## INTAKE
Scheduled run: make the Calendar widget reliable, track time, log to Log,
military-grade alerts, minimalist UI preserved.

## BASELINE (found)
- CalendarWidget stored date-only `calendar_entry` logs. No time, no alerts, no countdown.
- `calendar_entry` logs rendered in Log as `CAL:`.

## BUILD
| File | Change |
|---|---|
| `src/client/utils/calendarAlerts.ts` (new) | Pure alert engine. Stages T-15 STANDBY, T-0 EXECUTE, T+15 MISSED. Fires once per (entry, stage). Catch-up collapses to the latest stage. Silent past a 60 min window. Done entries never alert. Countdown `T-hh:mm:ss`. |
| `src/client/components/CalendarWidget.tsx` | Optional HH:MM time on entries. 15 s tick plus refresh on tab visibility. Alert banner with `[ACK]`. Next-event countdown line. Opt-in browser notifications (`Enable alerts`). Each fired alert and each ACK writes a `calendar_alert` log. Dedupe via Log history plus localStorage. ACKed entries struck through and dropped from upcoming. |
| `src/client/components/Logs.tsx` | `CAL-ALERT:` handler (T-15 / T-0 / T+15 / ACK). |
| `src/server/routes/api.ts` | `calendar_alert` added to the displayable events whitelist for `GET /logs`. |
| `scripts/tests/test-calendar-alerts.ts` (new) | 20 assertions on stage timing, dedupe, catch-up, window, done/untimed. |

UI: no new chrome. Alerts, countdown and the time input use the existing mono/`text-acc` styling and appear only when relevant.

## CHECKS
```
node --experimental-strip-types scripts/tests/test-calendar-alerts.ts : PASS
tsc (widget + util, partial): no errors beyond missing-module noise
Full build / full tsc : NOT RUN — node_modules not installed in this environment
Browser run / visual check : NOT RUN
```

## KNOWN LIMITS / NEXT
- Alerts only fire while the app is open (client-side). Closed-app delivery needs a server job or web push.
- Entries cannot yet be edited or deleted (log-backed, append-only).
- The `System.tsx` next-event line ignores `time`; ordering by time not yet used there.
- Entries created before this change have no time and never alert.
- Possible next steps: server-side T-0 push, per-entry lead-time, all-day reminders at a set hour, reschedule.
