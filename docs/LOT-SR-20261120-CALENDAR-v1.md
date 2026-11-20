# SESSION REPORT: CALENDAR WIDGET v1, RELIABLE ALERT ENGINE
## Date: 2026-11-20 · Branch: `claude/dreamy-babbage-nz73xl`
### Session type: scheduled routine, feature engineering (Calendar widget)

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION · SESSION REPORT                        ║
║  CALENDAR v1 · TIME TRACKING · MILITARY-GRADE ALERTS             ║
║  November 20, 2026                                               ║
║  Authorized: S-2 // VADIK MARMELADOV                             ║
║  STATUS: GREEN · build ✔ · typecheck ✔ · 55/55 engine ✔ · E2E ✔  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. BOTTOM LINE UP FRONT

- **Calendar widget rebuilt on the existing minimalist foundation.** Same label, the same "Add date" button, the same letter-day grid and Note / Task / Call picker. Added: a live clock, an **OVERDUE / TODAY / NEXT** command board, an optional **HH:mm time** on entries, ✓ Clear / × Scrub / ↺ Reinstate actions, and a 7-day time-tracking footer.
- **Everything is logged to the Log.** Each state change is an append-only log record: `calendar_entry` (SCHEDULED), `calendar_alert` (NOTICE / ALERT / EXECUTE / OVERDUE), and `calendar_update` (CLEARED with a late/on-time delta, SCRUBBED, REINSTATED). All three render in the Log tab as `CAL:` blocks.
- **Alerts are now reliable.** The engine runs **app-wide**, so alerts still fire when the System tab is closed. Each alert fires **exactly once per level** across tabs and devices, enforced by the server with a Postgres advisory lock (tested: 12 concurrent fires → 1 log line). It also survives reloads and works offline: the notification shows immediately and the log write retries.
- **Fixed a pre-existing production crash.** On master, `intentionEngine.ts:3332` (P147, QIE v112) referenced an undefined `dayMs`, which threw `ReferenceError` and took the whole app down to "Something went wrong" as soon as any QIE signal existed.
- **Found a pre-existing app-wide issue (not fixed, needs a decision):** one widget crash can silently stop **every** nanostores update in the app, which breaks tab navigation. Details in §6.

---

## 1. CONTEXT AND PRIOR ITERATIONS

The foundation on master was `CalendarWidget.tsx` (281 lines): a date grid, Note / Task / Call entries stored as generic `calendar_entry` logs, and an upcoming-dates list. There was no time of day, no alerts, no completion, and no deletion.

Two earlier iteration branches were reviewed. Neither had been merged.

| Branch | Content | Why it wasn't adopted as-is |
|---|---|---|
| `gifted-lovelace-cZOWR` (978cf52) | Live clock, T-minus countdown, overlay | Alerts were in-memory only (they re-fire on every reload), only worked while the System tab was mounted, and left no Log record |
| `dreamy-babbage-3k2zhm` (046e0bb) | ALPHA/BRAVO alert logs, command board, delete | Deleting used `PUT /api/logs/:id`, which **ignores non-note events**, so delete never worked. Dedup used `sessionStorage` (resets on each tab), and server time was UTC |

This session took the best ideas from both (live clock and countdown from cZOWR; command board and alert logs from 3k2zhm) and rebuilt the parts that weren't reliable.

---

## 2. ARCHITECTURE

```
              ┌──────────────────── Log stream (Postgres, append-only) ───────────────────┐
              │ calendar_entry   calendar_update (done|scrubbed|active)   calendar_alert  │
              └──────▲──────────────────▲──────────────────────────────────────▲─────────┘
                     │                  │                                      │ advisory-locked,
   POST /api/calendar/entries   POST …/entries/:id/status            POST /api/calendar/alerts  idempotent
                     │                  │                                      │
              ┌──────┴──────────────────┴───────┐        ┌─────────────────────┴──────────────┐
              │ CalendarWidget (System tab)     │        │ CalendarAlertEngine (app root)      │
              │ board · grid · add · clear      │        │ tick 15s → pendingAlerts() → fire   │
              └──────────────▲──────────────────┘        │ catch-up: recentAlerts() → surface  │
                             │ GET /api/calendar          │ overlay + optional OS notification  │
                             └──────────── react-query ───┴─────────────────────────────────────┘
                                  #shared/utils/calendar.ts (pure fold + alert ladder)
```

### Files

