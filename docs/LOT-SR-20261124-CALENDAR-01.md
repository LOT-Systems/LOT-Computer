# SESSION REPORT: CALENDAR WIDGET v2 (TIME, ALERTS, LOG)
## Date: 2026-11-24 · Branch: `claude/dreamy-babbage-dqi63l`
### Session Type: Scheduled autonomous routine. Calendar widget reliability and notifications

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION · SESSION REPORT                        ║
║  CALENDAR v2 · TIME-TRACKED · LOGGED · ALERTING                  ║
║  November 24, 2026                                               ║
║  STATUS: GREEN · build ✓ · engine tests 11/11 ✓ · harness ✓      ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. MISSION

> Continue the Calendar widget independently. Keep the minimalist UI. Make a reliable
> Calendar widget that tracks time and logs into Log, with military-grade event
> notifications.

**State at the start of the session:** `CalendarWidget.tsx` (281 lines) was a date-only planner. It wrote `calendar_entry`
logs and read them back from `/api/logs`. It had no times, no alerts, and no way to complete
or remove an entry.

---

## 2. DEFECTS FOUND IN THE FOUNDATION

| # | Defect | Impact | Fix |
|---|--------|--------|-----|
| D1 | Entries were read from `/api/logs`, which is capped at **500 rows** and also holds notes, check-ins and system events | Long-range entries silently **disappeared** once a user had logged 500 other things | New dedicated `GET /api/calendar` endpoint (all entries and statuses, up to 5000) |
| D2 | `getMonthWeeks` used `dayjs().year(y).month(m)` | On the 29th–31st, moving to a shorter month overflowed (for example, Jan 31 → "Feb" showed March) | The grid is now built from `viewMonth.startOf('month')`, so it cannot overflow. Covered by a test |
| D3 | Entries had no time of day | The widget could not track time | Optional `HH:MM` (24h) field that accepts loose input (`930`, `0930`, `9:30`, `21`) |
| D4 | Entries could not be completed or removed | The upcoming list grew forever | Done / Drop / Undo, recorded as append-only `calendar_status` logs |
| D5 | A failed save cleared the input | Typed text was lost | The draft is restored and "Not saved, retry" is shown |
| D6 | The Log view showed only the type and date for a `calendar_entry` | The record had no content | The renderer now shows the text, time and alert lead |

---

## 3. WHAT WAS BUILT

### 3.1 Storage model (append-only, all in Log)

```
calendar_entry   { date, time|null, text, entryType, leadMin }      ← entry (id = log id)
calendar_status  { entryId, status: done|dropped|active }           ← latest wins
calendar_alert   { entryId, alertKey, lead, late, date, time, ... } ← fired-alert receipt
```

There is no schema migration. Every state change is a Log row, so the full history can be audited
in the Log tab. `calendar_status` and `calendar_alert` were added to the `/api/logs` display list.

### 3.2 Engine: `src/client/utils/calendar.ts` (pure, no side effects)

- `buildEntries(logs)` validates the records, normalises type, time and lead, applies the latest status, and sorts the entries
- `alertsFor(entry)`: a timed entry gets alerts at **T-lead** and **T-0**. An all-day entry gets one briefing at **0900 local**
- `dueAlerts(entries, now, fired)`:
  - Alerts missed while the app was closed are still delivered, marked **LATE**, for up to 6h.
  - When several windows are overdue, only the most recent fires, so a T-15 never shows after the event has started.
  - Each alert fires once.
- `nextFireAt` gives the exact time of the next alert, so the scheduler sleeps until then instead of polling every second
- `formatTMinus` gives the military readout: `T-14:05` · `T-02:14:05` · `T-3D 04H` · `T+05:00`
- `getMonthWeeks` builds a Monday-first grid that cannot overflow

### 3.3 Scheduler and notice: `src/client/components/CalendarAlerts.tsx`

This component is mounted at the **app root** inside a `WidgetErrorBoundary`. It is deliberately not inside the System
tab, because that tab unmounts when inactive. Alerts therefore fire on every route.

Pipeline for each alert:
1. **Claim** in localStorage, so the alert fires in only one browser tab
2. **Log** a `calendar_alert` row, so other devices can skip it and a record is kept
3. **Notice** on screen until it is acknowledged
4. **Pips**: two quiet 1046 Hz square-wave beeps
5. **System Notification**, only when the tab is hidden and permission has been granted. Permission is requested only when the user adds a timed entry, which counts as a user gesture

Timers in background tabs are throttled, so the scheduler re-checks as soon as the tab becomes visible again.
Snooze +5 is persisted in localStorage, so it survives a reload. A snoozed alert is not shown again if the entry was
completed or dropped in the meantime.

The notice:

