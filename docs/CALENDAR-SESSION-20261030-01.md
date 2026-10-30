# CALENDAR WIDGET — SESSION REPORT 2026-10-30 (01)

```
CLASS    : ENGINEERING (scheduled, autonomous)
BRANCH   : claude/dreamy-babbage-l05736
SCOPE    : CalendarWidget — reliable time tracking + alerts + Log integration
```

## BASELINE
Widget stored date-only entries (`calendar_entry` logs). No time-of-day, no alerts, nothing tracking time.

## DELIVERED
- **Entry time (optional HH:mm)** — `<input type="time">` next to the Add button; stored in `metadata.time`. Past times today are rejected (no instant MISSED).
- **Alert engine** — 10 s tick + `visibilitychange` re-sync (survives sleeping tabs). Stages per timed entry: `T-15`, `T-05`, `T-00` (NOW), `MISSED` (after 30 min, up to 24 h).
- **Exactly-once logging** — each stage writes one `calendar_alert` log (`entryId`, `stage`, `date`, `time`, `entryType`). Dedupe by (a) existing alert logs from the server (cross-device), (b) localStorage claim (`lot:calendar:fired`), released on write error so it retries.
- **Military-style banner** — monospace uppercase bordered row: `STAGE · T-00:05 · CALL 14:30 — text [ACK]`. `T-00` pulses; `MISSED` dims. ACK persisted (`lot:calendar:acked`). `role="alert"` for screen readers.
- **Browser notifications** — only if permission already granted; permission requested once on creating a timed entry (user gesture).
- **Log** — `calendar_alert` added to `/api/logs` displayable events; new `ALERT:` renderer; `CAL:` renderer shows time.
- Upcoming list sorted by date+time, shows time, keyed by log id.
- UI kept minimal: no new colors/components, existing `acc` opacity palette.

## FILES
`src/client/components/CalendarWidget.tsx`, `src/client/components/Logs.tsx`, `src/server/routes/api.ts`

## VERIFICATION
```
node_modules absent in this environment → tsc / build NOT run.
Changes reviewed by hand; dayjs parse uses ISO (no customParseFormat dependency).
STATUS: UNVERIFIED BUILD — run `yarn build` before deploy.
```

## KNOWN GAPS / NEXT
1. Run typecheck/build; manual test with a +16 min entry.
2. Delete/complete entries (tasks "done" state).
3. All-day entries have no alerts (by design for now; could default 09:00).
4. Alerts fire only while the app is open (no server push / service worker).
5. Recurring entries.
