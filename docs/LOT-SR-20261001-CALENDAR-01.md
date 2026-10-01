```
╔══════════════════════════════════════════════════════════════════════╗
║              LOT SYSTEMS — TERMINAL SESSION REPORT                   ║
╠══════════════════════════════════════════════════════════════════════╣
║  ID       : LOT-SR-20261001-CALENDAR-01                              ║
║  DATE     : 2026-10-01                                               ║
║  CLASS    : ENGINEERING                                              ║
║  SCOPE    : Calendar widget — time tracking · alerts · Log           ║
║  S-2      : VADIK MARMELADOV                                         ║
╚══════════════════════════════════════════════════════════════════════╝
```

## INTAKE
Scheduled task: continue Calendar widget; keep minimalist UI; reliable time tracking that logs into Log, with military-style event notifications.

## ORIENT (state before)
- `CalendarWidget.tsx` supported date-only entries (note/task/call) stored as `calendar_entry` logs. No time of day, no alerts, no completion state.

## BUILD
| Area | Change |
|---|---|
| `src/client/utils/calendarAlerts.ts` (new) | Pure alert engine. Stage ladder T-15 → T-5 → T0 → MISSED(+15). Fire-once planning; late open surfaces only the latest stage and silently marks earlier ones; entries >24h old are never alerted. Live state (UPCOMING/SOON/NOW/OVERDUE/DONE), `T-HH:MM` offset formatter, alert text formatter. |
| `CalendarWidget.tsx` | Optional `HH:mm` time input on entries. 15 s clock (paused on hidden tabs). Alert engine effect: toast (`▌STANDBY // T-00:15`, `READY`, `EXECUTE`, `OVERDUE`), optional browser Notification via `Alerts: ARMED/OFF` toggle, fire-once dedupe (localStorage + `calendar_alert` logs). `[DONE]` action closes an entry. Upcoming list shows time, live `T-` countdown, OVERDUE tag; done entries hidden. |
| Log integration | New events `calendar_alert` (each fired stage) and `calendar_done` (completion); `calendar_entry` now carries `metadata.time`. `Logs.tsx` renders `CAL:` (with time), `CAL-ALERT:`, `CAL-DONE:`. `api.ts` GET /logs whitelist extended. |
| Test | `scripts/tests/test-calendar-alerts.ts` — pure-logic assertions. |

## CHECKS
```
calendar-alerts logic test   : PASS  (node --experimental-strip-types scripts/tests/test-calendar-alerts.ts)
esbuild TSX parse (Widget, Logs) : PASS
Full tsc / yarn build        : NOT RUN — node_modules absent in sandbox, install not available
```

## KNOWN LIMITS / NEXT
1. Alerts run only while the System page (where the widget mounts) is open in a tab. True background alerts need a service worker / push or a server job — next session candidate.
2. Alerts are per-device (localStorage dedupe); the same entry may alert once per device. A server-side dedupe via the `calendar_alert` logs partly mitigates after a refetch.
3. Yesterday's undone timed entries are not listed after midnight (the MISSED alert is logged).
4. Not yet: editing/deleting entries, durations, recurrence.
5. Run `yarn build` + manual UI pass before release; not verified in a browser.
