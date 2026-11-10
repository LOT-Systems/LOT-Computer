# LOT-SR-20261110-CALENDAR-02 — Calendar Widget: reliability pass

**Date:** 2026-11-10 · **Branch:** `claude/dreamy-babbage-si0s6p` · **Mode:** scheduled / autonomous
**Base:** `master` @ `98971f2` + yesterday's work (`9da031a`, cherry-picked from `claude/dreamy-babbage-pmzd8h`)

## STATUS
| Check | Result |
|---|---|
| Client build (`client:js:build`, `client:css:build`) | GREEN (only the existing duplicate-key warnings in `badges.ts`) |
| `tsc -p tsconfig.json` | No new errors. The output matches the baseline line for line, with 128 existing errors, none in calendar files |
| `tsc -p tsconfig.server.json` | GREEN (0 errors) |
| Engine unit test, `scripts/tests/calendar/alerts.test.mjs` | ALL PASS, 34 assertions (was 17) |
| Feed reducer test, `scripts/tests/calendar/feed.test.mjs` | ALL PASS, 8 assertions (new) |
| Browser E2E, `scripts/tests/calendar/e2e.cjs` (Chromium, fake clock, mocked API) | ALL PASS, 11 assertions (new) |
| Live DB / production | NOT RUN: there is no database in the sandbox |

## ⚠ PROCESS FINDING
Every nightly Calendar session since 2026-11-03 has started from `master` on a new branch, and **none was merged**.
Those branches are `583282a`, `e6365fe`, `05b815f`, `d231f71`, `085d5e9`, `1f4e3af` and `9da031a`.
Each night rebuilt the same foundation. Today's branch carries yesterday's commit plus this session, so it **supersedes all earlier calendar branches**.
Merging this branch stops the loop. The next run will then build on `master`.

## BUGS FOUND & FIXED
1. **Entries silently vanished.** The widget read `/api/logs`, which returns only the **500 most recent** rows.
   Every alert writes a log row, so the alert stream itself pushed older calendar entries, completions and fired-alert keys out of that window.
   When this happened, entries disappeared and dedupe keys were lost, which allowed duplicate alerts.
2. **The calendar was empty for `hideActivityLogs` users.** For those users `/api/logs` returns only `note` events.
3. **Light theme broke the toast.** The toast background was `var(--bg,#000)`, which fell back to black in the light theme. It now uses the theme token `bg-bac`.
4. **The toast had no padding.** `px-12` is not on the LOT spacing scale. It is now `px-16`.
5. **The toast header wrapped** on `OVERDUE`. The header is now `nowrap`.

## SHIPPED
1. **`GET /api/calendar`.** This is a dedicated feed of every `calendar_*` event for the user.
   - It does not depend on the 500-row window or on `hideActivityLogs`.
   - It returns slim rows and is capped at 3000.
   - The client polls it every 60 s and on window focus, so a completion on another device clears the alert here within about a minute.
2. **Optimistic feed writes.** Every calendar write is added to the feed cache as soon as it succeeds. The alert engine sees it before the next poll.
3. **Snooze `[+10m]`.** This is available on T-0, OVERDUE and TODAY toasts, and it writes a `calendar_snooze` event.
   - The entry stays silent until the snooze ends, then re-arms as T-0 and then OVERDUE.
   - Each snooze bumps a generation counter (`gen`), and the alert key includes it (`id:s{gen}:STAGE`), so every snooze can fire again without colliding with earlier alerts.
4. **Scrub.** The day view has a `scrub` action, which asks for confirmation and then writes a `calendar_cancel` tombstone. The Log stays append-only and nothing is deleted.
5. **System alerts (opt-in).** The calendar panel has a `System alerts: on/off` toggle.
   - When it is on, alerts also go to the OS through the Notifications API, but only while the tab is hidden. The in-app toast covers the visible case.
