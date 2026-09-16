<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Widget System Health Audit — 2026-09-16

> Full-system scan of widget wiring, data storage, UI, and lag, against the
> live code (not just `docs/technical/WIDGETS.md`, which is a design
> reference and — per §3/§4 below — has drifted from what actually ships).
> Scope: every `*Widget.tsx` in `src/client/components/`, `System.tsx`,
> the user-profile surfaces, the Quantum Intention Engine (QIE), Memory,
> Story/Narrative, and the Log pipeline that backs them all.

**Environment note:** this scan ran in a fresh sandbox with no database
connection and no deployment credentials (`.env` is absent; only
`.env.example` templates exist). `npm run test:cold-start` requires a live
server + Postgres and could not be executed. Everything below is a static
code audit — reads of the actual source, not a live click-through. Where
the task asked for a *measured* lag test (button/sound/control latency in
the running app), that is explicitly deferred and flagged, not fabricated.

---

## 1. Widget inventory — data container vs. data display vs. interactive

37 widget components exist under `src/client/components/`. Classifying by
the task's own frame:

- **Pure data display** (no user action, read-only): `TimeWidget` (clock
  face), `SignalStreamWidget`, `SystemPulseWidget`, `UserMetricsWidget`,
  Stats-stack widgets (Growth Milestones, Badge Unlock Feed, Collective
  Consciousness, Wellness Pulse, Memory Engine Stats, Intention Patterns).
- **Data container + light interaction** (cycles views, no state write):
  `QuantumStateWidget`, `PatternRecognitionWidget`, `NarrativeWidget`,
  `EvolutionWidget`, `InterfaceEvolutionWidget`.
- **Fully interactive** (button/toggle triggers a state or server write):
  `RecipeWidget`, `IntentionsWidget`, `PlannerWidget`, `MemoryWidget`,
  `MicroGameWidget`, `MicroCalculatorWidget`, `QuantumRandomWidget`,
  `QuantumSignWidget`, `SubscribeWidget`, `MonthlyPulseWidget`,
  `CosmicUpdateWidget`, the three Quantum Engine Connect toggles
  (Car/Home/Computer), `ContextualPromptsWidget`, `InterventionsWidget`,
  `ChatCatalystWidget`, `PatternRecognitionWidget`'s recommend action,
  `GoalJourneyWidget`.

The task's rule — "if it is interactive in any way, the context ... can be
synchronized ... and posted to the Log" — is the correct design intent and
is **mostly honored**. It is **not universal**. See §2.

---

## 2. Interactive widgets that do NOT reach the Log — wiring gaps

Confirmed by reading each handler, not by inference:

