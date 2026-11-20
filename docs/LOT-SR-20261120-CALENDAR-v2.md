<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-SR-20261120 · CALENDAR v2 · Time Tracking + Military-Precedence Alerts

| Field | Value |
|---|---|
| Session | Scheduled routine · Calendar widget, session 1 |
| Date | 2026-11-20 |
| Branch | `claude/dreamy-babbage-uc34n8` |
| Base | `9f2b88c` |
| Status | **GREEN**: typecheck (no new errors), server tsc 0, unit 10/10, browser 18/18, production build OK |

---

## 1 · Mission

Make the Calendar widget reliable: it should track time, write everything it does to the Log, and send military-style notifications for events. The minimalist UI stays.

## 2 · Starting state (audit)

| # | Finding | Impact |
|---|---|---|
| A1 | Entries were read from `/api/logs`, which returns only the latest **500** rows across all event types | Older calendar entries **disappeared** once the user logged enough other activity |
| A2 | Entries had a date but no time | Nothing to alert on, no time tracking |
| A3 | There was no alert or notification path | The calendar never reached out to the operator |
| A4 | Entries could not be marked done or cancelled | Past tasks dropped off silently, so there was no record of closure |
| A5 | The widget lived only on the System tab, which unmounts when you leave it | Any timer placed there would die on a tab switch |
| A6 | The 7-column grid and the long `nowrap` dates overflowed at phone width (375px) | Horizontal scroll on phones |
| A7 | A failed save gave no feedback, and Add could be double-submitted | Silent data loss or duplicate entries |

## 3 · What was built

### 3.1 Event-sourced model (stored in the Log)

| Event | Metadata | Purpose |
|---|---|---|
| `calendar_entry` | `id, date, time?, text, entryType, lead, dtg, v:2` | Schedule an entry (legacy v1 rows still load and use the log id as the entry id) |
| `calendar_entry_status` | `entryId, status: done/cancelled/active` | Close out or restore an entry |
| `calendar_alert` | `entryId, stage, dtg, firedAt` | Permanent record of every alert that fired |

All three now show up in the **Log** tab:
- `CAL:` shows the entry with its DTG.
- `CAL:` also shows status changes (DONE / CANCELLED / RESTORED).
- `ALRT:` shows the precedence pip, the stage and the DTG.

### 3.2 Alert precedence (named after military message precedence)

| Stage | Trigger | Banner | Sound* |
|---|---|---|---|
| **ROUTINE** | All-day entry, 0800 to 2400 local on the day | Auto-dismisses after 12s | 1 pip |
| **PRIORITY** | Timed entry, T-15 (configurable `lead`) | Stays until ACK | 2 pips |
| **FLASH** | Timed entry, T-0 to T+30 | Stays until ACK, pulsing pip, stronger border | 3 pips |

\*Sound plays only when Time Chime or Sound is already on. The pips are a quiet square wave.

Banner layout, top-centre, one line per row:
1. `■ FLASH` with the DTG `201420L NOV 26` on the right
2. `CALL · 2:20 PM · T+01M`
3. The entry text
4. `[Done]` (tasks only) and `[Ack]`

When the browser tab is hidden, the alert also goes out as an OS notification. Its `tag` collapses duplicates, and a FLASH notification needs interaction to close.

### 3.3 Reliability layers

1. **Disjoint stage windows.** If the app opens late, only the stage open right now fires. There is no backlog of stale alerts.
2. **Boundary-driven scheduler.** The watcher sleeps until the next stage boundary (at most 60s) and re-checks on focus and visibility change, so alerts land on the minute.
3. **Global mount.** `<CalendarAlerts/>` sits at the app root, so it keeps running when the System tab unmounts (fixes A5).
4. **Client ledger.** A session set plus a `localStorage` ledger stops an alert re-firing before the server refetch. If the log write fails, the key is released and the next tick retries it.
5. **Server dedupe.** `POST /logs` with `calendar_alert` is idempotent per entry and stage, so tabs or devices racing each other produce one Log record.
6. **Dedicated feed.** `GET /api/calendar` returns all calendar events, up to 3000 rows, with no 500-row window (fixes A1). It refetches on focus and every 5 minutes, so devices converge.

### 3.4 Widget (minimalist, same structure)

- **Optional time field.** `HHMM` accepts `1430`, `14:30`, `930`, `2pm` and `2:30pm`. Invalid input gets an inline message (A2, A7).
- **Hint line** under the form: "Alert at T-15 and T-0." or "No time: briefing at 0800 on the day."
- **NEXT readout:** `NEXT · T-02H14M · 2:30 PM` for the next timed entry within 7 days.
- **Overdue tasks** stay listed (`Overdue · …`) until marked Done or Cancel (A4).
- **Tap an entry** to see `Done · Cancel`, or `Restore` if it is closed. Done entries are struck through.
- **Save state:** Add is disabled while saving, errors show "Not saved. Retry.", and the form clears only after the save succeeds (A7).
- **Phone (<480px):** grid cells flex to fit, day letters are hidden, the trigger sits below the grid, and rows stack. There is no horizontal scroll (A6).
- **Notification permission** is requested only from a user gesture, when the first timed entry is added.
- The existing QIE `recordCalendarSignal` hook is preserved.

