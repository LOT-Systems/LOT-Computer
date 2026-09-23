# LOT Self-Assembly Session Report
## 2026-09-23 | Astrology Widget — Personalization + Widget Sync | v2

**Branch:** `claude/practical-curie-auscmc`
**Base commit:** `98971f2`
**COSMO Gate:** Kuzya Cosmo Marmeladov — monitoring
**Session type:** Automated / Scheduled (recurring routine)
**Live site access:** not attempted — all work sourced from repo inspection
**Prior session:** `docs/assembly/2026-07-27_LOT-assembly_astrology-widget-personalization-sync.md`

---

## MISSION BRIEF

Same standing recurring instruction as the prior session: continue evolving
the Astrology block (today's zodiac hour, moon phase, rokuyo — ambient
conditions, not a personal natal chart) for user personalization and
synchronization with other widgets, keep it synchronized with Logs entries,
and push a full understanding + features breakdown document each session.

---

## PHASE 0 — ORIENTATION / UNDERSTANDING

Re-read the feature live rather than trusting the prior doc's map alone
(cardinal rule: discover, don't assume). A dedicated research pass confirmed
the prior session's map was accurate, then found what it left open:

**The prior session's own PENDING / FUTURE WORK list (still open at start of
this session):**
1. Author a QIE pattern combining `astrology` + `goals`/`intentions` (e.g. a
   nudge on Taian/auspicious days) — explicitly deferred to "a dedicated
   self-assembly pass."
2. Client dashboard should read `user.timeZone` instead of device-local time
   — the server-side Logs snapshot was already timeZone-aware, the dashboard
   wasn't.
3. `getJapaneseZodiac`/`getMoonEmoji` remain unused — noted as candidates for
   a future personalization pass, out of scope while ambient-only.

**One thing the prior doc didn't catch, found this session:** the daily
`system_snapshot` Log — the only place `Logs.tsx`'s `ASTRO:`/`POS:`/`TMP:`/
`HUM:` lines are meant to render from — has *always* been created with
`context: {}` in `executeDailyOSSnapshotJob()` (`src/server/scheduled-jobs.
ts`). The July 27 session correctly wired `getLogContext()` to snapshot
astrology onto every *other* log-creation path, but this one scheduled job
was never updated to call it, so the astrology-in-Logs feature has been
silently inert for that specific (highest-volume, once-daily-per-user) event
type since it shipped.

Also confirmed: the `WIDGET_DEPENDENCY_MAP` entries added in July (`astrology`
as a dependency of `system`/`cosmic`) are documentation, not live pub-sub —
`getWidgetsDependingOn()` has no real call site. The mechanism that *does*
work is `QuantumEngineWidgets.tsx` reading `useStore(intentionEngine)` and
rendering `.recognizedPatterns` through a `PATTERN_DISPLAY` lookup — that's
where a new pattern needs to land to actually reach a widget.

---

## PHASE 1 — BUILD

### 1. TimeZone personalization (closes PENDING item 2)

The wall-clock trick from `getLogContext()` (`src/server/utils/logs.ts`) —
building a plain `Date` from a `.tz()`'d moment's wall-clock fields so every
`getHours()`/`getMonth()`/`getDate()` reader downstream sees the target
timeZone's local time — was server-only. Promoted it to
`toWallClockDate()` in `src/shared/utils/astrology.ts`, duck-typed on the
moment shape so `shared/` stays dayjs-free. `logs.ts` now imports it instead
of keeping a private copy.

Client `dayjs` (`src/client/utils/dayjs.ts`) gained the `timezone` plugin
(previously loaded server-side only). `System.tsx`'s `astrology` useMemo now
resolves `profile?.timeZone ? dayjs().tz(profile.timeZone) : dayjs()` and
runs it through `toWallClockDate()`, same as the server. Dependency array
extended to `[astrologyTick, profile?.timeZone]`. Net effect: a user viewing
the dashboard from a device set to a different timeZone than their saved
profile now sees the same ambient reading the server snapshots into their
Logs, instead of two silently-disagreeing readings.

### 2. Auspicious-day surface (widget evolution)

Both render sites (the compact layout block and the cycling Astrology /
Psychology / My Journey / Biofield block) now show an "Auspicious" tag when
`rokuyo === 'Taian'`. This is the first personalization signal the block has
surfaced beyond raw computed text — previously `auspicious` only existed
inside the QIE signal metadata (`recordAstrologySignal`), invisible in the UI
itself.

### 3. Pattern 152 — Auspicious Alignment (closes PENDING item 1)

Added to `analyzeIntentions()` in `src/client/stores/intentionEngine.ts`,
following the existing pattern convention (P110-P151): fires when an
`astrology` signal with `metadata.auspicious === true` and at least one
`goals` or `intentions` signal both land on the same calendar day. Confidence
`0.60 + 0.05` per corroborating goal/intention signal, capped at `0.78` —
deliberately modest, since this is a thin correlation, not a strong arc like
the multi-source patterns it sits next to. The `reason` string is explicit
that the ambient reading is *noted, not causal* — matching the standing
instruction's framing (ambient conditions, not fate) and this repo's honest-
engineering doctrine (no dressed-up philosophy from date math).

Registered `'auspicious-alignment': 'AUSPICE'` in `QuantumEngineWidgets.
tsx`'s `PATTERN_DISPLAY` map — confirmed this widget already does
`useStore(intentionEngine)` and renders `recognizedPatterns` for real, so
this is a working synchronization path, not another declarative-only map
entry.

### 4. Logs synchronization bug fix

