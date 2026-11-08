# LOT-SR-20260808-CALENDAR-01 — Calendar Widget: timed events + alert engine

**Branch:** claude/dreamy-babbage-iyreji · **Mode:** scheduled autonomous session

## Objective
Reliable Calendar widget that tracks time, logs to Log, with military-style event notifications, minimalist UI preserved.

## Baseline
`CalendarWidget.tsx` supported date-only entries (note/task/call), no time, no alerts, no lifecycle logging.

## Delivered
| Area | Change |
|---|---|
| Engine | New pure module `src/client/utils/calendarEngine.ts`: time parsing (`9:5`, `930`, `09:30`), phase calc, idempotent `dueAlerts`, countdown `T-HH:MM:SS` |
| Phases | `T-15 WARNING` → `T-0 ACTIVE` (5 min window) → `MISSED`; `CONFIRMED` on `[ACK]` |
| Widget | Optional `HH:MM` field; entries sorted by date+time; time shown in list; 1s ticker; alert banner (monospace, uppercase, left-rule, pulse on ACTIVE); `Alerts: ARMED/OFF` toggle for browser Notifications (opt-in) + vibrate on ACTIVE |
| Log | Each phase persisted once as `calendar_alert` log (metadata: entryId, phase, date, time, firedAt); rendered in Logs as `CAL ALERT:` block; whitelisted in `GET /logs` |
| Reliability | Dedupe by logged phases + in-session ref; later phase supersedes earlier; items >24h old never alert (no flood on reopen); acknowledged items drop from upcoming list; invalid time blocks submit |
| Tests | `scripts/calendar-engine.test.ts` — 13 assertions, pass (`npx tsx scripts/calendar-engine.test.ts`) |

## Verification
- Engine tests: PASS. esbuild syntax transform of CalendarWidget.tsx and Logs.tsx: PASS.
- **Not verified:** full `tsc` / build (no `node_modules` in the routine container) and no visual run. Treat as un-benchmarked until `lot-benchmark` is run.

## Known limits / next
1. Alerts fire only while the app is open (client ticker). True background alerts need a server job or Web Push/service worker.
2. Multi-tab/device race could double-log a phase (rare); a server-side unique key on (entryId, phase) would close it.
3. No edit/delete of entries yet; no duration / elapsed tracking; no recurring events.
4. Server planner counters still count only `calendar_entry`; consider counting `done` alerts as completion signal in QIE.
5. Run full build + visual check.