| Widget | Interaction | Signal recorded? |
|---|---|---|
| `QuantumSignWidget.tsx:108-163` | View-cycle click, dismiss, and four action buttons (Journal/Create/Connect/Rest) | **No.** Every handler only does `localStorage.setItem('quantum-sign-action', ...)` or local React state. No `recordSignal(...)` call anywhere in the file, no `/api/logs` POST. The user's declared intent from this widget is invisible to both the QIE and the Log — the one widget in the whole system whose entire interaction surface is a dead end. |
| `SubscribeWidget.tsx:18-24` | Subscribe-tier click | Click sets a `localStorage` cooldown key and opens the external subscription URL. No signal recorded — lower stakes (it's a navigation action, not a reflective one) but still an unlogged interaction. |
| `MonthlyPulseWidget.tsx:94-102` | Dismiss | `localStorage`-only. Same low-stakes category as above. |

Everything else checked — `RecipeWidget:253`, `IntentionsWidget:83`,
`MicroGameWidget:779`, the three `QuantumEngineWidgets.tsx:207-250` device
toggles — correctly calls `recordSignal(...)`. `CosmicUpdateWidget` has no
client-side `recordSignal` but its mutation lands on a server route that
itself writes the log entry (`api.ts:4899`) — that one is fine, just wired
server-side instead of client-side.

**Recommendation:** `QuantumSignWidget` is the one genuine gap worth
closing — it is presented as a daily subscriber ritual (four intentional
actions) and none of the four are ever recorded anywhere. Everything else
in this section is cosmetic.

---

## 3. LOT AI / System tab / Portrait wiring

`System.tsx` wires into the AI feedback loop correctly: `AIFeedbackWidget`
(`System.tsx:63,1015`) combines the QIE store, `useOSDiagnostics()`,
`useProfile()`, and `useLogs()` (`AIFeedbackWidget.tsx:12-30`) — this
matches `docs/technical/WIDGETS.md`'s description exactly.

**Drift found:** there is no single "Portrait" page. Two different
components answer to that idea and they do **not** share a data path:

- `About.tsx` — despite showing up in earlier greps for "profile"-adjacent
  terms, this is a **static public wiki/documentation page** (What is LOT,
  self-assembly log, badge field guide). It is not user-specific and makes
  no live `useProfile`/`useLogs` calls.
- `PublicProfile.tsx` — the actual per-user portrait page. It fetches via
  a bare `fetch('/api/public/profile/${userIdOrUsername}')`
  (`PublicProfile.tsx:44`) hitting `src/server/routes/public-api.ts:741`.
  This is a **separate, independently implemented endpoint** from
  `/api/user-profile` (`api.ts:2714`), which is what `useProfile()`
  (`queries.ts:290-317`) — and therefore `System.tsx`/`AIFeedbackWidget` —
  actually consume. `PublicProfile.tsx` also bypasses the shared
  `createQuery` cache layer entirely by using a raw `fetch`.

Net effect: the System tab's view of "who the user is" and the Portrait
page's view of "who the user is" are computed by two different server
routes that can drift out of sync, and the Portrait page gets none of the
caching/staleness protections the rest of the app relies on. This is worth
a deliberate decision (merge the routes, or document why they're meant to
diverge) rather than an accident of two builds landing at different times.

---

## 4. QIE / Memory / Story wiring

Core wiring is **sound**: `intentionEngine.ts` is the single client-side
QIE store; `QuantumStateWidget`, `PatternRecognitionWidget`,
`SignalStreamWidget`, and `ArchitectWidget` all read it via
`intentionEngine.get()` / `useStore`, with no competing store found.
`MemoryWidget` and `NarrativeWidget` each call their own dedicated server
endpoints (`/api/memory`, `/api/narrative`) as documented.

**One architectural nuance worth recording, not fixing:** `recordSignal()`
(`intentionEngine.ts:199-229`) is purely client-side and `localStorage`-
persisted — it never itself POSTs to `/api/logs`. The rich "pattern arc"
rows that show up in the Log (`qos_signature_lock`, `signal_momentum`,
etc., per `LOT-LEXICON.md`) come from a **separate path**: scheduled cron
jobs in `src/server/scheduled-jobs.ts` that re-derive patterns from the
persisted signal history, not from the QIE store directly. This is a
legitimate two-track design (fast local feedback + slow authoritative
server analysis), but `docs/technical/WIDGETS.md`'s framing — "QIE feeds
the Log" — understates the split. Recommend a one-line doc correction so
future sessions don't assume `recordSignal` and the Log are the same
write.

---

## 5. Log pipeline — completeness of the "military communications" write→read loop

The Log module already implements the "post to the Log, military-format"
concept the task describes (`Logs.tsx` renders ~154 explicit
`log.event === '...'` cases in a fixed-width, prefixed style: `MCL:`,
`QPRES:`, `COMP:`, etc. — see `LOT-LEXICON.md`). The known failure mode
here (`LOT-DOCTRINE.md` "Backend Whitelist Hygiene": an event type that
isn't in the server's `displayableEvents` whitelist, or has no formatter
case, is **silently dropped — no error, just invisible**) has **new
confirmed instances** beyond the two already on record (`plan_set`,
`emotional_checkin`, `calendar_entry`, `qi_rfi`):

**Written but never shown** (created via `Log.create()` in `src/server`,
absent from the `displayableEvents` whitelist at `api.ts:1084-1216`):
- `direct_message_sent` (`api.ts:4058-4068`) — also has empty `text` and no
  `Logs.tsx` case, so it's invisible twice over.
- `generated_story` (`api.ts:5591-5602`)
- `system_feedback` (`api.ts:4668-4677`)
- the `cosmic_update`/`other` event written at `api.ts:4899-4909`

**Shown but never written** (a `Logs.tsx` render case exists — e.g.
`quantum_intent_signal:377`, `qos_state:425`, `self_assembly:499`,
`pattern_detected:1936`, `care_spiral:2022`, `energy_check:1392` — but no
`Log.create()` anywhere in `src/server` emits that event string, and/or
it's missing from the whitelist): roughly **35 dead formatter branches**
that can never render under any circumstance. These aren't actively
harmful, but they are maintenance debt: a future session reading
`Logs.tsx` will reasonably assume those events are live.

This is the same class of bug the doctrine already names once per session
on average since 20260604 — it keeps recurring because the whitelist and
the formatter are two independently-maintained lists with no shared
source of truth. **Structural recommendation for a future session:**
derive `displayableEvents` from the same enum/const that `Logs.tsx`
switches on (or vice versa), so a new event type can't exist on only one
side of the pipe.

---

## 6. Loading speed / lag — regression check against SR-20260719-01

All five fixes from the last widget-lag pass are confirmed **still in
place, unmodified**:

| Fix | Location | Status |
|---|---|---|
| `/api/logs` `LIMIT 500` | `api.ts:1225` | present |
| `useLogs` `staleTime: 5 * 60 * 1000` | `queries.ts:136` | present |
| 7× stats polls `refetchInterval: 120000` + `refetchIntervalInBackground: false` | `queries.ts:601-694` | present |
| `System.tsx` `quantumState` via `useState`+`useEffect` (not `useMemo`) | `System.tsx:266-271` | present |
| `SystemProgressWidget` `recomputeAssembly` gated on `!document.hidden` | `SystemProgressWidget.tsx:1557-1564` | present |

No new lag sources found: no interval under 5s outside benign UI
animation (500ms dot pulse in `System.tsx:98`, 1s clock tick in
`TimeWidget.tsx:113`, 100ms breathing animation in `breathe.ts:112` — none
of these touch the network or the DB), and no new unbounded `findAll(`
call sites in `api.ts`.

**What could not be checked here:** actual measured latency (button
press → visible response, sound playback delay, widget mount time) in a
running instance. That requires a live server + database, which this
sandbox does not have. `npm run test:cold-start` is the right tool for
this and should be run in an environment with `DATABASE_URL` and
`TEST_ADMIN_EMAIL`/`PASSWORD` set — recommend running it as a follow-up
in an environment with real credentials rather than trusting this static
pass as a substitute.

---

## 7. Data log of widget usage across the platform

The Log table (`src/server/models/log.ts:26-65`, Sequelize — **not**
Prisma; `prisma/schema.prisma` has no Log model, worth noting since the
repo runs both ORMs) captures `id`, `userId`, `text`, `event`, `metadata`
(JSONB), `context` (JSONB), and timestamps. This is a genuinely
comprehensive **per-user** usage log — every widget interaction that is
correctly wired (§2) lands here with full context.

**Gap:** there is no platform-wide aggregate view. `admin-api.ts` has
maintenance tooling only (empty-log purge, burst-poster detection), not a
"which widgets get used, how often, across all users" dashboard. If the
intent is genuinely a full data log of widget usage *across the LOT
Systems platform* (not just per-user reflection data), that aggregate
layer doesn't exist yet and would need to be built — it isn't a bug, it's
unbuilt scope.

---

## 8. Build health — two pre-existing content bugs surfaced by this scan

`npm run client:build` is GREEN but emits two `esbuild` duplicate-key
warnings in `src/client/utils/badges.ts` that are real content bugs, not
noise:

- `quarter_drop` is defined twice (`badges.ts:3214` — "first easter egg of
  any type unlocked", uncommon — and `badges.ts:5501` — "check in between
  midnight and 1AM", rare). JS object-literal semantics mean the **second
  definition silently wins**; the first is permanently unreachable dead
  content. Any user who should unlock the "first easter egg" badge instead
  gets the midnight-check-in badge's copy and rarity.
- `elixir_found` — same pattern (`badges.ts:4825` uncommon "word-turn"
  badge vs. `badges.ts:6883` rare variant with a longer trigger-word list).

These are pre-existing (not introduced by this scan) and directly touch
the Memory Widget's badge-unlock-toast pipeline described in
`docs/technical/WIDGETS.md`. Not fixed here — picking which definition
survives is a content decision (which badge concept is canonical), not a
mechanical one, so it's left for S-2 rather than guessed.

---

## 9. "15-month month-to-month UI reveal" roadmap — not found as a distinct artifact

No document or code artifact in this repo implements a 15-month gated UI
reveal schedule under that name. The closest existing analog is
`MonthlyPulseWidget.tsx`, which is a **12-month** milestone-message system
(`MONTH_MESSAGES` record, `MonthlyPulseWidget.tsx:18-38`, capped display
at `12` months, `MonthlyPulseWidget.tsx:106-109`) — it shows one message
per elapsed month since signup, not a feature-unlock gate. `About.tsx`'s
"Day 1023+" style counters are also elapsed-time displays, not a reveal
schedule.

Marked **PROVISIONAL / open question for S-2**, per the benchmark
protocol's honesty rule: rather than invent a 15-month structure to match
the request, this scan reports that it does not exist yet in code. If a
15-month reveal cadence is the intended design, it would need its own
gating logic (likely alongside `featureUnlocks`/evolution-dimension
unlocks in `InterfaceEvolutionWidget`), and `MonthlyPulseWidget`'s 12-month
cap would need to be reconciled with it (currently the two would disagree
about when the "journey" is considered complete).

---

## 10. On the "monk lifestyle / transparent system" framing

The task frames LOT AI as a way to "maintain a pure and transparent
lifestyle." The one place code and that framing directly intersect is
§5/§8 above: every silently-dropped log event or silently-collided badge
is a small transparency failure — the system told the user (via the
Memory/Narrative/Badge widgets) that an action was recorded or an
achievement earned, and in these specific cases it either wasn't, or
wasn't the one displayed. Closing the gaps in §2, §5, and §8 is the
concrete, non-philosophical way this codebase can get closer to the
"transparent lifestyle" goal — recorded here as an engineering
consequence of the framing, not dressed up as more than that.

---

## Summary table

| # | Area | Verdict |
|---|---|---|
| 1 | Widget inventory / classification | OK |
| 2 | Interactive widget → Log wiring | GAP — QuantumSignWidget fully unwired; Subscribe/MonthlyPulse dismiss-only gaps (low stakes) |
| 3 | LOT AI / System tab / Portrait | DRIFT — two divergent profile data paths, no unified Portrait page |
| 4 | QIE / Memory / Story | OK — one architectural nuance (QIE≠Log write path) worth documenting |
| 5 | Log write→read completeness | GAP — 4 new silently-dropped event types; ~35 dead formatter branches |
| 6 | Loading speed / lag (static) | OK — no regression from SR-20260719-01; live measurement deferred (no DB in this env) |
| 7 | Platform-wide usage log | GAP — per-user log is solid; no aggregate dashboard exists |
| 8 | Badge registry integrity | GAP — 2 duplicate badge keys, pre-existing, silently collide |
| 9 | 15-month UI reveal roadmap | NOT FOUND — flagged as open question, not fabricated |

*Vadik*
*lot-systems.com/u/vadik*
