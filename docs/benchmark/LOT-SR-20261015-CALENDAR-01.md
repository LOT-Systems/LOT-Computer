================================================================================
LOT SYSTEMS / SESSION REPORT
DOCUMENT: LOT-SR-20261015-CALENDAR-01
TITLE:    Calendar widget — time tracking, T-15/T-00 alerts, Log integration
CLASS:    RESTRICTED // S-2 EYES
BRANCH:   claude/dreamy-babbage-07oyo7
DATE:     2026-10-15
RESULT:   AMBER — syntax-verified only; full build NOT run (see 03)
================================================================================

01 // BASELINE
CalendarWidget: month grid, note/task/call entries as `calendar_entry` logs.
No time-of-day, no alerts, no completion state.

02 // CHANGES
CalendarWidget.tsx
  - Optional HH:mm per entry (metadata.time); all-day entries alert 08:00 local.
  - Live clock + T-minus countdown to next entry (ticks 1s, paused when tab hidden).
  - Alert stages: STANDBY T-15 (timed only), EXECUTE T-00. Only latest due stage
    fires per entry; stages older than 6h are not fired retroactively.
  - Each alert writes `calendar_alert` log once. Dedupe: server log ledger +
    in-memory ref + localStorage guard (no duplicate on refetch/reload/multi-tab race
    narrowed, not eliminated).
  - OS Notification when permission granted (requested once, on adding a timed entry).
  - Inline banner `EXECUTE // T-00 // 14:30 // call // text` with [ack] / [done].
  - [done] writes `calendar_done` log; done entries leave the upcoming list.
api.ts:  `calendar_alert`, `calendar_done` added to GET /logs displayable events.
Logs.tsx: renders both new events (CAL: block); calendar_entry shows time.
UI kept minimal: no new panels, tokens/classes reuse existing acc palette.

03 // VERIFICATION
node_modules absent and npm registry returns 403 in this sandbox -> `yarn build`
could not run. Transpile syntax check on all 3 touched files: PASS.
Typecheck/build: NOT RUN. Run `yarn build` before shipping.

04 // KNOWN LIMITS / NEXT
- Alerts fire only while the app is open (client-side). Closed-app alerts need
  server job + web push (scheduled-jobs.ts) — next session.
- Edit/delete of entries not implemented; recurring entries not implemented.
- Alert ledger relies on /api/logs LIMIT 500 window; very old alerts could re-fire
  only inside the 6h grace, where localStorage guard still applies.
- Multi-device: two open devices may both log the same alert.
================================================================================
