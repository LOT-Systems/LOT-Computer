# SESSION REPORT — CALENDAR WIDGET v1 (Timed Alerts)
## Date: 2026-11-01 · Branch: claude/dreamy-babbage-d51xgz · Type: Scheduled engineering session

```
╔══════════════════════════════════════════════════════════╗
║ LOT SYSTEMS — CALENDAR WIDGET · SESSION 1               ║
║ Goal: reliable time tracking + Log + military alerts    ║
╚══════════════════════════════════════════════════════════╝
```

## 1. Entering state
`CalendarWidget.tsx` supported date-only entries (note/task/call) logged as `calendar_entry`. No time, no alerts, no entry ids (list keys by index), "upcoming" list never aged out within the current day, clock frozen at render.

## 2. Delivered
| Area | Change |
|---|---|
| Time | Optional `HH:mm` per entry (`metadata.time`, validated); entries sorted by date then time |
| Clock | Live `now` tick: 1s when a timed entry is within 24h, else 15s |
| Alerts | Three stages, each fires once per entry: `STANDBY T-15`, `EXECUTE T-0`, `MISSED` (widget opened up to 2h late). Dedupe persisted in `localStorage` (`lot.calendar.alerts.v1`, bounded to 300) |
| UI | Minimal alert strip atop widget: left rule, uppercase tracked label, `TYPE // text`; T-0 pulses; click to acknowledge. Upcoming list shows `T-hh:mm:ss` countdown for timed entries <24h away; past timed entries drop off |
| Log | Each alert writes `calendar_alert` log (stage, entryId, date, time, entryType, text); Logs view renders `ALERT:` block; `calendar_entry` log shows time |
| Native | Browser Notification fired if permission already granted; permission requested once when first timed entry is added (never on load) |
| Server | `calendar_alert` added to `/logs` displayable events whitelist |

## 3. Verification
- `tsc --noEmit` — no errors in CalendarWidget.tsx / Logs.tsx / api.ts (grep-filtered; repo-wide pre-existing errors not assessed).
- Not run: browser/UI test, full `yarn build`. Alert timing logic reviewed by reading only; no unit tests exist for the widget.

## 4. Known limits / next session
1. Alerts only fire while the app is open (client-side). Reliable background delivery needs a server job (`scheduled-jobs.ts`) or Web Push.
2. Dedupe is per-browser; a second device will fire and log its own alerts (duplicate `calendar_alert` logs). Server-side dedupe by `entryId+stage` recommended.
3. No edit/delete/complete for entries; add "DONE" ack that logs completion.
4. Extract alert engine to a pure function (`getDueAlerts(entries, now, fired)`) and unit test it.
5. Timezone: times are interpreted in browser local time.
6. System.tsx "Temporal Planner" line is still date-only; should use time and show countdown.
