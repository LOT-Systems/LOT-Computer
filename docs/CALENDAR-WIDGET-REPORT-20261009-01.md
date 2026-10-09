# Calendar Widget — Session Report 2026-10-09 #01

**Branch:** claude/dreamy-babbage-ojxcxr · **File:** `src/client/components/CalendarWidget.tsx`

## Delivered
- **Optional time (HH:mm)** per entry (`<input type=time>`), stored in log metadata `time`; shown in lists, sorted by date+time.
- **Alert engine** (15 s tick + re-check on tab focus): fires at **T-15 MIN, T-5 MIN, T-0 NOW**. Untimed entries alert once at 09:00 on the day.
- **Reliability:** each (entry, threshold) fires exactly once, persisted in `localStorage` (`lot.calendar.fired`, capped 500). Reload never re-alerts. Late load / background throttling surfaces only the most urgent crossed threshold; events >60 min stale are silently marked.
- **Military-style notice:** pulsing bordered `▲ T-5 MIN · CALL · 14:30` line with `ACK` to dismiss; optional browser Notification (permission requested once on first timed entry).
- **Log integration:** every alert writes a `calendar_alert` log (`[ALERT] T-5 MIN — CALL: … @ 14:30 (date)`) with metadata.
- "Upcoming" now drops timed entries already past today and refreshes with the clock.
- UI stays minimal: no new panels, monochrome `text-acc` styling.

## Verification
- `tsc --noEmit`: 0 errors in CalendarWidget; esbuild parse OK. No runtime/browser test run (no UI harness in this session).

## Known gaps / next
- Alert dedupe is per-browser (localStorage); multi-device would double-log. Fix: check existing `calendar_alert` logs before writing.
- No edit/delete of entries; no recurring events; no snooze.
- Alerts only fire while the app is open (no service worker/push).
- Untimed default (09:00) not configurable.
- Add unit tests for threshold logic (extract to pure fn).