`executeDailyOSSnapshotJob()` now calls `getLogContext(user)` instead of
passing `context: {}`, bringing the daily `system_snapshot` row in line with
every other log-creation site. This is the fix that actually makes astrology
(and weather/location) show up in the journal's `SYS:` block for the one
event type where it never had a chance to.

### Deliberately not done this session

The research pass surfaced a second, larger gap: `/quantum-intent/sync`
bulk-inserts raw signals as `event: 'quantum_intent_signal'`, but that event
isn't in `/api/logs`'s `displayableEvents` allowlist, so those rows are
written but never shown. Separately, `event: 'pattern_detected'` has a live
`Logs.tsx` renderer but nothing in the codebase ever creates one — every
pattern from P110 onward instead reaches the journal via its own dedicated
background-job event name. P152 currently reaches only the client-side
`QuantumEngineWidgets` surface, the same as every pattern that doesn't yet
have a background-job companion. Giving it (and the two dead code paths
found) a server-side counterpart is real, pre-existing QIE/Logs pipeline
debt — sizing and fixing it belongs to a dedicated pass, not folded into a
widget-evolution session.

---

## PHASE 2 — TEST

`node_modules` was absent at session start; restored via
`npm install --legacy-peer-deps` (same pre-existing peer-version workaround
noted in the prior session, unrelated to this session's changes).

```
npm run server:build   -> PASS (tsc --project tsconfig.server.json)
npm run client:build   -> PASS (postcss + esbuild client bundle)
```

Clean gate on the first pass. Two pre-existing esbuild warnings (duplicate
`quarter_drop`/`elixir_found` keys in `src/client/utils/badges.ts`) are
unrelated to this session's files.

---

## PHASE 3 — FEATURES BREAKDOWN (current Astrology feature state, post-session)

- **Inputs:** zodiac hour, Western zodiac sign, rokuyo (six-day auspicious
  cycle), moon phase + illumination % — pure date-math, no external API, no
  personal birth data.
- **Personalization anchor:** ambient reading is now timeZone-aware
  end-to-end — client dashboard, server Logs snapshots, and the daily
  `system_snapshot` job all resolve through the same shared
  `toWallClockDate()` helper against the user's saved `timeZone`, falling
  back to device-local time only when no profile timeZone is set.
  Birth-data personalization remains explicitly out of scope (ambient, not
  natal) — no `birthDate`/`birthTime`/`birthPlace`/`latitude`/`longitude`
  field exists anywhere in the `User` model.
- **Freshness:** unchanged from the prior session — recomputes every 15
  minutes while the tab is visible, paused off-tab.
- **Widget synchronization:** the astrology QIE signal (with its
  `auspicious` flag) now feeds a real pattern — `auspicious-alignment`
  (P152) — that a working, already-subscribed widget
  (`QuantumEngineWidgets.tsx`) renders live when it fires, alongside a
  direct "Auspicious" tag on the astrology block itself. `WIDGET_DEPENDENCY_
  MAP`'s `astrology → system/cosmic` entries remain documentation-only, as
  found — not corrected this session, since making them live would mean
  wiring real signal consumption into `System.tsx`/`CosmicUpdateWidget.tsx`
  directly, a larger change than this pass's scope.
- **Logs synchronization:** every new log entry's `context` JSONB snapshot
  includes the ambient astrology reading at creation time — and, as of this
  session, that is actually true for the daily `system_snapshot` row too,
  not just the ~17 other log-creation sites that already worked.
- **Not implemented (by design, per standing instruction):** any personal
  natal-chart data (birth date/time/place, sun/moon/rising sign) — the
  feature remains strictly ambient/environmental.
- **Known debt (documented, not fixed):** raw QIE signal sync writes Log
  rows the main journal feed never displays; the `pattern_detected` event
  type has a renderer but no writer anywhere in the codebase.

---

## PHASE 4 — DEPLOY

```
Branch: claude/practical-curie-auscmc
Files changed: 9
  src/shared/utils/astrology.ts                MODIFIED
  src/server/utils/logs.ts                     MODIFIED
  src/server/scheduled-jobs.ts                 MODIFIED
  src/client/utils/dayjs.ts                    MODIFIED
  src/client/components/System.tsx             MODIFIED
  src/client/stores/intentionEngine.ts         MODIFIED
  src/client/components/QuantumEngineWidgets.tsx MODIFIED
  docs/benchmark/LOT-SR-20260923-01.md         ADDED
  docs/assembly/2026-09-23_LOT-assembly_astrology-widget-personalization-sync.md  ADDED
```

---

## PENDING / FUTURE WORK

- Give `auspicious-alignment` (P152) a server-side background-job companion
  (dedicated event name + `displayableEvents` entry) so it reaches the
  journal, matching how P110-P151 all work — it currently only reaches the
  live `QuantumEngineWidgets` surface.
- Investigate whether `/quantum-intent/sync`'s raw `quantum_intent_signal`
  rows should be added to `displayableEvents`, or whether that path is
  intentionally admin/audit-only — currently ambiguous, written but unread.
- `pattern_detected` has a live renderer and zero writers anywhere in the
  codebase — either wire a writer or treat it as dead code to remove.
- `getJapaneseZodiac`/`getMoonEmoji` still unused; still a candidate for a
  future opt-in "birth year animal" personalization pass, still out of scope
  while the feature stays ambient-only.
- Consider whether `WIDGET_DEPENDENCY_MAP` should become live pub-sub
  (`getWidgetsDependingOn()` actually gating something) or should be
  re-labeled as the audit-trail-only document it currently functions as, to
  stop future sessions reading it as working synchronization.

---

*LOT Self-Assembly Engine — automated session*
*COSMO Gate status: monitoring*