6. **Toast v2 (military).**
   - Header formats: `>> CAL · T-0`, `!! CAL · OVERDUE` (pulsing marker) and `// CAL · T-15`.
   - Each toast shows a sequence number and fire time, `#002 · 14:30`.
   - Body: the type and the text.
   - Footer: `date time · IN 12M / NOW / +37M`, plus `SNZ n` when the entry has been snoozed.
   - Actions: `[ack] [+10m] [done]`. **ESC** acknowledges the newest alert.
   - A toast clears itself if its entry is completed, scrubbed or snoozed anywhere.
7. **Log.** `Logs.tsx` renders `calendar_snooze` (`SNOOZE +10M`) and `calendar_cancel` (`SCRUBBED`) as `CAL:` blocks.
   - The `/logs` whitelist now uses a shared `CALENDAR_EVENTS` constant.
   - `done` records which stage it was completed from (`from`) and when (`at`), so on-time rate can be computed later.
8. **Hardening.**
   - Text is capped at 280 characters.
   - Dates that are not `YYYY-MM-DD`, invalid times and unknown types are dropped or normalised by the feed reducer.
   - Untimed entries sort at 08:00.

## E2E SCENARIO (verified in Chromium)
| Clock (UTC) | Event | Asserted |
|---|---|---|
| 14:20 | open app, call at 14:30 | `1:T-15` fired once and logged |
| 14:30 | tick | `1:T-0` fired; the T-15 toast is replaced |
| 14:30 | `[+10m]` | `calendar_snooze` gen=1 logged; toast cleared |
| 14:41 | tick | `1:s1:T-0` re-armed and fired |
| 14:41 | `[done]` | `calendar_done` logged; entry gone from the toast and from Upcoming |
| reload | — | no duplicate alerts |
| reload, new 13:00 task | late open | a single `3:OVERDUE`, no T-15/T-0 burst |
| — | ESC | toast acknowledged |

## FILES
- **new:**
  - `src/client/utils/calendarFeed.ts`: pure reducer
  - `src/client/utils/calendarNotify.ts`
  - `scripts/tests/calendar/{alerts.test.mjs, feed.test.mjs, e2e.cjs, build-harness.mjs, harness.tsx}`
- **mod:**
  - `server/routes/api.ts`: `/calendar` and `CALENDAR_EVENTS`
  - `queries.ts`: `useCalendarFeed`
  - `hooks/useCalendarEntries.ts`: feed and `useCalendarActions`
  - `utils/calendarAlerts.ts`: snooze, `effectiveMoment`, generation keys
  - `CalendarAlertHost.tsx`, `CalendarWidget.tsx`, `Logs.tsx`
- **moved:** `scripts/test-calendar-alerts.mjs` → `scripts/tests/calendar/alerts.test.mjs`

## RUN THE TESTS
```
node --experimental-strip-types scripts/tests/calendar/alerts.test.mjs
node --experimental-strip-types scripts/tests/calendar/feed.test.mjs
yarn client:css:build && node scripts/tests/calendar/build-harness.mjs /tmp/cal.js
node scripts/tests/calendar/e2e.cjs dist/client/css/index.css /tmp /tmp/cal.js
```

## KNOWN LIMITS / RISKS
- Alerts still need an open tab. Without a service worker, nothing fires when every tab is closed.
- Entry times are in device-local time, with no timezone pinning, so travelling across zones shifts alerts.
- `/api/calendar` is capped at 3000 rows. At roughly 4 alert rows per entry, that is about 700 entries of history before old ones fall out. A future date-range filter can remove the cap.
- System notifications require the user to grant browser permission. iOS Safari supports them only for PWAs installed to the home screen.

## NEXT SESSION (proposed)
1. **Merge this branch** (see PROCESS FINDING).
2. Service-worker push from the server: a scheduled job scans the next 15 minutes of `calendar_entry` rows, so alerts fire with every tab closed.
3. Recurring entries (daily / weekdays / weekly).
4. Minimal on-time-rate line built from `calendar_done.from`, for example `ON-TIME 8/10 · 7D`.
5. Edit an entry by writing a superseding `calendar_entry` with `replaces: id`.
