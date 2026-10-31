# LOT-SR-20261031-CALENDAR-01 — Calendar Widget: Timed Events + Alert Ladder

```
ID      : LOT-SR-20261031-CALENDAR-01
DATE    : 2026-10-31
CLASS   : ENGINEERING (scheduled routine)
BRANCH  : claude/dreamy-babbage-35a8yp
STATUS  : YELLOW — syntax-verified only; full tsc/build not run (node_modules absent in sandbox)
```

## INTAKE
Directive: continue Calendar widget; keep minimalist UI; make it reliable; track time; log to Log; military-grade event notifications.

## ORIENT
Baseline `CalendarWidget.tsx` (281 lines): date-only entries (note/task/call), stored as `calendar_entry` logs. No time, no completion state, no alerts, list keyed by array index.

## BUILD
### CalendarWidget.tsx
- **Optional time (HH:mm)** per entry (`<input type="time">`), stored in `metadata.time`; validated by `TIME_RE`.
- **Heartbeat**: 15 s tick + refresh on tab visibility → live countdowns, no stale "today".
- **Alert ladder** (one fire per entry per stage):
  `T-15 STANDBY` → `T-05 ARMED` → `T-00 EXECUTE` (pulse) → `MISSED` (≥5 min late, up to 24 h).
- **Catch-up**: on load, the current stage fires if never logged (late open still reports MISSED/EXECUTE).
- **Dedupe (3 layers)**: in-memory ref, `localStorage` (`lot_cal_fired_v1`, capped 200), and existing `calendar_alert` logs (survives reloads and other devices).
- **Logging**: each stage → `calendar_alert` log `[ALERT] T-05 ARMED — CALL 14:30 …`; completion → `calendar_done` log.
- **System notification**: Web Notification fired on each stage if permission granted; permission requested once, only on adding a timed entry (user gesture).
- **Completion**: tap alert line or entry text to mark done (optimistic, then log). Done entries dim + strike through.
- Stable `key`s (log id) replace index keys; list sorted by date+time; type tag shown for task/call.
- UI stays text-only/monochrome (`text-acc` opacity tiers); banner appears only while an alert is active.

### Logs.tsx
New renderer for `calendar_alert` / `calendar_done` (`CAL ALERT:` / `CAL DONE:` blocks, stage, type, text, date/time).

### api.ts
`displayableEvents` whitelist += `calendar_alert`, `calendar_done` (required or they would never appear in Log — the known whitelist-gap pattern).

## CHECKS
```
Syntax (ts.transpileModule): CalendarWidget.tsx PASS · Logs.tsx PASS
Full tsc / client build    : NOT RUN — node_modules missing in sandbox
Runtime/browser test       : NOT RUN
```

## KNOWN LIMITS / NEXT
1. Alerts only fire while the app is open (client-side). True background delivery needs Web Push + server job — next session.
2. Run `yarn install && tsc --noEmit` and click-test on first opportunity; verify `useCreateLog` `mutate` identity stability in the effect deps (guarded by dedupe refs regardless).
3. Possible: edit/delete entry, recurring events, snooze, server-side `scheduled-jobs` awareness of `calendar_done` for QIE completion signal.
4. `recordCalendarSignal` still only fires on creation; add a completion signal.
