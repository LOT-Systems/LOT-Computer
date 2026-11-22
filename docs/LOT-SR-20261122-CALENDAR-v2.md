# LOT-SR-20261122 · CALENDAR WIDGET v2 · TIME-TRACKING + ALERT ORDERS

```
┌──────────────────────────────────────────────────────────────────────┐
│ SESSION REPORT                     DTG 222355J NOV 26                │
│ UNIT       LOT® System · Calendar module                             │
│ BRANCH     claude/dreamy-babbage-36qafj                              │
│ MODE       Scheduled routine · autonomous                            │
│ STATUS     ■ GREEN — builds pass · 20/20 engine tests · 0 new TS err │
└──────────────────────────────────────────────────────────────────────┘
```

## 1 · MISSION

Make the Calendar widget reliable: track time, log every action to the Log,
and raise minimalist, military-grade event notifications. Keep the existing
minimalist UI.

## 2 · SITREP — WHAT WAS THERE (BEFORE)

| Area | Finding | Severity |
|---|---|---|
| Data loss | Entries read from `GET /api/logs`, which caps at **500 rows**. An entry scheduled weeks ahead silently vanished once the user produced 500 newer logs. | HIGH |
| Month grid | `dayjs().year(y).month(m)` on the 31st overflows short months (viewing Feb on Jan 31 rendered **March**). | HIGH |
| Time | Entries were date-only. No time of day, so nothing could be "tracked". | MED |
| Lifecycle | No done / cancel. Tasks lived forever in "upcoming", past items disappeared without a trace. | MED |
| Notifications | None. | MED |
| Input | Text cleared before the save succeeded (lost on network error); no validation; `key={index}` rows. | LOW |
| Log view | Calendar logs fell through to the generic `LOG:` block. | LOW |

## 3 · ACTIONS — WHAT SHIPPED

### 3.1 Calendar engine — `src/shared/utils/calendar.ts` (new, pure, no deps)
Single source of truth = the Log. Three append-only events:

| Event | Metadata | Meaning |
|---|---|---|
| `calendar_entry` | `date, time?, text, entryType` | An entry (legacy entries with no `time` still work) |
| `calendar_status` | `entryId, status` | `done` / `cancelled` / `open` — latest wins |
| `calendar_alert` | `entryId, stage, …snapshot` | A fired notification (permanent record) |

Functions: `parseTime` (accepts `14:30`, `1430`, `9`, `2:30pm`, `12am`…),
`isDateKey`, `fromDateKey` (local — never `new Date('YYYY-MM-DD')`, which is UTC),
`getMonthGrid` (overflow-proof, Mon-first), `buildEntries`, `dueAlerts`,
`isOverdue`, `agenda`, `msUntilNextBoundary`, `militaryDTG`, `entryDTG`,
`zoneLetter` (NATO zone letters), `countdown` (`T-00:15`, `T+00:05`, `T-3D`).
Shared by client **and** server.

### 3.2 Alert doctrine

| Stage | Order | Window | Applies to |
|---|---|---|---|
| `T-15` | WARNING ORDER | `[t−15m, t)` | timed entries |
| `T-0` | EXECUTE | `[t, t+60m)` grace for sleeping laptops / closed tabs | timed entries |
| `DAY` | DAY ORDER | entry date, from 08:00 local | untimed entries |

- Windows are exclusive → one entry never raises two alerts at once.
- A later stage supersedes the earlier toast for the same entry.
- Past the grace window nothing fires late (no stale spam); open tasks/calls show **OVERDUE** in the agenda instead of disappearing.

### 3.3 Server — `src/server/routes/api.ts`
- `GET /api/calendar` — all entries + statuses (5 000 cap) and last 3 days of alerts. Fixes the 500-row data loss.
- `POST /api/calendar/entries` — validated (real date, valid time, 1–280 chars, known type). Writes canonical Log text: `[CAL] SCHEDULED · CALL · 231430J NOV 26 · Call Dmitri`.
- `POST /api/calendar/status` — ownership-checked lifecycle change → `[CAL] COMPLETE · TASK · …` / `SCRUBBED` / `REOPENED`.
- `POST /api/calendar/alerts` — **idempotent per (entry, stage)**; returns `{ created }`. Only the call that creates the log raises the on-screen order, so reloads, a second tab, or a second device never double-fire.
- `calendar_status` + `calendar_alert` added to the `/logs` displayable whitelist.
- Generated SQL verified (JSONB `#>>` match, `OR` window).

