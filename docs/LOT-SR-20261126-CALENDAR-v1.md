# SESSION REPORT — CALENDAR WIDGET v1 · TIME-TRACK + ALERT GRID
## Date: 2026-11-26 · Branch: claude/dreamy-babbage-6e2f4s
### Session Type: Scheduled routine — Calendar widget hardening (autonomous)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                        ║
║  Calendar Widget v1 · TIME-TRACK + ALERT GRID                    ║
║  November 26, 2026 · Autonomous scheduled session                ║
║  Status: GREEN · build ✓ · typecheck Δ0 · unit 39/39 ✓           ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. MISSION

> Continue the Calendar widget on its own. Keep the UI minimal. Make the widget
> reliable: it tracks time, writes to Log, and sends stylish military-grade
> event notifications. Push a full .MD report after each session.

**Base state:** `CalendarWidget.tsx` (281 lines). It had a month grid, Note/Task/Call
entry, and a list of upcoming dates. Entries were written through generic `POST /api/logs`
as `calendar_entry`. The widget had no time of day, no alerts, no way to close an entry,
and the problems listed in §2.

---

## 2. RELIABILITY DEFECTS FOUND IN THE FOUNDATION

| # | Defect | Impact | Fix |
|---|--------|--------|-----|
| D1 | Entries were read from `/api/logs`, which is capped at **500 rows DESC**. Background jobs write many log rows, so after enough activity, future entries dropped out of that window. | Scheduled dates **silently disappeared** from the widget. | New dedicated `GET /api/calendar` stream (only calendar events, up to 3000 rows). |
| D2 | `getMonthWeeks` built months with `dayjs().year(y).month(m)`. On the 29th–31st this overflows (e.g. Jan 31 → "Feb" → Mar 3). | On those days the wrong month grid was shown. | The month is now built from an explicit `YYYY-MM-01`. Regression test added. |
| D3 | Entries could not be completed or removed. | The Upcoming list only grew, and the System `Next:` line showed stale items. | Added an append-only `calendar_status` event (done / cancelled / open). The latest status wins. |
| D4 | No server validation of date, type or length. | Malformed rows got into Log. | `POST /api/calendar/entries` validates date (`YYYY-MM-DD`), time (`HH:mm`), type, and caps text at 280 characters. |
| D5 | React `key={i}` on list rows. | Rows could be reconciled wrongly after a refetch. | Rows are keyed by log id. |
| D6 | The add form cleared before the save was confirmed. | A failed save lost the user's text. | The form clears only on success. On error it shows `Not saved. Retry.` |

---

## 3. WHAT SHIPPED

### 3.1 Data model (append-only, everything lands in Log)

```
calendar_entry   { date: YYYY-MM-DD, time: HH:mm | null, text, entryType }
calendar_status  { entryId, status: done | cancelled | open, …snapshot }
calendar_alert   { entryId, phase: T-15 | T-0 | DAY, alertKey, firedAt, …snapshot }
```

Older `calendar_entry` rows (no `time`) still load unchanged as all-day entries.

### 3.2 Server — `src/server/routes/api.ts`

| Route | Purpose |
|-------|---------|
| `GET  /api/calendar` | Calendar stream: entries + status + alerts |
| `POST /api/calendar/entries` | Validated entry create, writes `[SCHEDULE] …` to Log |
| `POST /api/calendar/status` | Done / Remove / Reopen, with an ownership check |
| `POST /api/calendar/alert` | **Idempotent** alert write: one row per `(entry, phase)` across all tabs and devices |

`calendar_status` and `calendar_alert` were added to the `/api/logs` displayable set, so
they show up in the Log tab. All entry IDs are checked against the UUID format first, so a
bad ID returns 400 instead of a database error.

### 3.3 Core logic — `src/client/utils/calendar.ts` (new, pure)

- `foldCalendarLogs` reduces the raw stream to `entries[]` plus a `fired` ledger.
- `dueAlerts(entries, now, fired)` is the alert schedule:
  - **Timed entries:** `T-15` from 15 minutes before, `T-0` at the mark. If the app opens
    late, `T-0` still fires for up to 2 hours. A late `T-0` replaces `T-15`, so you never get
    a stale pre-alert.
  - **All-day entries:** `DAY` at 09:00 local on the date, or on the first open after that.
  - Entries logged after their own due time (retroactive entries) are recorded but never alert.
  - Entries marked done or removed never alert.
- `parseTimeInput` accepts `1430`, `930`, `14:30`, `14`, `9am`, `9:15pm`, `1430H`, and
  rejects anything out of range.
- `formatCountdown` → `T-02:14:05` / `T-3D 04H` / `T+00:05:00`. `militaryTime` → `1430H`.
- `entryRef(id)` gives a 4-character reference (`#A3F2`) shown on the widget, alert and Log rows.

### 3.4 Alert engine — `src/client/components/CalendarAlerts.tsx` (new)

- **Mounted at the App root**, not inside System. System unmounts when its tab is inactive,
  so alerts now fire from any tab.
- It checks every 15 seconds and right away when the tab becomes visible. It waits for the
  server ledger to load before it fires anything.
