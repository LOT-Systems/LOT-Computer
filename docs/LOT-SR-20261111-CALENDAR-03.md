# LOT-SR-20261111-CALENDAR-03 — Calendar Widget: recurrence, edit, on-time discipline

**Date:** 2026-11-11 · **Branch:** `claude/dreamy-babbage-ln0dzm` · **Mode:** scheduled / autonomous
**Base:** `master` @ `98971f2` + `claude/dreamy-babbage-si0s6p` (`f689006`, `847be8a`) fast-forwarded in.
This branch **supersedes every earlier calendar branch**.

## STATUS
| Check | Result |
|---|---|
| Client build (`client:css:build`, `client:js:build`) | GREEN |
| `tsc -p tsconfig.json` | No new errors. The 104 error lines are identical to the baseline before this session's changes, and none are in calendar code |
| `tsc -p tsconfig.server.json` | GREEN (0 errors) |
| `alerts.test.mjs` (engine) | ALL PASS, 34 |
| `feed.test.mjs` (reducer, recurrence, edits, stats) | ALL PASS, 28 (was 8) |
| `e2e.cjs` (Chromium, fake clock): alert ladder, snooze, done, reload dedupe | ALL PASS, 11 |
| `e2e-recurring.cjs` (Chromium, new): series, skip, edit, scrub series, on-time line | ALL PASS, 14 |
| Live DB / production | NOT RUN: there is no database in the sandbox |

## ⚠ PROCESS FINDING (still open)
Calendar work is still not merged. Every nightly run starts again from `master`, and this run had to carry yesterday's branch forward by hand.
- **Open PR #93** (`claude/dreamy-babbage-4iv1xo`, July) is a stale, earlier calendar attempt. Close it.
- **Merge this branch instead.** It contains all calendar work to date.

## SHIPPED
1. **Recurring entries.** A new `Once / Repeat daily / weekdays / weekly` cycle toggle sits in the add form.
   - It is stored as `metadata.repeat` on `calendar_entry`.
   - Occurrences expand in the reducer, from 8 days back to 92 days ahead, with id `{seriesId}@{YYYY-MM-DD}`.
   - Done, snooze, skip and alert work per occurrence, so the existing dedupe keys keep working unchanged.
   - **One live alert per series.** An occurrence *lapses* once the next occurrence's alert window opens (T-15, or 08:00 if untimed).
     - Opening the app after missing three daily standups fires **one** alert, not a burst.
     - Yesterday's missed item stays OVERDUE overnight and hands over at today's T-15.
   - The Upcoming list shows only the next live occurrence of each series, labelled with its repeat rule (`· daily`).
2. **Edit (supersede).** `edit` in the day view prefills the form, and the button becomes `Save`.
   - Saving writes a new `calendar_entry` with `replaces: <id>` and `edited: true`. The Log stays append-only, and edit chains resolve to the latest version.
   - Changing the selected date while editing reschedules the entry.
   - Editing an occurrence edits the series from that date forward.
3. **Skip vs. scrub.**
   - `skip` cancels one occurrence and is logged as `SKIPPED`.
   - `scrub` on a recurring entry cancels the whole series after confirmation and is logged as `SCRUBBED SERIES`.
4. **On-time discipline line:** `ON-TIME 2/4 · 7D`, shown under Upcoming when anything is due.
   - It scores tasks and calls whose deadline fell in the last 7 days: start + 5 min for timed entries, end of day for untimed.
   - An item is on time when `calendar_done.at` is at or before its deadline. Missed and lapsed items count against the score.
   - Notes are not scored.
5. **Feed cap removed.** `/api/calendar` previously had a 3000-row cap and would have lost old entries after about 700 entries. It now runs two queries:
   - Lifecycle rows (entry, done, snooze and cancel) are returned in full, up to 10k.
   - `calendar_alert` rows are limited to the last 10 days, since older keys can never fire again.
6. **System "Next:" fix.** `System.tsx` now reads the calendar feed instead of raw `calendar_entry` logs. It previously surfaced done, scrubbed and superseded entries and counted every edit as an extra entry.
7. **Log.** `CAL:` blocks for entries now show `EDIT ·` and `· DAILY/WEEKDAYS/WEEKLY`, plus the entry text.
8. **Grid.** Lapsed (historical) occurrences no longer highlight days.

## E2E SCENARIO: recurring (verified in Chromium, UTC)
| Clock | Action | Asserted |
|---|---|---|
| Tue 08:50 | open; daily 09:00 standup since Sat, Mon closed on time | only `4@2026-11-10:T-15` fires (Sat/Sun/Mon lapsed); one upcoming line; `ON-TIME 1/3 · 7D` |
| 09:00 | `[done]` on the T-0 toast | `calendar_done` entryId `4@2026-11-10`, from `T-0`; line updates to `2/4`; upcoming advances to Wed |
| — | Wed → `skip` | `calendar_cancel` for `4@2026-11-11` `SKIPPED`; upcoming jumps to Thu |
| — | Thu → `edit` → "Standup ops", 10:30, weekdays → `Save` | `calendar_entry` with `replaces: "4"`; old series gone; Thu 10:30 shown |
| — | Thu → `scrub` (confirm) | `SCRUBBED SERIES` on the new series id; nothing left |

## FILES
- **mod:**
  - `utils/calendarFeed.ts`: recurrence expansion, lapse rule, supersede, `doneAt`/`doneFrom`
  - `utils/calendarAlerts.ts`: `lapsed`, `deadline()`, `onTimeStats()`
  - `hooks/useCalendarEntries.ts`: per-minute re-derive, `edit`, skip/scrub-series
  - `CalendarWidget.tsx`
  - `System.tsx`
  - `Logs.tsx`
  - `server/routes/api.ts`
  - `tests/calendar/feed.test.mjs`
- **new:** `scripts/tests/calendar/e2e-recurring.cjs`

## RUN THE TESTS
```
node --experimental-strip-types scripts/tests/calendar/alerts.test.mjs
node --experimental-strip-types scripts/tests/calendar/feed.test.mjs
yarn client:css:build && node scripts/tests/calendar/build-harness.mjs /tmp/cal.js
node scripts/tests/calendar/e2e.cjs dist/client/css/index.css /tmp /tmp/cal.js
node scripts/tests/calendar/e2e-recurring.cjs dist/client/css/index.css /tmp /tmp/cal.js
```

## KNOWN LIMITS / RISKS
- Alerts still require an open tab. There is no server push yet.
- Times are device-local. Travelling across time zones shifts alerts.
- Recurrence is expanded only to 92 days ahead, so grid dots for series disappear beyond that.
- Editing a series from an occurrence restarts the series at that date. Earlier occurrences and their done history leave the reducer, but the Log keeps the full record.
- Snoozing a recurring occurrence and then closing it still scores it late against its original deadline. This is intentional.

## NEXT SESSION (proposed)
1. **Merge this branch, and close PR #93.**
2. Server-side scheduled job plus Web Push (service worker), so T-0 and OVERDUE fire with every tab closed.
3. Pin each entry's timezone (`metadata.tz`) and convert on display.
4. An optional `until` / count end condition for series.
