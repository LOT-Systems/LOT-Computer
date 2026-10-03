# CALENDAR WIDGET — SESSION REPORT 2026-10-03

```
CLASS    : ENGINEERING (scheduled, unattended)
BRANCH   : claude/dreamy-babbage-776pqs
GOAL     : reliable time-tracking Calendar widget, logged into Log,
           military-style event notifications, minimalist UI kept
```

## BASELINE
Widget was date-only: no time, no tracking, no alerts; entries logged as `calendar_entry`.

## CHANGES
| File | Change |
|---|---|
| `src/client/components/CalendarWidget.tsx` | Optional `HH:mm` time per entry (metadata.time). Live clock (1s tick when an event is <1h away, else 20s). `T-HH:MM:SS` countdown on upcoming timed entries (<24h). Alert engine with three stages: `T-15` PRE-ALERT, `T-0` ZERO HOUR, `MISSED` (up to 2h late). ACK-able banner: `14:30 // ZERO HOUR // call // text`. Optional OS Notification (opt-in link "Enable system alerts"; never auto-prompts). |
| `src/client/components/Logs.tsx` | New `CAL-ALERT:` block; `CAL:` block shows time. |
| `src/server/routes/api.ts` | `calendar_alert` added to displayable log events. |

## RELIABILITY DESIGN
- Each (entryId, stage) fires once: de-duplicated by in-memory ref, localStorage (`lot-calendar-fired`, capped 300) and by existing `calendar_alert` logs (survives reload / other devices).
- Later stage supersedes unseen earlier ones (open the app at T-5 → one ZERO-HOUR-track alert, no stale T-15 spam).
- All storage access wrapped in try/catch; widget works without Notification API.
- Every alert is written to Log (`event: calendar_alert`, metadata: entryId, stage, date, time, entryType).

## CHECKS
```
tsc on CalendarWidget.tsx (isolated, repo deps not installed): no errors besides unresolved project imports
Full build / tests: NOT RUN (no node_modules in sandbox)
Manual/browser test: NOT RUN
```

## KNOWN LIMITS / NEXT
- Alerts only fire while the app is open (no service worker / push yet).
- Alerts only for timed entries; all-day entries have no alert.
- Candidates: delete/complete entry, snooze, service-worker push, all-day morning briefing, alert sound toggle, unit tests for stage logic (extract to util).
