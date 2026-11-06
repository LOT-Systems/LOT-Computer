# LOT-SR · CALENDAR WIDGET · SESSION 01

```
DATE      2026-11-06
BRANCH    claude/dreamy-babbage-1muq8k
SCOPE     CalendarWidget — time tracking, Log integration, alert notifications
STATUS    BUILD NOT VERIFIED (no node_modules in routine env) · LOGIC TESTS GREEN
```

## STATE ON ARRIVAL
Date-only entries (note/task/call) stored as `calendar_entry` logs. No time-of-day, no alerts, no completion.

## DELIVERED
| ID | Item | File |
|----|------|------|
| C1 | Pure time engine: `normalizeTime`, `dueAt`, `currentStage`, `formatCountdown`, `alertKey` | `src/client/utils/calendar.ts` |
| C2 | Optional `HH:mm` per entry (accepts `9:05`, `0905`; invalid input blocks submit, red border) | `CalendarWidget.tsx` |
| C3 | Entries sorted by exact due time; time shown in list and day view | `CalendarWidget.tsx` |
| C4 | Alert stages **T-10** (10 min lead) and **T-00** (due; 30 min grace, never fired late) | `calendar.ts` |
| C5 | Alert banner: `▲ T-00:09:42 CALL 14:30 text [ACK]`, `■ NOW` pulses; minimalist, uppercase, left rule | `CalendarWidget.tsx` |
| C6 | Each alert logged once to Log as `calendar_alert` (`[ALERT T-10] CALL 14:30 — …`); dedupe survives reload via Log + in-memory set | `CalendarWidget.tsx` |
| C7 | ACK / ✓ logs `calendar_done` and removes entry from upcoming | `CalendarWidget.tsx` |
| C8 | Optional OS Notification when permission granted (requested on first calendar open) | `CalendarWidget.tsx` |
| C9 | Live clock: 15 s tick idle, 1 s while an alert is live; countdown on today's timed entries | `CalendarWidget.tsx` |
| C10 | `calendar_alert`, `calendar_done` added to `/logs` displayable events | `src/server/routes/api.ts` |

## VERIFICATION
- `calendar.ts` unit assertions (node 22 strip-types): normalize, T-10, T-00, grace expiry, all-day (no alert), countdown formats — **PASS**.
- Full `tsc`/build: **NOT RUN** — dependencies not installed in the scheduled environment. Run `yarn build` before shipping.

## KNOWN LIMITS / NEXT
1. Alerts fire only while the app is open (client-side). Reliable background delivery needs a server job (scheduled-jobs.ts) + web push.
2. Two open tabs may double-log an alert (race before refetch). Fix: server-side idempotency on (entryId, stage).
3. Entries cannot be edited/deleted; all-day entries have no alert (by design).
4. No timezone field; times are device-local.
5. Next: server-side alert job, edit/delete, recurring entries, QIE hook for missed alerts.
