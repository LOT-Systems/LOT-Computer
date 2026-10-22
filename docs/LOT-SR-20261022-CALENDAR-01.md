```
╔══════════════════════════════════════════════════════════════════════╗
║              LOT SYSTEMS — CALENDAR WIDGET SESSION REPORT            ║
╠══════════════════════════════════════════════════════════════════════╣
║  ID     : LOT-SR-20261022-CALENDAR-01                                ║
║  DATE   : 2026-10-22                                                 ║
║  CLASS  : ENGINEERING                                                ║
║  BRANCH : claude/dreamy-babbage-ob96c4                               ║
╚══════════════════════════════════════════════════════════════════════╝
```

## OBJECTIVE
Reliable Calendar widget that tracks time and logs to Log, with military-style
event notifications. Keep the minimalist UI.

## ORIENT (baseline)
- `CalendarWidget.tsx` (281 lines): date-only entries (note/task/call), logged as
  `calendar_entry`. No time of day, no alerts, no way to close an entry; entries had
  no stable id (React keys by index).

## BUILD
| Area | Change |
|------|--------|
| `src/client/utils/calendar.ts` (new) | Pure engine: `parseEntries`, `dueAlerts`, `countdown`, `entryMoment`. State derived entirely from Log events. |
| `CalendarWidget.tsx` | Optional `HH:mm` time on entries; 1s clock; alert banner (`▲ T-15 · call · 14:30 · text`, pulsing border, live `T-hh:mm:ss` countdown); `DONE` / `ACK` on alerts; `done` / `cancel` per entry; "Enable alerts" button for OS notifications (only shown if permission is `default`); today's timed entries show countdown. |
| `src/server/routes/api.ts` | `GET /logs` whitelist += `calendar_alert`, `calendar_ack`, `calendar_done`, `calendar_cancel`. |
| `scripts/calendar.test.mjs` (new) | Unit tests for the engine. |

### Event model (all in Log, append-only)
```
calendar_entry   {date, time?, text, entryType}
calendar_alert   {entryId, stage: T-15|T-0}   fired once per stage
calendar_ack     {entryId, stage}
calendar_done    {entryId}
calendar_cancel  {entryId}
```
Logs render through the generic `LOG:` block, e.g. `[ALERT T-0] CALL 14:30 — Call mom`.

### Alert rules
- Timed: `T-15` (15 min before) and `T-0`. All-day: `T-0` at 08:00 local.
- Only the latest due stage per entry fires (late-opened page → one alert, no burst).
- Nothing fires more than 120 min after the event, or for done/cancelled entries.
- Dedupe: alert/ack state derived from logs (survives reload, shared across devices)
  plus optimistic local keys.

## CHECKS
```
Engine unit tests (node --experimental-strip-types scripts/calendar.test.mjs): PASS
  - invalid time falls back to all-day; done status; T-15/T-0 staging; dedupe;
    grace cutoff; 08:00 all-day trigger; countdown format
tsc / client build: NOT RUN — node_modules absent and registry unreachable in this
  sandbox. Widget TSX reviewed by hand only. FIRST ACTION NEXT SESSION: run
  `yarn build` / tsc and fix any type errors.
```

## KNOWN LIMITS / NEXT
1. Typecheck + build verification (above) — top priority.
2. Alerts fire only while the app is open (client-side). True background alerts need a
   server job / web push; scheduled-jobs.ts could emit `calendar_alert` server-side.
3. If the alert log POST fails, that alert is not retried this session.
4. Two open tabs may double-fire an alert before the first log round-trips.
5. Dedicated Logs renderer for `calendar_*` events (currently generic `LOG:`).
6. Edit-entry (reschedule) and recurring entries not implemented.
