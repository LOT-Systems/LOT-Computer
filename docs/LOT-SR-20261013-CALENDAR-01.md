```
╔══════════════════════════════════════════════════════════════════════╗
║            LOT SYSTEMS — TERMINAL SESSION REPORT                     ║
╠══════════════════════════════════════════════════════════════════════╣
║  ID       : LOT-SR-20261013-CALENDAR-01                              ║
║  DATE     : 2026-10-13                                               ║
║  CLASS    : ENGINEERING — CALENDAR WIDGET                            ║
║  S-2      : VADIK MARMELADOV                                         ║
╚══════════════════════════════════════════════════════════════════════╝
```

## INTAKE
Scheduled task: make the Calendar widget reliable — track time, log to Log,
military-grade alert notifications, keep the UI minimal.

## BASELINE
CalendarWidget stored date-only entries (`calendar_entry` logs). No time of
day, no reminders, no alerts. Nothing could "track time".

## CHANGES
| File | Change |
|---|---|
| `src/client/utils/calendar.ts` (new) | Pure engine: time validation/normalisation, `dueAt`, staged alert logic (`pendingStage`), `formatCountdown` (`T-00:14:32`), stage labels, sort key |
| `src/client/components/CalendarWidget.tsx` | Optional time input; entries carry `time` + deterministic id; ticker (1 s when a timed entry is within 36 h, else 15 s); alert engine; ACK banners; live countdown in upcoming list; opt-in browser Notification when permitted |
| `src/server/routes/api.ts` | `calendar_alert` added to displayable `/logs` events |
| `src/client/components/Logs.tsx` | Renders `calendar_alert` (`ALERT:` block) and shows time on `calendar_entry` |
| `scripts/tests/test-calendar.ts` + `package.json` | `yarn test:calendar` unit assertions for the engine |

## ALERT DOCTRINE
Stages: `T-15 ADVISORY` → `T-05 WARNING` → `T-00 EXECUTE` → `+10m OVERDUE`.
- Each stage fires once per entry. Dedup via in-memory set, localStorage
  (`lot:calendar:fired`, capped at 200) and already-logged `calendar_alert`
  logs (survives reloads/devices).
- A late page load fires only the latest crossed stage (no burst); stages
  more than 60 min stale never fire.
- Every alert is written to Log (`event: calendar_alert`, metadata:
  entryId, stage, label, entryType, date, time, text).
- UI: bordered uppercase tabular-nums banner, pulsing for EXECUTE/OVERDUE,
  `ACK` to dismiss. Untimed entries behave exactly as before.

## CHECKS
```
Engine unit assertions (tsx)        : PASS
esbuild syntax transform (3 files)  : PASS
Full tsc / app build                : NOT RUN — node_modules absent in this
                                      environment (no install performed)
Manual browser verification         : NOT RUN
```

## KNOWN LIMITS / NEXT
- Alerts only fire while the app is open (client-side). Closed-app delivery
  needs a server scheduled job or push subscription.
- No edit/delete/complete for entries yet (logs are append-only).
- Time is interpreted in the browser's local timezone.
- Run `yarn install && yarn build` and a manual pass before release.
