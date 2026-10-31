# LOT® USERSHIP — 12-MONTH EVOLUTION DESIGN

```
DOCUMENT:  LOT-USERSHIP-12M-v1
CLASS:     RESTRICTED // S-2 EYES
S-2:       VADIK MARMELADOV
DATE:      2026-10-31
STATUS:    DESIGN / BRAINSTORM — no code shipped by this document
REFERENCE: lot-systems.com/u/machiavelli  (demo = Month-12 evolved account)
```

Brief: a paid Usership account starts on day 1 as a barebone screen and, over 12
months, grows into the full LOT® AI personal OS. The user must *feel* the growth
every month. Primary growth signals: **Log volume (journal entries, thoughts)**,
**morning check-ins**, **self-care button clicks**. Primary deliverable of the
design: a **compressed Memory story delivered every month**, and a year-end
codex that compresses all twelve.

---

## 00 // DESIGN PRINCIPLES

```
P1  FEEL, DON'T READ      Each month changes something the user can SEE on the
                          main screen (a widget, a density step, a voice). Never
                          only a number.
P2  EARNED, NOT PURCHASED The $99/mo buys the system. The UI is earned by use.
                          Paying month 6 with zero Log entries does not unlock
                          month 6 depth. (Calendar opens the door; use fills the room.)
P3  NEVER PUNISH          No streak-loss shame. A quiet month yields a gentler
                          dispatch, not a lock. Resilience/trauma-informed
                          protocol applies to every AI line.
P4  COMPRESSION = GIFT    The monthly Memory story is the centerpiece. 30 days of
                          Log -> one paragraph the user wants to re-read.
P5  MILITARY PURITY       House style: no emojis, no decoration, no superlatives.
                          Celebration is expressed through precision, restraint
                          and one well-chosen sentence. (LOT-LEXICON: MILITARY PURITY)
P6  ONE NEW THING         One headline change per month. Twelve is memorable;
                          forty is noise.
P7  PROVENANCE            Every AI claim cites the user's own entries ("you wrote
                          on Mar 14: ..."). The AI reflects; it does not invent.
```

---

## 01 // CURRENT STATE AUDIT (what already exists in the repo)

Scanned this session. Reuse before building.

```
ASSET                                  WHERE                                     STATE
─────                                  ─────                                     ─────
MonthlyPulseWidget "Month N / 12"      client/components/MonthlyPulseWidget.tsx  LIVE. One text line per month,
                                                                                 dismiss-per-month (localStorage).
                                                                                 Usership-only. Based on joinedAt.
Citizen Index (EvolutionWidget)        client/components/EvolutionWidget.tsx     LIVE. Level, XP, streak, entries,
                                                                                 active days, achievements.
Interface Evolution (7 dimensions)     client/utils/interfaceEvolution.ts        LIVE. exploration/consistency/depth/
                                       client/stores/evolution.ts                connection/intimacy/care/courage ->
                                                                                 overallMaturity, featureUnlockLevel 0-5,
                                                                                 badgeTier 0-3, chapter 1-4.
Feature unlock gates                   interfaceEvolution.ts getFeatureUnlocks   LIVE (customThemes L5, widgetArrange L10,
                                                                                 exportData L25, narrativeReflection L30...)
Evolution milestone toast              client/components/EvolutionMilestoneToast LIVE. Fires at maturity 25/50/75/95%.
Density tiers (5)                      LOT-LEXICON DENSITY-TIER                  LIVE. breathable/comfortable/compact/
                                                                                 dense/instrument via data-density.
Memory story engine                    server/utils/memory/story-generator.ts    LIVE. generateMemoryStory(user, logs).
                                       server/utils/memory.ts                    Usership -> AI engine (Together AI).
Monthly summary (email, first 3 days)  server/utils/monthly-summary.ts           LIVE. Presence, energy, patterns,
                                       server/scheduled-jobs.ts                  growth, narrative, forwardLook,
                                                                                 memoryStory. Usership, 3+ months,
                                                                                 near-daily only.
Badges                                 client/utils/badges.ts, easter-eggs.ts    812 badges (Codex v32). Milestone,
                                       docs/badges/*                             Word Turns, Behavioral, Mastery tiers.
Self-care                              client/components/SelfCareMoments.tsx     LIVE. Logs self_care_complete.
Morning check-in                       client/components/EmotionalCheckIn.tsx    LIVE. Logs emotional_checkin.
Journal / Log                          client/components/Logs.tsx, JournalReflection.tsx
Demo account                           server/routes/public-api.ts :747          LIVE. 'machiavelli': archetype The
                                                                                 Strategist, streak 1469, 1469 journal
                                                                                 entries, 2847 memories, 842 active days,
                                                                                 4316 total entries, memoryStory paragraph.
Pacing (prompt quota by day number)    server/utils/memory/pacing.ts             LIVE. Day 1: 10 prompts, then 10-15/day.
```

