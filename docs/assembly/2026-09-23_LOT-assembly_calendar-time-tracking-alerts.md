<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Self-Assembly Log — 2026-09-23
## Calendar Widget · Time Tracking · Military-Grade Due Alerts

**Session:** Autonomous Calendar continuation
**Date:** 2026-09-23
**Branch:** claude/dreamy-babbage-sum7qw
**Status:** DEPLOYED

---

### Directive

> Continue the work on the Calendar widget independently. Keep the minimalist UI. The foundation for the widget is already there. Make a reliable Calendar widget that tracks time and logs into Log with stylish military-grade event notifications.

This was a scheduled, unattended run — no live operator. Scope was held to the Calendar
widget and its Log integration; the broader QIE/self-assembly versioning ritual
(SESSION_REPORTS array, LOT_SYSTEMS_BRIEF.md version bump, LOT-LEDGER.md) was left
untouched since it was not invoked and the request named a single, bounded feature.

---

### Sources Read

- `src/client/components/CalendarWidget.tsx` — existing foundation: month grid, date
  selection, note/task/call entries, upcoming list, all wired to Log via `useCreateLog`
- `src/client/components/Logs.tsx` — `calendar_entry` handler, military log handler
  conventions (`Block label="CODE:"`, uppercase tracking-widest, no prose)
- `src/client/components/EvolutionMilestoneToast.tsx` — the one existing in-app toast
  pattern (fixed-position, CSS keyframe fade, auto-hide)
- `src/client/stores/intentionEngine.ts` — `recordCalendarSignal()`, Pattern 26
  `calendar-gap` (unchanged, still fed by `calendar_entry` signals)
- `src/server/routes/api.ts` — `GET /logs` `displayableEvents` allowlist (log events
  outside this list are stored but never rendered)

### Gap Found

The Calendar foundation only tracked a **date**, never a **time of day** — every entry
was effectively all-day. There was no mechanism to notify the operator when a scheduled
item actually came due, and no record of that moment in Log. "Track time" and "events
notifications" from the directive were both unaddressed.

---

### What Was Built

#### 1. Time-of-day on calendar entries — `CalendarWidget.tsx`

`CalendarEntry` gained an optional `time: string | null` (HH:mm) alongside `date`. A
new `entryMoment()` helper produces a sortable `YYYY-MM-DDTHH:mm` key so timed and
all-day entries interleave correctly:

```typescript
type CalendarEntry = { date: string; time: string | null; text: string; type: EntryType }

function entryMoment(e: Pick<CalendarEntry, 'date' | 'time'>): string {
  return `${e.date}T${e.time || '00:00'}`
}
```

A native `<input type="time">` sits next to the existing text field in the add-entry
row. Time is optional — leaving it blank keeps the old all-day behavior exactly as it
was. `handleAddEntry` persists `time` into `metadata` and folds it into the log text,
e.g. `[SCHEDULE] call: Standup (Monday, September 28, 2026 09:00)`.

#### 2. Live T-minus countdown — `CalendarWidget.tsx`

A one-minute ticker (`now` state + `setInterval`) drives:
- `upcomingEntries`: timed entries drop off the list once their moment passes; all-day
  entries stay visible for the full day (unchanged prior behavior for untimed entries).
- `countdownLabel`: for the nearest **timed** entry only, `dayjs(...).from(now)` via
  the existing `relativeTime` plugin, rendered as `NEXT · T-MINUS IN 3 HOURS` in the
  same uppercase/tracking-widest military voice as the rest of the widget. All-day
  entries don't produce a countdown — there's no precise moment to count down to.

This is the "reliable" and "track time" half of the directive: the widget now has a
live notion of *when*, not just *what day*.

#### 3. `CalendarAlertToast.tsx` — new component

A dedicated toast that watches timed entries and fires the moment one comes due:

- Polls every 20s (paused when the tab is hidden or the `system` route isn't active,
  matching the guard pattern already used by `EvolutionMilestoneToast`), plus an
  immediate check on mount and on `visibilitychange` so a backgrounded tab catches up
  the instant it's foregrounded.
- Processes **one** newly-due entry per tick, so a long-closed tab can't burst-fire a
  backlog on reopen.
- Persists fired keys to `localStorage` (`lot_calendar_alerts_fired`, capped at 200)
  so alerts never repeat across reloads.