| File | Role |
|---|---|
| `src/shared/utils/calendar.ts` | **New.** Pure, dependency-free core: validation, DST-safe day math, fold (logs → entries), alert ladder, military formatting. Shared by the client, the server, and the verify script |
| `src/server/routes/calendar-api.ts` | **New.** `GET /api/calendar`, `POST /api/calendar/entries`, `POST /api/calendar/entries/:id/status`, `POST /api/calendar/alerts`. Owner-scoped, validated, advisory-locked |
| `src/client/components/CalendarAlerts.tsx` | **New.** App-wide alert engine and notification overlay |
| `src/client/hooks/useCalendar.ts` | **New.** `useNow` (step-aligned clock), `useCalendarEntries`, `useCalendarActions` |
| `src/client/stores/calendar.ts` | **New.** Overlay queue on an isolated emitter (§6), per-device "shown" ledger, device-alert opt-in |
| `src/client/components/CalendarWidget.tsx` | Rewritten on the same minimalist layout |
| `src/client/components/Logs.tsx` | `CAL:` renderer for all three events (level, type, text, stamp, ON TIME / +12M LATE) |
| `src/client/components/System.tsx` | "Next:" line now skips cleared/scrubbed entries and shows the time |
| `src/client/entries/app.tsx` | Mounts `<CalendarAlertEngine/>` at the app root |
| `src/client/queries.ts` | `useCalendar`, `useCreateCalendarEntry`, `useSetCalendarStatus`, `fireCalendarAlert` |
| `src/client/index.css` | Overlay animations (they live here because the CSP blocks injected `<style>` tags) |
| `src/server/routes/api.ts` | Registers the routes; adds `calendar_update` and `calendar_alert` to the displayable Log events |
| `src/client/stores/intentionEngine.ts` | One-line fix for the `dayMs` crash |
| `scripts/verify-calendar.ts` | **New.** 55-check engine verification |

---

## 3. ALERT DOCTRINE

| Level | Untimed entry | Timed entry | Overlay | Who it applies to |
|---|---|---|---|---|
| `NOTICE` | D-1 | D-1 (and > T-60) | auto-dismisses after 12s | all types |
| `ALERT` | D-0 (day of) | T-60 → T-5 | auto-dismisses after 45s | all types |
| `EXECUTE` | — | T-5 → T+15 | **stays until Ack**, ■ blinks | all types |
| `OVERDUE` | after the day ends | after T+15 | **stays until Ack**, ■ blinks | task / call only (notes just elapse), stops after 7 days |

Rules:
1. **One alert per (entry, level).** The server enforces this in a transaction with `pg_advisory_xact_lock`.
2. **No downgrades.** If a higher level has already fired, a lower one never fires afterwards.
3. **No noise.** NOTICE and ALERT are skipped when the entry was created inside that window (the operator already knows). EXECUTE and OVERDUE always fire.
4. **Catch-up only fires the current level.** If the app was closed through T-60 and opened at T-3, only EXECUTE fires, not a stale ALERT.
5. **Surface on every device.** An alert logged in the last 15 minutes that this device hasn't shown yet gets shown. This covers another device firing first, and the page reloading between "logged" and "shown" (see §5, bug B).
6. **Offline.** The overlay still shows, marked `UNLOGGED · RETRY`, and the log write retries on the next tick.
7. **Clear dismisses only after the server confirms.** A failed clear never looks like it succeeded.
8. **OS notifications** are an opt-in per device ("Device alerts: off/armed" in the widget footer). EXECUTE and OVERDUE use `requireInteraction`.

**Timezone policy:** the server runs in UTC, but the operator lives in local time. Countdown text and late/on-time deltas are computed on the client in local time. The server accepts client text only if it carries the right `[LEVEL]` tag, and accepts a numeric delta only within bounds. Otherwise it falls back to computing them itself.

Sample Log lines produced:
```
[SCHEDULED] CALL · Call ops center · 20 NOV 2026 · 14:00
[ALERT] CALL · Call ops center · 20 NOV 2026 · 14:00 · T-00:45:00
[EXECUTE] CALL · Sync with field team · 19 NOV 2026 · 16:04 · T-00:02:22
[OVERDUE] TASK · File quarterly ration report · 18 NOV 2026 · +1D
[CLEARED] CALL · Call ops center · 20 NOV 2026 · 14:00 · +12M LATE
[SCRUBBED] TASK · Review supply manifest · 19 NOV 2026 · 16:50
```

---

## 4. VERIFICATION

