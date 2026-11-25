# SESSION REPORT — CALENDAR WIDGET v2 · TIME · ALERTS · LOG
## Date: 2026-11-25 · Branch: claude/dreamy-babbage-nbb5a3
### Session Type: Scheduled routine — Calendar widget reliability + alert system

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                       ║
║  CALENDAR v2 · TIME TRACKING · CAL-ALERT NOTIFICATIONS          ║
║  November 25, 2026 · LOT-SR-20261125-CALENDAR-01                ║
║  STATUS: GREEN · BUILD PASS · 14/14 ENGINE CHECKS               ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. MISSION

Continue the Calendar widget on its existing foundation. Keep the minimalist UI.
Make it reliable, make it track time, log into Log, and fire military-grade event notifications.

## 2. BASE STATE (ENTERING SESSION)

`src/client/components/CalendarWidget.tsx` — 281 lines. Month grid, Note/Task/Call entries
stored as `calendar_entry` logs, upcoming list. Findings:

| # | Finding | Severity |
|---|---------|----------|
| F1 | Widget read entries from `/api/logs`, which is capped at **500 rows**. An entry scheduled weeks ahead silently vanished once 500 newer logs existed. | HIGH — data loss in UI |
| F2 | Entries were date-only — no time of day, so no way to track or alert on time. | Feature gap |
| F3 | No completion / cancel — entries could never leave the upcoming list except by date passing. | Feature gap |
| F4 | Form cleared input **before** the server confirmed; a failed POST lost the user's text silently. | MED |
| F5 | `today` computed once per render; a tab left open past midnight kept stale "upcoming". | LOW |
| F6 | React keys by array index on mutable lists. | LOW |
| F7 | `PUT /api/logs/:id` did not check log ownership (any authenticated user could edit another user's `note` log by id). | **SECURITY** — pre-existing, fixed |

## 3. ACTIONS

### 3.1 Server — `src/server/routes/api.ts`
- **NEW `GET /api/calendar`** — dedicated feed of `calendar_entry` · `calendar_status` · `calendar_alert`
  for the current user, up to 3000 rows, minimal columns. Fixes F1.
- `calendar_status` and `calendar_alert` added to `/api/logs` displayable events → they appear in Log.
- `PUT /api/logs/:id` now returns 404 unless `log.userId === req.user.id`. Fixes F7.

### 3.2 Engine — `src/client/utils/calendar.ts` (new, pure, no React)
Append-only event model, all in the user's Log:

```
calendar_entry   { date, time?: 'HH:mm', text, entryType, lead? }
calendar_status  { entryId, status: done | cancelled | active }      ← latest wins
calendar_alert   { entryId, phase: lead | zero | day, offset, ... }   ← dedupe ledger
```

Alert phases:

| Phase | Label | Fires | Window |
|-------|-------|-------|--------|
| `lead` | STANDBY | T-lead (default 10m; options T-0/5/10/15/30/60m) | until T-0 |
| `zero` | EXECUTE | T-0 | up to T+30m (late open still catches it); supersedes STANDBY |
| `day`  | BRIEF   | untimed entries on their date | after 07:00 local |

- Done / cancelled entries never alert. Stale alerts (>30m late) never spam.
- **Dedupe:** fired keys from `calendar_alert` logs (cross-device) ∪ local ledger
  (`localStorage lot.calendar.alerts.v1`, same-device, before the log round-trips).
- `normalizeTime()` accepts `9`, `930`, `09:30`, `7.45`, `21h`.
- `nextAlertAt()` lets the scheduler sleep exactly to the next boundary.

### 3.3 Widget — `src/client/components/CalendarWidget.tsx`
UI kept to the existing grammar (same grid, same type picker, same upcoming list). Additions:
- Optional **HH:MM** field beside the text field; alert-lead row appears only when a time is set.
- Selected day lists entries with **Done / Cancel** (and **Undo**), struck through when closed.
- Upcoming list shows `· HH:MM` and a live **T-mm:ss** countdown for entries within 6h today.
- `System alerts: On/Off` — opt-in browser Notification + short two-pulse tone.
- **Scheduler:** sleeps until next boundary (≤30s cap for sleep/wake + throttled tabs), re-checks on
  `visibilitychange` / `focus`.
- Writes are confirmed before the form clears; failure shows `ERR // NOT LOGGED — RETRY` (F4).
- New logs are spliced into the calendar cache immediately; `/api/logs` invalidated (F5, F6 also fixed).
- Month grid built from `new Date(y, m, 1)` (no day-overflow risk).

**CAL-ALERT toast** (portal to `body`, bottom-right, stack of 3, stays until acknowledged):

```
┌──────────────────────────────────────────┐
│ ■ CAL-ALERT // STANDBY          14:21:01 │
│ CALL                             T-08:58 │
│ Dentist — Dr. K                          │
│ WED 25 NOV 2026 · 14:30 LCL              │
│ ACK   DONE                               │
└──────────────────────────────────────────┘
```
Blinking square respects `prefers-reduced-motion`.

### 3.4 Log — `src/client/components/Logs.tsx`
- `CAL:` now shows type, time, text, date and alert lead.
- **New `CAL-STS:`** — DONE / CANCELLED / RESTORED with struck text.
- **New `CAL-ALERT:`** — STANDBY / EXECUTE / BRIEF with `T-9m` / `T-0` / `T+5m` / `DAY-OF`.

Log text examples (as written during verification):
```
[CAL-ALERT] BRIEF DAY-OF · TASK: Pay rent (2026-11-25)
[CAL-ALERT] STANDBY T-9m · CALL: Dentist — Dr. K (2026-11-25 14:30)
[SCHEDULE] call: Ops sync (Thursday, November 26, 2026 16:00)
[CAL-ALERT] EXECUTE T-0 · CALL: Dentist — Dr. K (2026-11-25 14:30)
```

## 4. VERIFICATION

| Check | Result |
|-------|--------|
| `tsc --noEmit` (client) | **0 new errors** (diffed against base; pre-existing errors in Logs.tsx/badges.ts untouched) |
| `yarn build` (client + server) | **PASS** |
| `npx tsx scripts/calendar-selfcheck.ts` | **14/14 PASS** in `America/New_York` and `Asia/Tokyo` |
| Browser run (Playwright, mocked API, fake clock 14:21 → 14:30) | STANDBY + BRIEF fire on load; EXECUTE fires at T-0 and replaces STANDBY; add-entry with `1600` → `16:00` sorted correctly; 4 correct log POSTs; no page errors |

Screenshots: `docs/calendar/2026-11-25-widget-standby.png`, `docs/calendar/2026-11-25-widget-execute.png`.

## 5. KNOWN LIMITS / NEXT

- Alerts fire only while a LOT tab is open (client-side engine). Next step: server-side job
  (scheduled-jobs.ts) writing `calendar_alert` + Web Push for closed-tab delivery — the dedupe
  ledger already understands server-written alerts.
- On ~390px phones the pre-existing month grid overflows its column (Block label column + 7×2.5em).
  Not introduced this session; candidate for a compact grid next session.
- Entries cannot be edited in place yet (cancel + re-add). Edit = new `calendar_entry` superseding by id is the planned path.
- No recurring entries yet.

## 6. FILES

```
M  src/server/routes/api.ts                 GET /api/calendar · events · PUT ownership check
A  src/client/utils/calendar.ts             engine
M  src/client/components/CalendarWidget.tsx widget + alert stack
M  src/client/components/Logs.tsx           CAL / CAL-STS / CAL-ALERT renderers
M  src/client/queries.ts                    useCalendarLogs
A  scripts/calendar-selfcheck.ts            engine checks
A  docs/calendar/*.png                      verification screenshots
A  docs/LOT-SR-20261125-CALENDAR-01.md      this report
```

```
END OF REPORT // LOT-SR-20261125-CALENDAR-01 // GREEN
```
