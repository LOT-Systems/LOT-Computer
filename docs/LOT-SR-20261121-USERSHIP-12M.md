# SESSION REPORT — USERSHIP 12-MONTH EVOLUTION
## Date: 2026-11-21 · Branch: claude/elegant-mendel-5qey5p
### Session Type: Product Design — Usership Orbit I · Compressed Memory Story

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                       ║
║  Usership 12-Month Evolution · Day 1 → LOT® AI                  ║
║  November 21, 2026 · Day 1181+                                  ║
║  Authorized: S-2 // VADIK MARMELADOV                            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. SESSION TASK

Design the 12-month evolution of the paid Usership tier: from a barebone Day 1
UI to full LOT® AI, using `/u/machiavelli` as the Month 12 reference. Primary
evolution signals: journal entries (Log), morning check-ins, self-care clicks.
The AI celebrates each month with affirmations and a compressed Memory Story.
Proposed widgets: new-month congratulation, Memory insight paragraph,
"Months unlocked: N/12". Badges per month.

Framework followed: (1) scan repository · (2) read the .MDs · (3) push with a
detailed .MD · (4) focus on 12-month tangibility of compressed Memory delivery.

---

## 2. REPOSITORY SCAN

```
HEAD entering        9f2b88c  LOT-SR-20261117 · Badge Codex v33 (843 badges)
.MD files in repo    381
Read in full         README.md · docs/README.md · LOT-AI-PRODUCT-BRIEF.md ·
                     INTERFACE_EVOLUTION.md · LOT-SR-20261117-CODEX-v33.md
Read by section      LOT-WIKI-v87 (§8 Citizen Index · §9 Memory Engine ·
                     §10 Self-Assembly · §17–20 Display / Density / Opacity /
                     Cockpit) · MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md (§1–3) ·
                     LOT-STYLE-GUIDE.md (visual language · tone) ·
                     LOT-DOCTRINE.md (Render Isolation → Operator RFI)
Indexed by title     wiki v55–v87 · badge codex v10–v33 · assembly logs ·
                     benchmark SRs · corporate · technical · deployment
```

Source code examined for existing Usership plumbing:

```
src/shared/types/index.ts:16              UserTag.Usership
src/shared/types/index.ts:309             boardProfile (boardTenureMonths, activity)
src/client/components/MonthlyPulseWidget  existing Month N / 12 pulse + MONTH_MESSAGES
src/client/components/PublicProfile.tsx   profile block render order
src/server/routes/public-api.ts:745       /u/machiavelli demo payload
src/server/scheduled-jobs.ts:834          Job 24 weekly LOT® AI story (lot_ai_story)
src/server/routes/api.ts:1084             displayableEvents whitelist
```

---

## 3. DELIVERABLE

```
docs/corporate/LOT-USERSHIP-12-MONTH-EVOLUTION.md     (new · design spec v1.0)
docs/LOT-SR-20261121-USERSHIP-12M.md                  (this report)
```

### 3a. Structure of the spec

```
§1   Doctrine — 5 rules (tenure opens / signal fills · irreversible ·
     one new thing per month · calm celebration · the story is the product)
§2   The Two Clocks — tenure vs signal · seal grades ∘ THIN / ◈ FULL / ◉ DENSE
§3   Compression Ladder — Day → Week (exists) → Month → Season → Year
§4   Chapter Format — numeral · seal · title · 80–120 word body ·
     affirmation · thread (seeds next month's first Memory question)
§5   Month-by-Month Map — 4 seasons × 3 months
§6   Profile Arc — /u/user block-by-block → /u/machiavelli (5 → 19 blocks)
§7   Widgets — Usership: N/12 · Chapter · Echo · Year Story · context variants
§8   Orbit Codex — 12 monthly seals · 4 season seals · 5 secret seals
§9   Interface Refinement Curve — CSS evolution vars mapped to months
§10  Signal Targets — J / C / S / M per month and cumulative
§11  Engineering Plan — findings · data model · job · API · log events · phases
§12  Orbit II — day 366 onward
```

### 3b. The 12 months

```
SEASON I   FOUNDATION   M01 SIGNAL      ·    first Chapter · Weather
                        M02 PATTERN     ··   Mood Patterns · Sound
                        M03 RITUAL      ∴    routine builder · Memory Story · Season Note I
SEASON II  PORTRAIT     M04 PORTRAIT    ◇    archetype reveal
                        M05 RHYTHM      ◇·   Biofield · circadian view
                        M06 MIRROR      ◈    ECHO widget · Half-Year Story
SEASON III FIELD        M07 COHORT      ◈·   Cohort Connect
                        M08 DEPTH       ◈∴   Pattern Strength
                        M09 INTEGRATION ▣    Correlated Indexes · Season Note III
SEASON IV  LOT® AI      M10 INSTRUMENT  ▣·   Weather Station
                        M11 LEDGER      ▣∴   Wallet · Year Story DRAFT (co-authored)
                        M12 LOT® AI     ◉    Year Story sealed · Machiavelli parity
```

### 3c. Key design decisions

```
D1  A paid month always unlocks; the seal GRADE is what signal earns.
    No punishment for a hard month. orbit_return (∘ → ◉) is a secret seal
    that celebrates recovery, not streaks.
D2  The Chapter's "thread" writes the next month's first Memory question —
    the story continues instead of restarting each month.
D3  Day 1 Boot question ("What do you want this year to have been about?")
    is quoted verbatim in the Year Story on day 365.
D4  Month 6 ECHO — the person's own past words set against present behaviour.
    Highest-tangibility moment of the year. Suppressed in QOS recovery mode.
D5  Month 11 Year Story Draft is co-authored (Keep · Strike · Add a line)
    before Month 12 seals it.
D6  No new data collection: the monthly rung compresses the weekly stories
    and counters Job 24 already reads.
```

---

## 4. FINDINGS IN CURRENT CODE (not fixed this session — design only)

```
F1  MonthlyPulseWidget computes month from user.joinedAt, not Usership start.
    A long-time account that upgrades today sees "Month 12" on day 1.
    src/client/components/MonthlyPulseWidget.tsx:73-79
F2  MonthlyPulseWidget dismissal lives in localStorage — violates ORDER 6
    (cross-device state belongs in the database).
    src/client/components/MonthlyPulseWidget.tsx:43-61
F3  No single server-computed Usership month shared by API and public profile.
F4  Job 24 weekly story is the right input for the monthly Chapter rung.
```

---

## 5. VERIFICATION

```
Scope          Documentation only — no source files modified
TypeScript     not run (no .ts/.tsx changes)
Tables         Profile Arc table generated programmatically; visible-block
               totals (5 → 19) verified against row definitions
```

---

## 6. NEXT SESSION RECOMMENDATIONS

```
□ PHASE A  F1 + F2 + F3 · getUsershipMonth() · Usership: N/12 widget
□ PHASE B  monthly-usership-chapter job + Chapter widget (absorbs MonthlyPulse)
□ PHASE C  Profile arc gating + Chapters: block on /u/user
□ PHASE D  Orbit Codex badges (+21) as Badge Engine v34 or v35
□ PHASE E  Echo · Season notes · Year Story draft / annotate / seal / export
□ PHASE F  /u/machiavelli: add Chapters I–XII + Year Story to the demo payload
```

---

*LOT Systems Corporation — Vadim Marmeladov, CEO*
*LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024*
*Session Report — 2026-11-21 — USERSHIP 12M*