```
┌────────────────────────────────────────────┐
│ ■ PRIORITY ALERT                  2351:39  │   ■ = 1 Hz beacon (stepped blink)
│ CALL · 0006H                      T-14:20  │   live T-minus, ticks each second
│ Ops standup — bridge line                  │
│ ACK   SNOOZE +5                            │
└────────────────────────────────────────────┘
  headers: PRIORITY ALERT / LATE ALERT / EVENT LIVE
```

It uses the theme tokens `bg-bac` and `border-acc/40`, so it follows every LOT theme. It enters with a 4-step clip-path animation,
and `prefers-reduced-motion` turns both animations off.

### 3.4 Widget UI (minimalist layout unchanged)

The month grid (`M23 T24 W25 …`), the `<— November, 2026 —>` navigation, the "Note / Task / Call"
affordance and the upcoming list all keep their original look. Additions:

- A **`NEXT · CALL   T-14:18`** line counting down to the next event
- An `HH:MM` field next to the text input. Once a valid time is entered, the lead selector **`T-0 T-5 T-15 T-1H`** appears
- A list for the selected day with each entry's time (`0700 Morning run`) and the `Done  Drop` / `Undo` controls
- Upcoming rows show the 24h time in 40% accent, and the year only when it is not the current year
- The button reads "Close" while the calendar is open

### 3.5 Log view entries

```
CAL:    TASK / Brief the team / 2026-11-25 · 1630H · T-15
ALERT:  T-15 · CALL · 0006H / Ops standup — bridge line
CAL:    COMPLETE / TASK · File quarterly report      (SCRUBBED / REINSTATED)
```

Log text, as it reads in the plain view:
`[SCHEDULE] TASK · Brief the team · WED 25 NOV 2026 1630H` ·
`[ALERT] T-15 · CALL · Ops standup — bridge line · 0006H` · `[COMPLETE] TASK · File quarterly report`

---

## 4. VERIFICATION

| Check | Result |
|-------|--------|
| `yarn build` (client esbuild + PostCSS + server tsc) | ✅ EXIT 0 |
| `tsc --noEmit` | ✅ no new errors in touched files. The repo baseline already has 107 errors, unrelated (badges.ts, app.tsx typing); after this session it has 104 |
| `yarn test:calendar` (new) | ✅ **11/11** engine tests pass |
| Browser harness (Playwright, mocked `/api/calendar` and `/api/logs`) at 900px and 390px | ✅ alert fired, logged and acknowledged; entry created with time and T-15; Done wrote a `calendar_status` row; **0 page errors** |

The harness caught one bug before shipping. `nextEvent` followed list order, which puts all-day entries first,
so it locked onto an all-day entry briefed at 0900 instead of a 0006 call earlier the same day. It now picks the
earliest event. A regression test was added.

Tests cover status reduction, alert windows, firing each alert once, delivering only the latest overdue window, the grace window cut-off,
`nextFireAt`, filtering of upcoming entries, T-minus formats, time-input parsing, and month-grid overflow.

---

## 5. FILES

| File | Change |
|------|--------|
| `src/client/utils/calendar.ts` | **new**: pure engine |
| `src/client/components/CalendarAlerts.tsx` | **new**: global scheduler and military notice |
| `src/client/components/CalendarWidget.tsx` | rewritten on the engine: time, lead, countdown, Done/Drop |
| `src/server/routes/api.ts` | `GET /api/calendar`; `calendar_alert` and `calendar_status` made displayable |
| `src/client/queries.ts` | `useCalendar` (60s stale, 5 min refetch, refetch on focus) |
| `src/client/entries/app.tsx` | mounts `<CalendarAlerts/>` at the root, inside an error boundary |
| `src/client/components/Logs.tsx` | renderers for CAL / ALERT / status |
| `src/client/index.css` | `cal-alert-in` and `cal-alert-beacon` animations (reduced-motion safe) |
| `scripts/tests/test-calendar-engine.ts`, `package.json` | `yarn test:calendar` |

---

## 6. KNOWN LIMITS / NEXT SORTIE

1. **Alerts need an open tab.** Nothing fires if LOT is closed everywhere. On next open, alerts from the last 6h are delivered as LATE. The next step is server-side push: a scheduled job plus Web Push through the service worker.
2. **Two devices can both fire an alert.** The receipt from one device reaches the other on its next refetch, which happens at most 5 min later or on focus. Within that window both devices may show the same alert. Pushing receipts over SSE `sync` would close the gap.
3. **Entries cannot be edited yet.** To change one, drop it and add it again. An edit could be an append-only `calendar_entry` with `supersedes`.
4. **No recurring entries** (daily, weekly). The engine's `alertsFor` is the place to add them.
5. Times use the device's local time zone. An event created in one time zone fires at the same wall-clock time in another.
6. The pips always play. A mute toggle could follow `isTimeChimeEnabled` or have its own persistent atom.

---

```
END OF REPORT · LOT-SR-20261124-CALENDAR-01 · GREEN
```