### 3.4 Client
- **`CalendarAlertCenter.tsx` (new)** — mounted once in `app.tsx` so alerts fire on every tab, not just System. Ticks every 15 s, on focus/visibility, and exactly at the next boundary. Retries after 60 s if offline. Optional two-tone square-wave cue only when the user's Sound toggle is on. Optional desktop notification (opt-in). Honors `prefers-reduced-motion`.
- **`useCalendarEntries.ts` (new)** — shared hook (`useCalendar` query → derived entries + fired set), `useNow` ticker, desktop-alert preference.
- **`CalendarWidget.tsx`** — same layout and vocabulary (`Add date`, grid `M23`, `Note / Task / Call`). Added: optional `HH:MM` time field, inline validation (`Time: HH:MM`), save-then-clear, `Today` jump, entry-day dot, live `T-` countdown for today, `OVERDUE` tag, tap a row → `Done · Scrub` / `Reopen`, `Desktop alerts: On/Off`, offline retry line. Rows wrap at phone width.
- **`System.tsx`** — `Next:` panel now uses the engine (skips done/scrubbed, shows time).
- **`Logs.tsx`** — `CAL:` block for all three events:
  ```
  CAL:  ■ EXECUTE · T-0
        CALL · 23 NOV 26 1430J
        Call Dmitri — contract review
  ```

### 3.5 Notification design (minimal, military)
```
┌────────────────────────────────────┐
│ ■ EXECUTE                      T-0 │   ■ blinks on T-0 (steps, 1 s)
│ CALL · 1430J · T-00:00             │   full-strength border on T-0
│ Call Dmitri — contract review      │
│ Ack   Complete       231430U NOV 26│   DTG with NATO zone letter
└────────────────────────────────────┘
```
Theme tokens only (`bg-bac`, `text-acc`, `border-acc/40`), bottom-right on
desktop, full width on phones, max 3 stacked (`+N queued`), stays until
acknowledged.

Screenshots: `docs/technical/calendar/cal-v2-agenda-alerts.png`,
`cal-v2-execute.png`, `cal-v2-mobile.png`.

## 4 · VERIFICATION

| Check | Result |
|---|---|
| `yarn test:calendar` (new, 20 tests) | ✓ under UTC, America/Los_Angeles, Asia/Kolkata, Pacific/Auckland |
| Client `tsc --noEmit` | 104 errors = baseline 104; **0 new** (all pre-existing, mostly `badges.ts`) |
| Server `tsc` | clean |
| `yarn build` (client + server) | ✓ |
| Browser harness (Playwright, mocked API, frozen clock 14:15 PST) | DAY + T-15 fired once each; invalid time rejected; entry with `930` saved as `09:30`; clock +15 min → EXECUTE superseded T-15; Complete posted `status: done` and removed the row |
| Phone width 390 px | no horizontal overflow |

Not verified: end-to-end against a live Postgres + auth session (no DB in the
routine container). The SQL was checked via the Sequelize query generator.

## 5 · RISKS / NOTES
- Alerts fire only while some LOT tab is open (client scheduler). A server-side push channel is the next step for closed-app delivery.
- Times are stored as local wall-clock (`J` zone). If the user travels across zones the entry keeps its wall time — intended for a personal planner.
- Entries are not editable in place yet (scrub + re-add).

## 6 · NEXT SESSION — PROPOSED ORDERS
1. Edit / reschedule an entry (`calendar_status` → `rescheduled` with new date/time).
2. Recurrence (`daily`, `weekdays`, `weekly`) expanded by the engine.
3. Server-side alert sweep (scheduled job) + Web Push for closed-app delivery.
4. Per-entry lead time (T-5 / T-15 / T-60).
5. Week strip in the collapsed widget (`M23· T24 W25 …`) for at-a-glance load.

## 7 · FILES

```
NEW  src/shared/utils/calendar.ts
NEW  src/client/hooks/useCalendarEntries.ts
NEW  src/client/components/CalendarAlertCenter.tsx
NEW  scripts/tests/test-calendar-engine.ts
NEW  docs/technical/calendar/*.png
MOD  src/client/components/CalendarWidget.tsx
MOD  src/client/components/System.tsx
MOD  src/client/components/Logs.tsx
MOD  src/client/entries/app.tsx
MOD  src/client/queries.ts
MOD  src/server/routes/api.ts
MOD  package.json   (+ test:calendar)
```

```
END OF REPORT · LOT-SR-20261122-CALENDAR-v2 · ■ GREEN
```