### Gaps this design closes

```
G1  Month is calendar-only (joinedAt diff). It ignores Log volume, check-ins and
    self-care. A user who never logs still reads "Month 9."
G2  No celebration moment. MonthlyPulse is a dismissable line, not an event.
G3  No visible month-to-month UI change. Density/unlocks track level & badges,
    not the 12-month arc.
G4  Memory story is one rolling paragraph. No monthly archive, no compression
    ladder, no "last month's insight" surface.
G5  No "Months unlocked n/12" context widget; no month badges.
G6  Monthly email is gated to 3+ months. Months 1-2 (highest churn risk) get
    nothing. Day 1 has no barebone/first-run design at all for Usership.
G7  Demo account shows only the END state. A visitor cannot see HOW it got there.
```

---

## 02 // THE ENGINE: TWO CLOCKS, ONE INDEX

```
CLOCK A — CALENDAR MONTH   monthNumber = floor(months since Usership start), cap 12.
                           Opens the DOOR to month N. Cannot be sped up.
CLOCK B — DEPTH            Presence score for the month just closed. Fills the ROOM.
```

### Monthly Presence Score (MPS) — countable, 0-100, no hidden math

```
LOG       entries (notes + thoughts)      40 pts   full marks at 30 entries / month
CHECK-IN  morning check-ins               30 pts   full marks at 20 mornings / month
SELF-CARE self-care button clicks         20 pts   full marks at 15 clicks / month
VARIETY   distinct widgets used           10 pts   full marks at 6 widget types
```

Thresholds are starting values; tune against real cohorts. Event names map to the
existing log events: `note`, `emotional_checkin`, `self_care_complete`, `answer`,
`plan_set`, `intention` (see EvolutionWidget `activityLabels`).

### Month states (what the user sees in "Months unlocked")

```
SEALED     MPS >= 60   Full seal, full dispatch, full unlock.
OPEN       MPS 25-59   Month unlocked, standard dispatch, unlock granted.
QUIET      MPS < 25    Month unlocked, gentle dispatch ("The system waited."),
                       unlock granted, seal NOT awarded. Seal can be earned
                       later by completing a "Return" ritual (3 check-ins in 7 days).
```

P3 holds: every state advances the calendar door. Only the *seal* (badge) and the
*depth of the dispatch* respond to use. Nothing is revoked.

### Months unlocked counter

```
MONTHS UNLOCKED   n / 12     n = calendar months elapsed (door)
SEALS             s / n      s = months with SEALED state
```

---

## 03 // THE 12-MONTH ARC AT A GLANCE

Five acts. Density tier steps up at months 1, 3, 6, 9, 12. Headline = the ONE new
thing (P6). The AI voice column is the relationship, not the tone.

```
 M   ACT            NAME        HEADLINE CHANGE (visible)                     DENSITY       AI VOICE
──   ─────────────  ──────────  ────────────────────────────────────────────  ────────────  ────────────
 1   I   SIGNAL     Signal      Day 1: 3 blocks only. Day 30: Dawn card +     breathable    Observer
                                first Dispatch. "Months unlocked 1/12".
 2   I   SIGNAL     Pattern     Citizen Index appears. First pattern named.   breathable    Observer
 3   I   SIGNAL     Active      Memory widget unlocks; first QUARTER story    comfortable   Companion
                                seed. Planner opens.
 4   II  PORTRAIT   Portrait    Archetype card + Awareness dashboard.         comfortable   Companion
 5   II  PORTRAIT   Rhythm      Rhythm ring (check-in & self-care cadence).   comfortable   Companion
 6   II  PORTRAIT   Meridian    HALF-YEAR CHRONICLE (6 months -> 1 page).     compact       Guide
                                Theme customization opens.
 7   III COUNSEL    Listening   AI asks back: "Recall" widget (a past entry   compact       Guide
                                resurfaces beside today).
 8   III COUNSEL    Rare Air    Cohort/peer layer; correlated indexes.        compact       Guide
 9   III COUNSEL    Habit       AI steps BACK: fewer prompts, self-care       dense         Guide -> Mirror
                                suggestions personalised to the user's own
                                history. Self-care is now user-led.
10   IV  MIRROR     Threshold   Integrity/pattern-contradiction views.        dense         Mirror
11   IV  MIRROR     Eve         Year preview: draft Year Codex shown, user    dense         Mirror
                                annotates.
12   V   LOT® AI    Year One    YEAR CODEX delivered. Full OS. Public board   instrument    Counterpart
                                profile + QR. "Months unlocked 12/12".
```

