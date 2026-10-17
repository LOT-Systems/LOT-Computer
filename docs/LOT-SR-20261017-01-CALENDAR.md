```
╔══════════════════════════════════════════════════════════════════════╗
║                  LOT SYSTEMS — TERMINAL SESSION REPORT               ║
╠══════════════════════════════════════════════════════════════════════╣
║  ID       : LOT-SR-20261017-01-CALENDAR                              ║
║  DATE     : 2026-10-17                                               ║
║  CLASS    : ENGINEERING                                              ║
║  SUBJECT  : Calendar widget — time tracking + alert system           ║
╚══════════════════════════════════════════════════════════════════════╝
```

## INTAKE
Scheduled task: continue the Calendar widget, keep the minimalist UI, make it reliable,
track time, log to Log, add military-grade event notifications.

## ORIENT (baseline)
- `CalendarWidget.tsx` stored date-only entries (`calendar_entry` logs). No time of day,
  no completion state, no alerts. List keyed by array index.

## BUILD
| File | Change |
|---|---|
| `src/client/utils/calendar.ts` (new) | Pure logic: `buildEntries`, `normalizeTime`, `dueStage`, `activeStage`, `formatCountdown`, `nextTimedEntry`, `alertLogText` |
| `src/client/components/CalendarWidget.tsx` | Optional `HH:MM` field (validated, red border when invalid); `[done]` action; NEXT countdown line `T-02:14:05`; alert banner; alert engine; stable keys (log id) |
| `src/client/components/Logs.tsx` | `calendar_entry` shows time; new `CAL-ALRT:` block for alerts/done |
| `src/server/routes/api.ts` | `calendar_alert`, `calendar_done` added to `/logs` displayable events |

### Alert doctrine
- Stages: `T-60` → `T-15` → `T-0` (NOW) → `OVERDUE` (+15 min).
- Each stage logs once per entry (`calendar_alert`, metadata `entryId`, `stage`). Dedupe is
  by existing logs AND an in-flight ref, so reloads and refetches never repeat an alert.
- Only the latest reached stage fires; alerts older than 6 h past the entry are dropped, so
  opening the app after a long absence does not replay a backlog.
- All-day entries and done entries never alert. `[done]` logs `calendar_done`.
- UI: T-15/NOW/OVERDUE render as a single-line banner with a left rule (NOW/OVERDUE pulse).
  Browser notification fires only if permission is already granted; permission is requested
  once, on the user gesture of adding a timed entry.
- Clock ticks 1 s while a timed entry is pending, 30 s otherwise.

## CHECKS
```
Logic unit tests (isolated tsx run, dayjs): PASS
  time parsing (930, 9, 9:30, 14.05, 25:00, 9:75), stage boundaries, all-day exclusion,
  stale window, alert dedupe, done suppression, countdown formatting
Full tsc / client build: NOT RUN — node_modules not installed in this environment
```

## KNOWN LIMITS / NEXT
- Alerts fire only while the app is open (no server-side or push scheduler yet).
- No edit/delete of entries (the Log API only permits editing `note` logs).
- Alert logs add Log volume (≤4 per timed entry).
- Next: typecheck + build in CI, server-side scheduled alert job, recurring entries.