## 4 · Files

| File | Change |
|---|---|
| `src/client/utils/calendar.ts` | **New.** Pure core: fold, stage windows, `dueAlerts`, boundaries, DTG, T-minus, time parser |
| `src/client/hooks/useCalendar.ts` | **New.** Shared state plus `addEntry` / `setStatus` / `logAlert` |
| `src/client/components/CalendarAlerts.tsx` | **New.** Global watcher, banners, OS notification, sound pips |
| `src/client/components/CalendarWidget.tsx` | Time input, NEXT readout, overdue tasks, status actions, phone layout |
| `src/client/components/Logs.tsx` | Renders `calendar_entry` (with DTG), `calendar_entry_status` and `calendar_alert` |
| `src/client/queries.ts` | `useCalendarLogs` → `/api/calendar` |
| `src/client/entries/app.tsx` | Mounts `<CalendarAlerts/>` at the root |
| `src/client/index.css` | `cal-alert-in` entry animation (respects reduced motion) |
| `src/server/routes/api.ts` | `GET /calendar`, `calendar_alert` dedupe, new events on the Log whitelist |
| `scripts/tests/test-calendar-core.ts` | **New.** Regression suite (`yarn test:calendar`) |
| `docs/calendar/*.png` | Verification screenshots |

There are no DB migrations: everything is stored in the existing `logs` table (JSONB metadata).

## 5 · Verification

| Gate | Result |
|---|---|
| Client `tsc --noEmit` | 104 errors, identical to the baseline, all in unrelated files (badges.ts, intentionEngine.ts…). **0 new** |
| Server `tsc -p tsconfig.server.json` | 0 errors |
| `yarn test:calendar` | **10/10 PASS**: parser, date validation, legacy fold, double-submit, restore, stage windows, ROUTINE window, dedupe/no-backlog, boundaries, ordering, DTG/T-minus/clock |
| `yarn build` | Client and server built |
| Browser E2E (Playwright, fake clock, TZ America/New_York, mocked API with server-equivalent dedupe) | **18/18 PASS** (see below) |

Browser checks:
- **On open:** ROUTINE fires and is logged exactly once. NEXT shows `T-20M` and the overdue legacy task is visible.
- **Alert timing:** PRIORITY fires at 14:05 and FLASH at 14:20. Each stage is logged exactly once. FLASH replaces the PRIORITY banner, and ACK dismisses it.
- **Reload:** no duplicate alert logs.
- **Adding entries:** an invalid time (`2560`) is rejected. A valid one (`0930`) is saved as `time: "09:30"`. On phone, adding an all-day entry through the below-grid trigger works.
- **Done:** marking the legacy entry Done works through its log id, and it leaves the overdue list.
- **Phone layout:** at 375px `scrollWidth ≤ 375`, both before and after adding.
- **Errors:** zero page errors.

Screenshots: `docs/calendar/2026-11-20-flash-alert.png`, `docs/calendar/2026-11-20-widget-phone.png`.

**Not verified:**
- Against a live Postgres or production backend. The server route was type-checked and reviewed, but the E2E run used a mocked API.
- Real OS notification delivery. Headless browsers do not show it.

## 6 · Known limits / next session targets

1. **Background delivery.** Alerts fire only while a LOT tab is open somewhere. Next step: a server scheduled job, or a Web Push service worker, for FLASH alerts while the app is closed.
2. **Edit entry.** Right now you change an entry by cancelling it and re-adding. Next: a `calendar_entry_update` event with a text/time patch, folded in the same core.
3. **Snooze.** A `+10M` action on PRIORITY/FLASH that re-arms the alert, using a `calendar_entry_status` variant or a new `calendar_snooze` event.
4. **Recurrence.** Daily/weekly rules (`rrule`-lite) expanded in `foldCalendar`.
5. **Server dedupe race.** Two simultaneous POSTs within milliseconds could both insert. Fix: a partial unique index on `(userId, metadata->>'entryId', metadata->>'stage') WHERE event='calendar_alert'`, which needs a migration.
6. **Per-entry lead** is supported in the data model (`lead`) but not yet exposed in the UI.

## 7 · Doctrine distilled

- **The Log is the ledger.** The calendar keeps no state of its own; folding three event streams rebuilds it.
- **Windows, not timestamps.** An alert fires because the operator is inside a window, never because a timer happened to run. This one rule removes both missed alerts and duplicates.
- **Don't fire stale alerts.** An alert that is no longer actionable is noise.
- **Every high-precedence alert needs an ACK.** FLASH and PRIORITY stay on screen until acknowledged, while ROUTINE dismisses itself.
