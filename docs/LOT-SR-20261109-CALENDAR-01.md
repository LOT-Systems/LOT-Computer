# LOT-SR-20261109-CALENDAR-01 — Calendar Widget: time tracking + alert system

**Date:** 2026-11-09 · **Branch:** `claude/dreamy-babbage-pmzd8h` · **Mode:** scheduled / autonomous

## STATUS
| Check | Result |
|---|---|
| Client build (`client:js:build`) | GREEN (only pre-existing duplicate-key warning in badges.ts) |
| `tsc` on touched files | no new errors (existing errors in Logs.tsx / app.tsx are in untouched lines) |
| Alert-stage unit test (`scripts/test-calendar-alerts.mjs`) | ALL PASS (17 assertions) |
| Browser / live-DB test | NOT RUN (no DB in sandbox) |

## BEFORE
Date-only entries. No time, no completion, no notifications. Widget only worked while on the System page.

## SHIPPED
1. **Time tracking** — optional `HH:mm` per entry (`<input type=time>`), stored in `calendar_entry.metadata.time`. Upcoming list shows time + live relative label (`in 12m`, `+37m`).
2. **Done state** — `[x]` / `done` writes a `calendar_done` log; entries are derived from the Log (no new tables, no migration). Done entries leave Upcoming, strike through in day view.
3. **Alert engine** (`utils/calendarAlerts.ts`, pure + tested). Escalating stages:
   `T-15` → `T-0` (5-min window) → `OVERDUE` (≤48h, until done); untimed entries → `TODAY` from 08:00, `OVERDUE` next day.
   Only the *current* stage fires, so opening the app late yields one alert, not a burst.
4. **Global host** (`CalendarAlertHost`, mounted in `entries/app.tsx`) — alerts fire on every tab/route, 15 s tick + on tab re-focus.
5. **Military-style notifications** — minimal mono toast, bottom-right: `// T-15 · 14:30 · in 12m`, `[ack]` `[done]`. `T-15` self-dismisses (15 s); `T-0`/`OVERDUE`/`TODAY` hold until ACK. Short square-wave beep on `T-0` (3 pulses) and `OVERDUE` (2).
6. **Log integration** — every alert writes `calendar_alert` (`[ALERT T-0] call: … (2026-11-09 14:30)`) with deterministic key `entryId:stage`. Dedup via Log keys + localStorage + in-session set (survives reload, second tab/device). `Logs.tsx` renders `calendar_alert` / `calendar_done` as `CAL:` blocks; `/logs` whitelist updated server-side.

## FILES
- new: `src/client/utils/calendarAlerts.ts`, `src/client/hooks/useCalendarEntries.ts`, `src/client/components/CalendarAlertHost.tsx`, `scripts/test-calendar-alerts.mjs`
- mod: `CalendarWidget.tsx`, `Logs.tsx`, `entries/app.tsx`, `server/routes/api.ts`

## KNOWN LIMITS / RISKS
- Alerts need the app open (browser tab). No OS push / service worker yet.
- `/api/logs` staleTime is 5 min; alert/done writes force a refetch. Another device's completion appears after next refetch, so a device may alert on an item just completed elsewhere.
- Entries cannot be edited or deleted (Log is append-only); `done` is the closure path.
- Entry time is local-device time; no timezone pinning.
- Scheduled jobs count `calendar_entry` only; `calendar_alert`/`calendar_done` not yet fed to QIE/badges (intentional, avoids inflating signals).

## NEXT SESSION (proposed)
1. Browser-test the toast flow with Playwright against a mocked `/api/logs`.
2. Web Notifications API opt-in (`[enable system alerts]`) for background tabs.
3. Recurring entries (daily/weekly) and snooze (`[+10m]`).
4. Delete/edit via tombstone log (`calendar_cancel`).
5. Done-streak / on-time rate line in widget (minimal).