| Gate | Result |
|---|---|
| `yarn build` (client + server) | ✔ GREEN |
| Server `tsc` | ✔ 0 errors |
| Client `tsc` | ✔ 103 errors, all pre-existing (baseline 104; one fewer because of the `dayMs` fix). **0 errors in new or changed calendar code** |
| `scripts/verify-calendar.ts` | ✔ **55/55** in UTC, America/Los_Angeles, Europe/Moscow, Asia/Tokyo, Pacific/Chatham (+12:45). Covers DST boundaries, leap days, crossing midnight, no-downgrade, fold order-independence, catch-up window, and formatting |
| API end-to-end (local Postgres 16, real server) | ✔ Validation (bad date / time / type / empty text → 400) · cross-user isolation (404, empty feed) · unauthenticated → 401 · non-UUID id → 404 · idempotent status changes · alert skipped for closed entries |
| Concurrency | ✔ **12 parallel alert fires → 1 record · 8 parallel scrubs → 1 record** (before the lock: 6 → 2) |
| Browser end-to-end (Playwright, America/Los_Angeles) | ✔ OVERDUE and EXECUTE overlays fire on load · Clear writes CLEARED and moves to the next queued alert · Ack and Esc dismiss · nothing pops again after reload · adding a call at 10:15 through the UI works · 11 `CAL:` blocks render in the Log · overlay fits a 390px phone screen with 16px gutters |

Run it yourself: `TZ=America/Los_Angeles npx esr scripts/verify-calendar.ts`

Screenshots: `docs/calendar/2026-11-20_widget-desktop.png`, `docs/calendar/2026-11-20_log-stream.png`, `docs/calendar/2026-11-20_alert-phone.png`.

---

## 5. BUGS FOUND AND FIXED THIS SESSION

| # | Bug | Severity | Fix |
|---|---|---|---|
| A | `intentionEngine.ts:3332` uses undefined `dayMs`. It throws `ReferenceError` once any QIE signal exists, and **the whole app shows "Something went wrong"**. Pre-existing on master since QIE v112 (1846b80) | **CRITICAL** (production) | Inlined the constant |
| B | The service worker's first-visit `controllerchange → reload` could land between "alert logged" and "overlay shown", so the alert was recorded but never seen | High | Catch-up surfacing from the server feed (rule 5) |
| C | Two tabs or devices racing could write duplicate alert lines | Medium | Transaction-scoped advisory lock |
| D | Runtime `<style>` injection is blocked by the app's CSP (`style-src` nonce), so animations silently didn't apply. `EvolutionMilestoneToast.tsx` has the same pre-existing problem | Low | Calendar CSS moved to `index.css`. The milestone toast is not fixed yet |
| E | Prior branch: "delete" used `PUT /logs/:id`, which no-ops on non-note events | — | Replaced with append-only `calendar_update` |

---

## 6. OPEN ISSUES (need S-2 decision, not fixed)

1. **One widget crash can stop all store updates app-wide (HIGH).** nanostores 0.9.5 keeps a single module-global `listenerQueue`. If any listener throws inside `notify()`, `listenerQueue.length = 0` is never reached, and every later `atom.set()` in the whole app is silently dropped. Locally, a "Maximum update depth" crash in the **Community** widget (React #185) triggered this, and after that **tab navigation stopped working**: the URL changes but the page stays on System. This reproduces on a **master** build too.
   - Locally, the crash is probably made worse by APIs returning 500 without API keys. It may still occur in production.
   - The calendar overlay and its toggle are now on an isolated emitter, so alerts keep working regardless.
   - Recommended next steps: find the listener behind #185 in Community; consider upgrading nanostores or wrapping the router store's listeners.
2. **Other widget crashes** seen locally on master, all contained by error boundaries: Dashboard (`reading 'filter'` of undefined), Biofield Engine and Bioethics (React #310, hook order changed between renders).
3. **Global rate limit is 100 requests/min per IP** (`src/server/index.ts:60`). One paid-account System load makes many requests, and several reloads within a minute hit 429 (including `sw.js`). Users behind shared NAT, or anyone who reloads quickly, may hit it. Consider exempting static assets or raising the limit for authenticated sessions.
4. **Page overflows sideways on phone** (about 439–486px wide on a 390px screen) because of the System label/value grid and long rows such as Astrology. Pre-existing. Calendar rows now wrap within their column.
5. **`PUT /api/logs/:id` has no ownership check** (`findByPk` with no `userId`). Its non-note branch returns the record untouched, and its note branch can edit or delete **another user's note** if someone knows its UUID. Pre-existing security issue; recommend scoping by `req.user.id`.

---

## 7. NEXT ITERATION CANDIDATES

- Recurring entries (daily / weekly) as a `calendar_entry` with an `rrule`-lite field. This fits the same fold.
- Server-side push (Web Push) so EXECUTE reaches a closed device. The current engine needs an open tab.
- An optional sound cue tied to the existing Sound toggle for EXECUTE.
- Editing an entry's time (append a `calendar_update` with `status: 'rescheduled'`).

---

```
END OF REPORT · LOT-SR-20261120-CALENDAR-v1 · GREEN
```
