```
╔══════════════════════════════════════════════════════════════════════╗
║                  LOT SYSTEMS — TERMINAL SESSION REPORT               ║
╠══════════════════════════════════════════════════════════════════════╣
║  ID       : LOT-SR-20261002-CALENDAR-01                              ║
║  DATE     : 2026-10-02                                               ║
║  CLASS    : ENGINEERING                                              ║
║  SCOPE    : Calendar widget — time tracking + alerts + Log           ║
╚══════════════════════════════════════════════════════════════════════╝
```

## INTAKE
Scheduled: make the Calendar widget reliable, time-aware, logging to Log, with
military-grade event notifications, minimalist UI preserved.

## BASELINE
`CalendarWidget.tsx` was date-only: no time, no alerts, no completion state.

## CHANGES
| File | Change |
|---|---|
| `src/client/utils/calendarAlerts.ts` (new) | Pure alert logic: stages T-15 → T-05 → T-00 → MISSED(+5m, 12h window), ACK. Only the most advanced stage fires (no burst after long absence). Military formatting (`0930 05 OCT`). |
| `src/client/components/CalendarWidget.tsx` | Optional `HH:mm` time per entry; 15 s clock tick; alert banner (uppercase, `▌ T-05 MIN · CALL · 0930 05 OCT`, pulses at T-00/MISSED) with `ACK`; time shown in lists; browser Notification when permission already granted (requested on first timed entry). |
| `src/server/routes/api.ts` | `calendar_alert` added to displayable `/logs` events so alerts appear in Log. |

## RELIABILITY
- Every alert/ACK is written to Log (`event: calendar_alert`, metadata `entryId, stage, key`).
- Dedupe: fired keys rebuilt from Log + localStorage; nothing fires before logs have loaded (`isFetched`); failed log write releases the key to retry.
- Time stored in `metadata.time`; invalid values ignored; legacy date-only entries unaffected (no alerts).
- ACKed entries drop out of the upcoming list.

## CHECKS
```
Alert logic unit assertions (tsx, 11 cases)  : PASS
CalendarWidget.tsx syntax (esbuild tsx)      : PASS
Full tsc / app build                         : NOT RUN — node_modules absent in this environment
Browser/visual verification                  : NOT RUN
```

## KNOWN GAPS / NEXT
- Alerts only fire while the app is open (no server push / service worker).
- No edit/delete of entries (Log API only edits `note` events).
- Run `yarn build` and eyeball banner in-browser before release.
- Candidate: all-day entries get a morning (T-00 at 08:00) alert; recurring events.
