# LOT SYSTEMS — CALENDAR WIDGET SESSION REPORT

```
ID      : LOT-SR-20261024-CALENDAR-01
DATE    : 2026-10-24
CLASS   : ENGINEERING (scheduled, unattended)
BRANCH  : claude/dreamy-babbage-vhvk3k
SCOPE   : Calendar widget — time, alerts, time tracking, Log integration
```

## INTAKE
Foundation was date-only (`calendar_entry` logs: note/task/call, month grid, upcoming list). Goal: reliable time-aware calendar that tracks time, logs to Log, with military-style notifications, minimal UI preserved.

## CHANGES
| File | Change |
|---|---|
| `src/client/utils/calendar.ts` (new) | Pure core: entry model (`time`, `done`, `trackedMin`), `buildEntries` (folds `calendar_done` logs), `alertLevel` (T-15 / T-05 / T-00 / OVERDUE), countdown + duration formatting, localStorage persistence (fired alerts, active tracker), square-wave alert tones (1/2/3 pips) |
| `src/client/components/CalendarWidget.tsx` | Optional `HH:MM` field on add; alert banner (`▌ T-05 MIN · call · 14:30`, ACK to dismiss; bold for T-05+, `!!` for overdue); ▶ start / ■ stop live timer (`mm:ss`); ✓ complete (banks running time); done entries leave upcoming list; tracked minutes shown (`20m`) |
| `src/server/routes/api.ts` | `calendar_alert`, `calendar_done` added to displayable `/logs` events |
| `src/client/components/Logs.tsx` | `CAL:` block for alert/done/tracked records |

## LOG EVENTS
- `calendar_entry` — metadata now includes `time` (nullable; old entries still valid)
- `calendar_alert` — `{entryId, level, date, time, entryType}`, once per (entry, level) per browser
- `calendar_done` — `{entryId, completed, trackedMin, ...}`; tracked-only sessions have `completed:false`

## CHECKS
```
Unit logic (alert levels, stale/done/all-day suppression, time parsing, entry folding): PASS (10 asserts, ad-hoc script)
Syntax transpile of 4 changed files: PASS
Full tsc / build / app run: NOT RUN — node_modules absent in this environment
```

## KNOWN LIMITS / NEXT
1. Alerts fire only while the System page is open (no service worker / push). Next: Web Notification + service-worker scheduling.
2. Alert de-duplication is per browser (localStorage); two devices open will each log one alert. Next: server-side check on `entryId+level`.
3. Active tracker is per browser; no cross-device sync.
4. No edit/delete of entries yet; `System.tsx` "next entry" still date-only (could use time).
5. Needs real-browser verification of tones (autoplay policy may mute before first interaction).