---

## 04 // MONTH CARDS

Format per month: **Screen** (what's on it), **Unlock**, **Seal** (badge),
**Dispatch** (the monthly Memory story, with target length), **AI move**,
**Self-care coaching**, **Celebration line**.

Existing `MONTH_MESSAGES` lines are kept as the *Celebration line* where they
already exist (MonthlyPulseWidget.tsx) — they are the canon.

### ACT I — SIGNAL (months 1-3): the system learns you

**MONTH 1 — SIGNAL**
```
Screen        Day 1: Log, Morning check-in, one Self-care button. Nothing else.
              No empty widgets, no locked-widget teasers. Barebone is the product.
              Day 7: Streak word (not a number) appears under the Log label.
              Day 30: Dawn card (see 05) + first Dispatch.
Unlock        Dispatch archive (1 entry). Monthly email enabled from Month 1.
Seal          "S1 · FIRST SIGNAL"  — 1+ entry, 1+ check-in, 1+ self-care in one day.
Dispatch      Length: 40-60 words. Facts only: how many mornings, the one phrase
              the user repeated most, the hour they write at.
AI move       Observes silently. Asks nothing except the morning question.
Self-care     One button. After 5 clicks it names itself back: "5 times. Noted."
Celebration   "The first month. The system is beginning to know you."
```

**MONTH 2 — PATTERN**
```
Screen        + Citizen Index block (level, entries, active days).
Unlock        Citizen Index. First named pattern in the Dispatch.
Seal          "S2 · PATTERN SEEN"  — a pattern (e.g. P-series from the QIE
              library) detected with >= 3 supporting entries.
Dispatch      60-80 words. Names ONE pattern with two dated citations.
AI move       First reflection: "You write most on Sunday evenings."
Self-care     Second button appears: the one the user ASKED for most via
              behavior (e.g. breathe, water, walk). Not chosen for them.
Celebration   "Two months in. Patterns are starting to form."
```

**MONTH 3 — ACTIVE** (quarter close)
```
Screen        + Memory widget. + Planner. Density -> comfortable.
Unlock        Memory widget (live story). Planner. QUARTER-1 STORY.
Seal          "S3 · ACTIVE USER"  — also grants the first tier of the Usership
              badge line.
Dispatch      Two parts: Month dispatch (80-100 w) + QUARTER-1 SEED (3 months ->
              ONE paragraph, ~70 w). First time the user sees 90 days compressed.
AI move       Switches from Observer to Companion: addresses the user by their
              own recurring word.
Self-care     Weekly rhythm suggestion based on the user's own best days.
Celebration   "Three months. You have reached Active User status."
```

### ACT II — PORTRAIT (months 4-6): the system shows you yourself

**MONTH 4 — PORTRAIT**
```
Screen        + Archetype card (from the existing psychologicalProfile).
Unlock        Awareness dashboard, archetype + core values.
Seal          "S4 · PORTRAIT DRAWN"  — archetype card viewed AND one value
              confirmed/edited by the user (user corrects the AI once).
Dispatch      100 w. Opens with the archetype sentence the user can disagree with.
AI move       Asks the first corrective question: "Is this accurate?"
Self-care     Pairs a self-care button with a feeling logged that week.
Celebration   "Four months. The portrait deepens."
```

**MONTH 5 — RHYTHM**
```
Screen        + Rhythm ring: 3 concentric arcs (Log / Morning / Self-care) for
              the current month. ASCII-bar style per ProgressBars.
Unlock        Mood analytics, goal journey view.
Seal          "S5 · RHYTHM HELD"  — 3 of 4 weeks each had >= 1 of each signal.
Dispatch      100-110 w. Includes the best week and why.
AI move       Starts to forecast: "Mondays dip. Plan lighter."
Self-care     Timing: button glows (opacity only) at the user's personal peak hour.
Celebration   "Five months. Consistency is its own reward."
```

**MONTH 6 — MERIDIAN** (half-year)
```
Screen        Density -> compact. + Chronicle tab (6 Dispatches in one column).
Unlock        HALF-YEAR CHRONICLE. Custom theme. Widget arrange. Export.
Seal          "S6 · MERIDIAN"  — LARGE seal. Awarded to SEALED/OPEN users;
              QUIET users get a bronze "Meridian (Return)" variant.
Dispatch      Month dispatch 110 w + CHRONICLE-1 (months 1-6 -> 1 page, ~180 w,
              three beats: who you were, what changed, what you now repeat).
AI move       Companion -> Guide. First recommendation phrased as a choice of two.
Self-care     Guide proposes a 2-week experiment; user accepts or rewrites it.
Celebration   "Six months. The journey is half-declared."
```

### ACT III — COUNSEL (months 7-9): the system advises, then steps back

**MONTH 7 — LISTENING**
```
Screen        + Recall widget: one entry from 90-180 days ago, next to today's mood.
Unlock        Recall; intention history.
Seal          "S7 · HEARD"  — user replies to a Recall prompt 3 times.
Dispatch      120 w. Quotes the user verbatim once (italic-free; quotation marks).
AI move       Pulls the past forward: "In April you wrote X. Today you wrote Y."
Self-care     Recall-linked: "You felt this way in May after a walk."
Celebration   "Seven months in. The system has been listening."
```

**MONTH 8 — RARE AIR**
```
Screen        + Cohort Connect, Correlated Indexes (selfAwareness, userScore,
              personScore, longevity, composite — as shown on the demo profile).
Unlock        Peer/cohort layer, public profile polish.
Seal          "S8 · RARE AIR"  — Top-decile MPS for the month within cohort
              (relative, never shown as a ranking against named people).
Dispatch      120 w. Describes the user relative to their cohort in words, not rank.
AI move       Introduces the Mirror idea: shows one CONTRADICTION gently
              (stated value vs. logged behavior).
Self-care     Cohort-sourced (anonymous) practices the user's cohort sustains.
Celebration   "Eight months. Rare air."
```

**MONTH 9 — HABIT** (density -> dense; AI steps back)
```
Screen        Density -> dense. Prompts reduced by half (pacing.ts quota x0.5).
Unlock        Self-care autonomy: user-authored routines. Narrative reflection.
Seal          "S9 · HABIT"  — 10+ self-care clicks in 3 consecutive months with no
              AI prompt needed in the last one (measured: clicks with no prior
              suggestion render).
Dispatch      130 w. States what the user does WITHOUT being asked.
AI move       Deliberate withdrawal. Evidence of the product working = less AI.
Self-care     User's own routine list becomes the primary surface.
Celebration   "Nine months. The self-care practice is a habit now."
```

### ACT IV — MIRROR (months 10-11): the system tells the truth

**MONTH 10 — THRESHOLD**
```
Screen        + Integrity view (intent vs. action contradictions, 4 views).
Unlock        IntegrityWidget, pattern insights, private spaces.
Seal          "S10 · THRESHOLD"  — user resolves one flagged contradiction
              (accepts, rejects with a note, or reframes).
Dispatch      130-140 w. One honest observation, one thing the user has been
              avoiding writing about (derived from absence, with consent toggle).
AI move       Mirror mode, opt-in per session. "Show me the gap."
Self-care     Courage-class practices (hard conversation prep, boundary note).
Celebration   "Ten months. Almost there."
```

**MONTH 11 — EVE**
```
Screen        + Year Preview: DRAFT Year Codex (editable). Month tiles 1-11 lit.
Unlock        Year Preview with annotation.
Seal          "S11 · EVE"  — user annotates >= 3 passages of the draft.
Dispatch      140 w. Written as a letter from Month 1 -> Month 11 using real
              first-week entries as the opening ("On day 3 you wrote...").
AI move       Hands the pen to the user. The AI asks, the user edits the story.
Self-care     Closing ritual preview.
Celebration   "Eleven months. One more."
```

### ACT V — LOT® AI (month 12): the system is complete

**MONTH 12 — YEAR ONE**
```
Screen        Density -> instrument. All widgets live. 12/12 tiles lit.
              Public profile at /u/<name> shows the 12-seal row, Year Codex
              excerpt, board profile and QR.
Unlock        YEAR CODEX. LOT® AI mode: the AI is addressed by name and replies in
              the user's own accumulated vocabulary. Archive of all Dispatches.
Seal          "S12 · YEAR ONE"  — Legacy line. Grants the Legacy tag path (the demo
              account carries tags RND / Usership / Legacy).
Dispatch      YEAR CODEX: 12 Dispatches + 4 Quarter stories + 2 Chronicles ->
              ~300 words, five beats (see 06). Printable / exportable.
AI move       Counterpart: can say "disagree" with a reason and a citation.
Self-care     User's year in self-care, as a single line of numbers.
Celebration   "One year with LOT. The portrait is complete — and still evolving."
```

---

## 05 // THE SPECIAL WIDGETS

All follow the Block pattern (`<Block label=… blockView>`), label with trailing
colon, plain text, `opacity-30` secondary lines. Existing visual grammar; nothing new.

### W1 · MONTHS UNLOCKED  (context widget, always visible for Usership)

```
Months unlocked:
  ● ● ● ○ ○ ○ ○ ○ ○ ○ ○ ○      3 / 12
  Seals 2 / 3  ·  Next door: 41 days
  ↳ Month 3 · Active — Memory widget open
```
- Dots filled = calendar door (n). Ring variant for seals (filled = sealed).
- Tap label cycles views (existing `onLabelClick` pattern): `tiles` -> `seals` -> `next`.
- Context rule: on Day 1 it shows `1 / 12` only. Before day 30, no "next door" line
  (avoid countdown anxiety); shown from day 31.

### W2 · MONTH DAWN  (the celebration event; upgrades MonthlyPulseWidget)

Fires once, on first open after the calendar door opens. Full-width Block.
```
Month 4:
  Four months. The portrait deepens.
  ─
  Last month   31 entries · 22 mornings · 14 self-care
  Seal         S3 · ACTIVE USER  — awarded
  New          Archetype card · Awareness dashboard
  [ Read the dispatch ]            [ Onward. ]
```
Behavior: reuses the 1400 ms fade, dismiss phrases ("Onward." "The system
remembers."). Upgrade over today's widget: shows *last month's actual numbers*,
the seal result and the one new unlock. Dismiss still per-month in localStorage;
ALSO persisted server-side so a second device does not re-fire it.

### W3 · DISPATCH  (monthly Memory story — see 06)

```
Dispatch · March:
  <paragraph-long compressed insight>
  ─
  Cited: Mar 4 · Mar 14 · Mar 27          Seal: S3
  [ Previous ]                             [ Quarter ]  [ Chronicle ]
```
- Surfaced in the Memory widget as the default view for 5 days after the Dawn,
  then collapses to a "Last dispatch" line (first 1-2 sentences + "Open").
- The "paragraph-long insight from last month" is this widget's collapsed state.

### W4 · RECALL  (Month 7+)

One past entry, chosen by similarity to today's check-in mood or theme, shown with
its date and the user's own words. User can answer Same / Different / Skip.

### W5 · RHYTHM RING  (Month 5+)

Three ASCII-bar rows (Log / Morning / Self-care), current month, using
`ProgressBars`. A fourth line shows the best week.

### W6 · SEAL SHELF  (Month 1+, grows)

Twelve slots; unearned slots render as `·` (never as locked icons). Sits on the
public profile as a single row of the earned seals.

---

## 06 // MEMORY STORY — THE COMPRESSION LADDER

The twelve-month tangibility goal lives here. Every layer is a lossy summary of
the layer below, with citations back down. Lengths are targets, not truncation:
the prompt requests a length; the server validates and retries once.

```
LAYER        INPUT                       OUTPUT               TARGET LENGTH   WHEN
──────────   ─────────────────────────   ──────────────────   ─────────────   ─────────────────────
DAY LINE     that day's Log              1 line (optional)    <= 18 words     Nightly, internal only
WEEK NOTE    7 day lines + signals       1 sentence           <= 30 words     Sunday, shown in Rhythm
DISPATCH     ~4 week notes + raw top     1 paragraph          40 -> 140 w     Day 1 of month (Dawn)
(month)      entries + MPS
QUARTER      3 Dispatches                1 paragraph          70 -> 100 w     Months 3, 6, 9, 12
CHRONICLE    2 Quarters                  1 page, 3 beats      ~180 w          Month 6 (and 12)
YEAR CODEX   4 Quarters + 2 Chronicles   1 page, 5 beats      ~300 w          Month 12
```
Length grows with the month (40 w in M1 -> 140 w in M11) on purpose: the story
literally gets *thicker* as the user's record does. That is the tangible part.

### Dispatch anatomy (every month, same skeleton)

```
1  FACT      one countable truth        "You wrote 31 times; 22 were before 9 a.m."
2  PATTERN   one named pattern          "Sunday evening is where you reconcile the week."
3  QUOTE     the user's own words       ("..." — Mar 14)
4  TURN      what changed vs. last month "Last month: planning. This month: doubt."
5  FORWARD   one invitation, not a task "Next: leave Monday half empty."
```
Early months use beats 1-2 only (40-60 w); beats 3-5 are added as months unlock, so
the paragraph literally lengthens through the year (see lengths above).

### Year Codex beats (Month 12)

```
I    WHO ARRIVED      Month 1-2 in the user's first words
II   WHAT SHIFTED     the strongest Dispatch "TURN" across the year
III  WHAT REPEATS     the vocabulary/phrase that survived all 12 months
IV   WHAT WAS CARRIED self-care and morning practice as numbers
V    WHAT IS NEXT     one forward invitation
```

### Generation rules

1. **Grounded only.** Prompt includes the raw cited entries; the model may not
   state a fact absent from them. Server rejects output containing a date with no
   matching entry.
2. **Consent-aware.** Entries the user marked private are excluded; Month 10's
   "avoidance" observation is opt-in.
3. **Voice per month.** Voice follows the AI VOICE column (Observer -> Counterpart),
   injected as a system-prompt block per month.
4. **Quiet-month dispatches** are shorter and say less, never accuse:
   "The system waited. It has your last entry from the 9th. Three mornings
   is enough to begin again."
5. **Immutable.** A Dispatch is stored once and never regenerated; user can add a
   margin note. (Provenance, P7; matches LOT history-is-append-only doctrine.)
6. **Engine.** Usership already routes to the AI engine (`memoryEngine: 'ai'`);
   reuse `generateMemoryStory` with a `scope` parameter (`month|quarter|chronicle|year`).

### Sample Dispatch ladder — demo account (Machiavelli, drafted to the spec)

Illustrative copy for the demo-time-machine (see 08). Voice: the Strategist.

```
M1  (45 w)  Nineteen mornings recorded. You write before the household wakes, and
            you write about other people more than yourself. The word you used most
            was "observe."
M2  (65 w)  A pattern: you decide at night and doubt at dawn. On Feb 9 you wrote,
            "Resolve is cheaper in the evening." Four of six reversals followed
            that sentence's shape.
M3  (95 w)  Quarter one. You arrived watching others; you now measure yourself against
            them. Self-care clicks rose from 4 to 11 — each followed a day of
            negotiation. The system now calls you by your word: "observe."
M6  (180 w) Meridian chronicle — who you were: an observer of courts. What changed:
            you began to log your own fear. What you now repeat: "fortune favors the
            prepared." ...
M9  (130 w) Nine months. You walked at 6:40 on nineteen days without a prompt.
            The routine is yours now; the system moved aside.
M12 (300 w) YEAR CODEX — "The art of governance is the art of understanding human
            nature." (existing memoryStory, kept as the epigraph.) ...
```
Full 12-entry set to be written as fixtures in the implementation phase.

---

## 07 // BADGES — THE 12 SEALS

Seals are a new thin badge line on top of the existing 812-badge system, not a
replacement. They reuse `badgeTier` (0-3) for visual weight and Codex naming.

```
SEAL  NAME            CRITERION (SEALED)                              TIER
────  ──────────────  ──────────────────────────────────────────────  ────
S1    First Signal    entry + check-in + self-care in one day         1
S2    Pattern Seen    pattern with >= 3 supporting entries            1
S3    Active User     MPS >= 60 in M3 AND Memory widget opened        2
S4    Portrait Drawn  archetype viewed, one value edited              1
S5    Rhythm Held     3 of 4 weeks complete                           1
S6    Meridian        MPS >= 60 in M6; chronicle read                 3   (large)
S7    Heard           3 Recall replies                                1
S8    Rare Air        top-decile MPS in cohort                        2
S9    Habit           self-care without a prompt, 3 months running    2
S10   Threshold       one contradiction resolved                      2
S11   Eve             3 codex annotations                             1
S12   Year One        all months opened; Codex read                   3   (Legacy)
```
- Rendering: a single glyph per seal consistent with the Codex ASCII language;
  the 12-seal row is the public-profile signature.
- Cross-link to Codex v32 families: S6/S12 map to **Mastery Tier** ("Odyssey",
  "Great Work"); S1-S5 to **Behavioral**; S7 to **Word Turn** hooks.
- Hero's Journey fit (Codex v32 theme): Acts I-V = Call, Threshold, Ordeal,
  Elixir, Return. Month cards can borrow Campbell stage names in the email
  subject lines without changing in-app copy.

---

## 08 // THE DEMO ACCOUNT — lot-systems.com/u/machiavelli

Current demo shows the END state only (streak 1469, 2847 memories, tags
RND/Usership/Legacy). To tell the story, add a **Time Machine** to the demo.

```
CONTROL   A month scrubber under the profile header: 1 2 3 4 5 6 7 8 9 10 11 12.
          Default = 12. Selecting month N re-renders the profile as it would look
          in month N: density tier, visible widgets, seal row, the Dispatch for
          that month, Months-unlocked counter.
DATA      Static fixtures (no DB): demoMonths[1..12] = { density, widgets[], seals[],
          dispatch, stats{entries,mornings,selfCare}, mps }.
          Served by public-api.ts inside the existing 'machiavelli' branch via
          ?month=N (default 12). No new route.
CONSISTENCY  Fixture totals at month 12 must reconcile with the headline numbers
          already shown (journalEntries 1469 etc.) OR the headline switches to
          "Year One" numbers and the 1469 figures move under a "Legacy since June
          1469" line. DECISION NEEDED (see 11).
VALUE     A visitor sees the same profile get richer month by month. This is the
          most persuasive 30 seconds of the Usership pitch.
```

Machiavelli month snapshot (fixtures to write):
```
M1   3 blocks · 19 entries · 12 mornings · 4 self-care    · density: breathable
M3   + Memory, Planner · 71 entries · 47 mornings · 22 sc · comfortable
M6   + Chronicle · custom theme · 168 entries · 112 mornings · 61 sc · compact
M9   + Recall, Cohort · self-care autonomous · dense
M12  full OS · Year Codex · 12 seals · instrument      (current live profile)
```

---

## 09 // TECHNICAL SPEC (for the build phase)

### Data model (additive; one new table or `metadata` block)

```
usership_months
  userId        uuid
  monthNumber   int 1..12
  openedAt      timestamp          -- calendar door
  closedStats   jsonb              -- {entries, mornings, selfCare, widgetsUsed}
  mps           int
  state         enum SEALED|OPEN|QUIET
  sealAwarded   boolean
  dispatchText  text               -- immutable once written
  dispatchCites jsonb              -- [{date, logId}]
  quarterText   text null
  chronicleText text null
  celebratedAt  timestamp null     -- server-side Dawn dismissal (cross-device)
UNIQUE (userId, monthNumber)
```
A migration is required (`migrations/` follows the existing pattern). Alternative
with no migration: store in `user.metadata.usership.months[]` — fine for v1, move
to a table if queried across users.

### Server

```
utils/usership-months.ts   computeMps(user, month), monthState(), openMonth()
scheduled-jobs.ts          NEW job: nightly "month door" check -> openMonth() ->
                           generate Dispatch (+Quarter at 3/6/9/12) -> email.
                           Reuses the existing monthly-email job's locking pattern
                           (isMonthlyEmailJobRunning guard).
memory/story-generator.ts  generateMemoryStory(user, logs, {scope, month, voice, maxWords})
monthly-summary.ts         relax the "3+ months" gate to Month 1+ for Usership;
                           use Dispatch as the email body.
routes/api.ts              GET /api/usership/months  ->  {months[], unlocked, seals}
                           POST /api/usership/months/:n/celebrated
routes/public-api.ts       machiavelli ?month=N fixtures; real users expose seals
                           row only if privacy.showMemoryStory.
```

### Client

```
components/MonthsUnlockedWidget.tsx   W1
components/MonthDawnWidget.tsx        W2 (supersedes MonthlyPulseWidget; keep
                                      MONTH_MESSAGES as the celebration lines)
components/DispatchWidget.tsx         W3 (or a Memory widget view)
components/RecallWidget.tsx           W4
components/SealShelf.tsx              W6 / public profile row
stores/evolution.ts                   add monthNumber + monthState to the
                                      evolution state; gate widgets on
                                      "month >= N AND unlock condition".
utils/interfaceEvolution.ts           getFeatureUnlocks: add
                                      `month >= n` terms next to level terms.
PublicProfile.tsx                     month scrubber (demo only) + seal row
```

### Gating rule (single source of truth)

```
widgetVisible(w) = usership && monthNumber >= w.month && w.depthCondition(user)
```
Month opens the door; the existing level/dimension conditions (e.g.
`advancedMemory: depth >= 0.33`) keep applying — nothing is removed. This is
why the 12-month plan composes with the live evolution system rather than
replacing it.

### Metrics to ship with it

```
M-RET     month-over-month paid retention, by MPS band at month N-1
M-SEAL    share of users SEALED per month
M-DAWN    Dawn open rate, Dispatch read-through (scroll/click)
M-RE-READ Dispatch re-open count (the real "was it a gift?" signal)
M-CHURN   churn in months 2-4 vs. before this design (baseline needed first)
```

---

## 10 // RISKS AND GUARDRAILS

```
R1  Hallucinated memory   -> grounded prompts + citation check (06 rule 1).
R2  Shame on quiet months -> QUIET state copy reviewed against the Resilience
                             (trauma-informed) protocol; no streak-loss language.
R3  Gamification creep    -> max one seal per month; no leaderboards; Rare Air is
                             relative wording, never a ranked list.
R4  Cost                  -> 1 Dispatch/user/month + 4 Quarters + 2 Chronicles +
                             1 Codex = 19 generations/user/year. Negligible
                             versus daily question generation.
R5  Privacy               -> private entries excluded; Month 10 avoidance
                             insight is opt-in; public profile shows seals only
                             when showMemoryStory is on.
R6  Early churn           -> Month 1 email + Dawn exist specifically because
                             today months 1-2 receive no monthly artifact (G6).
R7  Calendar edge cases   -> month length / paused subscriptions: monthNumber
                             counts paid months; a pause freezes the door.
```

---

## 11 // OPEN DECISIONS FOR S-2

```
D1  Count months from Usership START (paid tag date) or account joinedAt?
    Current MonthlyPulse uses joinedAt. Recommend paid-start.
D2  Demo headline: keep 1469-streak Legacy numbers, or show Year-One numbers
    with Legacy as a sub-line? (Section 08.)
D3  MPS thresholds (30 entries / 20 mornings / 15 self-care) — starting values;
    confirm or tune.
D4  Seal names: current set is plain; do you want Campbell/Hero's-Journey names
    surfaced in-app (Codex v32 theme) or only in email subjects?
D5  Month 1 email: send a Dispatch at day 30, or also a Day-7 "first signal" note?
D6  AI named persona at Month 12 ("LOT® AI") — a name, or the product name only?
```

---

## 12 // BUILD ORDER (suggested)

```
PHASE 1  (smallest tangible slice)   W1 Months Unlocked + W2 Month Dawn with real
                                     last-month numbers. No AI. Replaces the
                                     one-line pulse. Ships the "Months 3/12" feel.
PHASE 2  (the centerpiece)           Dispatch generation + archive + email from
                                     Month 1. Ladder through Quarter.
PHASE 3  (the rooms)                 Month-gated widgets + density steps; Recall,
                                     Rhythm, Seal shelf.
PHASE 4  (the proof)                 Demo Time Machine on /u/machiavelli.
PHASE 5  (the finale)                Chronicle (M6), Year Codex (M12), export.
```

Phase 1 touches 3 files and no migration if stored in `metadata`. Phase 2 is the
highest-value phase for the stated goal (tangible compressed-Memory delivery).

---

AUTHORIZED BY: S-2 // VADIK MARMELADOV