- Always writes a `calendar_alert` Log entry when an entry comes due — reliability
  guarantee: the record exists even if the toast is missed (tab closed, alert already
  auto-dismissed).
- Only *surfaces* the toast if the entry became due within the last 5 minutes, so
  reopening the app hours later silently backfills Log without a wall of stale toasts.
- Toast styling: fixed top-right, monospace, bordered, `[ALERT] <TYPE>` bracket-code
  header in the same voice as `[SCHEDULE]` entry logging, 8s auto-dismiss with a CSS
  keyframe fade (same mechanism as the milestone toast, distinct position so the two
  never collide).

Mounted in `System.tsx` next to `<CalendarWidget />` inside the existing `Calendar`
`WidgetErrorBoundary`.

#### 4. `calendar_alert` Log handler — `Logs.tsx`

New branch alongside the existing `calendar_entry` handler, same military `Block`
convention:

```
Block label="CAL-ALERT:"
  <TYPE> · DUE
  <date> <time>
```

`calendar_entry`'s existing handler was also extended to show `time` when present.

#### 5. Server allowlist — `src/server/routes/api.ts`

`GET /logs` filters returned rows through a `displayableEvents` allowlist. Without
adding `calendar_alert` to it, alert logs would write to the database successfully but
never render anywhere — a silent dead end. Added:

```typescript
// Calendar due-alert — fired when a timed calendar_entry reaches its moment
'calendar_alert',
```

---

### File Changes

| File | Change |
|------|--------|
| `src/client/components/CalendarWidget.tsx` | +`time` field on entries · time input · T-minus countdown · timed entries drop off when past |
| `src/client/components/CalendarAlertToast.tsx` | **new** — due-alert watcher, military toast, `calendar_alert` logging |
| `src/client/components/Logs.tsx` | +`calendar_alert` handler · `calendar_entry` handler shows time |
| `src/client/components/System.tsx` | +mount `<CalendarAlertToast />` beside `<CalendarWidget />` |
| `src/server/routes/api.ts` | +`calendar_alert` to `displayableEvents` allowlist |

---

### Test Results

**Build:**
- `npx tsc --noEmit -p tsconfig.json` — zero new errors. Diffed against the
  pre-change baseline (`git stash` / `git stash pop`) to confirm every remaining
  error in `Logs.tsx` and `System.tsx` is pre-existing (identical messages, only
  line numbers shifted by the inserted code).
- `yarn run client:js:build` — succeeds. Only pre-existing `badges.ts` duplicate-key
  warnings, unrelated to this change.
- `npx tsc --project tsconfig.server.json --noEmit` — no errors touching `api.ts`.

**Functional reasoning (no live browser session in this unattended run):**
- All-day entries (no time set): behavior is byte-for-byte unchanged from before —
  `entryMoment()` falls back to `00:00` only for sort order, and the upcoming-list
  filter still uses `date >= today` for untimed entries.
- Timed entry due-alert: fires once (localStorage dedupe), writes Log unconditionally,
  only shows the toast within a 5-minute freshness window.
- Countdown label only renders when the *next* upcoming entry has a time — no
  "T-MINUS 15 HOURS AGO" nonsense for all-day tasks.

**Regression:**
- `calendar_entry` signal shape (`entryType`, `date`) into `recordCalendarSignal` /
  Pattern 26 (`calendar-gap`) is untouched — `time` is additive metadata only.
- Existing military log handler conventions preserved (`Block label`, uppercase
  tracking-widest, tabular-nums for numeric/date fields, no prose narration).

---

### Deploy Confirmation

Committed to `claude/dreamy-babbage-sum7qw`, pushed to origin.

---

### What Was Deferred

- Editing or deleting existing calendar entries (currently append-only, matching the
  original foundation's scope)
- Recurring events
- A settings toggle to disable due-alert toasts (currently always-on when a timed
  entry exists, same as the existing hourly chime pattern in `TimeWidget.tsx`)

**Why deferred:** none of these were named in the directive; the ask was specifically
time tracking + reliable due notifications logged to Log, which this session delivers.

---

### Next Session Recommendation

Surface the T-minus countdown for the next timed entry in the System header/context
panel (mirrors the still-deferred "Temporal Planner in System header" item from the
2026-04-29 Calendar session), and consider feeding `calendar_alert` into the QIE as a
new signal once a real usage pattern for it is observed.
