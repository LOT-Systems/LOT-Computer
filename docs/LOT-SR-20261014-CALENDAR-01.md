# LOT-SR-CALENDAR-01 — Calendar Widget: Time Tracking + Alert System

Session: 2026-10-14 · Branch: `claude/dreamy-babbage-62o2p7` · Type: scheduled autonomous run

## OBJECTIVE
Reliable Calendar widget that tracks time and logs into Log, with military-style event alerts. Minimalist UI preserved.

## BASELINE (found)
- Date-only entries (`calendar_entry` log, `metadata.{date,text,entryType}`); no time, no completion, no alerts, no duplicate guard.
- Logs are append-only server-side (PUT only edits `note`), so edit/delete is impossible directly.

## DELIVERED
| Area | Change |
|---|---|
| Core | `src/client/utils/calendar.ts` — pure, dependency-free, event-sourced model. State derived from `calendar_entry` logs by `metadata.kind`: `event` (default/legacy), `status` (done/cancelled/open), `alert` (fired-stage dedupe key). No server schema change. |
| Time | Optional `HH:mm` per entry (`<input type=time>`). Untimed = all-day, due 09:00 local. |
| Alert stages | `T-15` warning → `T-0` active (10 min window) → `MISSED` (up to 24h). Highest due stage only; a fired or superseded stage never repeats. Stale (>24h) is silent. |
| Reliability | 15 s tick + catch-up on `focus`/`visibilitychange`; in-memory fired-set blocks double-fire before refetch; persisted alert logs block re-fire after reload. Alert board derives from entries, so it survives reload. |
| Notification UI | Bordered mono alert block: `▲ ACTIVE // NOW · T-0M`, `△ WARNING // T-15`, `MISSED // OVERDUE`, with ACK / DONE. Optional browser Notification via "Enable alerts" (opt-in, only shown when permission is `default`). |
| Log | Alert `[CAL // T-15] 2026-10-14 14:30 CALL · text`; status `[CAL // DONE] …`; creation text now includes time. `Logs.tsx` CAL block shows `ALERT // stage` / `DONE` / type + date + time. |
| Reliability of data | Duplicate guard (same date+time+type+text); invalid date/time rows ignored; stable `entryId`; done/cancel/reopen per entry; upcoming list shows countdown (`T-1D 2H`). |
| Consumers | `System.tsx` next-entry memo uses `buildEntries` (open only). `api.ts` AI summary and `scheduled-jobs.ts` (weekly count, temporal-alignment) ignore `alert`/`status` logs so they are not counted as new entries. |

## VERIFY
- `node --experimental-strip-types scripts/tests/test-calendar.ts` → **8/8 pass** (validation, sort, stage windows, dedupe/supersession, catch-up, done/reopen, all-day, duplicates, helpers).
- TypeScript syntax transpile of all 5 touched TSX/TS files: 0 diagnostics.
- **NOT verified:** full `tsc`/build (no `node_modules` in sandbox; `npm i` fails with ERESOLVE) and no in-browser run. Run `yarn build` and eyeball the widget before ship.

## KNOWN LIMITS / NEXT
1. Alerts fire only while the app is open (client-side). Closed-tab delivery needs server push/email via a scheduled job — recommended next step (job scans open entries, writes `alert` logs, sends Web Push/email).
2. Timezone: times are device-local; no per-entry tz.
3. `/api/logs` is cached 5 min (`staleTime`); widget refetches explicitly after each write.
4. No in-place text edit (append-only logs); cancel + re-add instead.
5. Candidate: recurring entries, configurable lead time, `calendar_entry` handler docs in About.tsx (still describe date-only).

## FILES
`src/client/utils/calendar.ts` (new) · `src/client/components/CalendarWidget.tsx` · `Logs.tsx` · `System.tsx` · `src/server/routes/api.ts` · `src/server/scheduled-jobs.ts` · `scripts/tests/test-calendar.ts` (new)