- Three layers stop duplicate alerts:
  1. server `calendar_alert` rows, shared across devices;
  2. `localStorage` ledger, shared across tabs (every access wrapped in try/catch);
  3. an in-memory in-flight set.
- A failed write retries on the next tick only for network or 5xx errors. A 4xx is final,
  so a deleted entry can't cause a retry loop.
- If the tab is in the background and permission was granted, it also raises a system
  `Notification`. Permission is requested only from a user action: adding a timed entry.

**Alert card** (top-right, full width on phones, stays until acknowledged, max 3 shown + `+N queued`):

```
┌──────────────────────────────────────┐
│ ■ CAL/ALERT · T-0 · NOW        #A3F2 │   ■ blinks on T-0 (steps, not fade)
│ CALL                                 │
│ Sync with ops                        │
│ 1430H · THU 26 NOV 2026   T+00:00:12 │   live T± readout, 1s tick
│ [ ACK ]   [ DONE ]                   │   DONE writes calendar_status
└──────────────────────────────────────┘
```

The card uses only theme tokens (`text-acc`, `border-acc/*`, `--base-color`), so it follows
every LOT theme. It has `role="alert"` and `aria-live="assertive"`, and respects
`prefers-reduced-motion`.

### 3.5 Widget — `src/client/components/CalendarWidget.tsx` (still minimal)

- **Next line:** `Next T-02:14:05 · Call · Sync with ops`. It ticks every second when the
  next mark is under 24 hours away, otherwise every 30 seconds, and pauses while the tab is
  hidden. All-day entries show `TODAY` / `D-n`.
- **Add form:** the same Note / Task / Call selector, plus an optional `HHMM` time field and
  a hint line (`Thu, November 26 · time optional · alert T-15 and T-0`).
- **Upcoming list:** shows `Today 1430H`. Open overdue items from the last 3 days stay
  dimmed with `OVERDUE ·`. Tap a row to show `Done` / `Remove`.
- **Day view:** each entry shows `1430H` or `DAY`. Done items are struck through.
- Grid dots now mark only dates with *open* entries.
- Loading, error (`Calendar offline. Retrying.`) and empty states.

### 3.6 Log tab + System

- `CAL:` rows now show the text, `#REF`, date and `1430H` / `DAY`.
- New `CAL/ALRT:` and `CAL/STAT:` row renderers.
- The System `Next:` line now uses the calendar stream, ignores closed entries, and shows the time.

---

## 4. VERIFICATION

| Check | Result |
|-------|--------|
| `yarn client:build` | ✓ Client build completed (only the existing duplicate-key warnings in `badges.ts`) |
| `tsc --project tsconfig.server.json` | ✓ 0 errors |
| `tsc -p tsconfig.json` (client) | Δ0: same 104 errors as before; **none in the calendar files** |
| `yarn test:calendar` (new) | ✓ **39 / 39** in `America/Los_Angeles` and `Asia/Tokyo` |

The unit tests cover:
- time parsing edge cases (including 12am/12pm and out-of-range values);
- countdown formats;
- the Feb-2027 month-overflow regression;
- folding (invalid dates dropped, latest status wins, bad times become all-day);
- the alert windows: before, T-15, T-15 already fired, T-0, grace expired, DAY at 08:59 vs
  09:00, and retroactive entries;
- overdue, upcoming and next selection.

**Not verified this session:** no end-to-end run against a live DB/server. The container
has no Postgres, and nobody was present to approve a deploy. The alert card and widget were
type-checked and bundled, but not screenshotted in the running app.

---

## 5. FILES

```
NEW  src/client/utils/calendar.ts            300  pure core: fold · schedule · parse · format
NEW  src/client/components/CalendarAlerts.tsx 263  app-level alert engine + alert card
NEW  scripts/tests/test-calendar.ts           ~100 deterministic unit checks
MOD  src/client/components/CalendarWidget.tsx      time field · countdown · done/remove · fixes
MOD  src/server/routes/api.ts                      4 calendar routes · displayable events
MOD  src/client/queries.ts                         useCalendar · create · status · alert
MOD  src/client/entries/app.tsx                    mount <CalendarAlerts/>
MOD  src/client/components/Logs.tsx                CAL / CAL/ALRT / CAL/STAT renderers
MOD  src/client/components/System.tsx              Next: from calendar stream + time
MOD  package.json                                  test:calendar script
```

---

## 6. NEXT SESSION — QUEUED

1. **Server-side alert sweep** (scheduled job): write `calendar_alert` for due entries even
   when no client is open, with web-push delivery. Today alerts need an open LOT tab, or a
   backgrounded tab with notification permission.
2. **Recurring entries** (daily / weekly / monthly) as a `repeat` field on `calendar_entry`.
3. **Edit / reschedule** an entry (an append-only `calendar_status: rescheduled` with a new date and time).
4. **Configurable lead time** (T-5 / T-15 / T-60) per entry.
5. **Week strip** under the Next line: 7 compact day cells with open-entry markers.
6. **Live-app visual check**: Playwright screenshots of the widget and alert card in light and dark themes.

---

```
END OF REPORT · LOT-SR-20261126-CALENDAR-v1 · GREEN
```
