================================================================================
LOT SYSTEMS / SELF-ASSEMBLY MANIFEST
DOCUMENT: LOT-MANIFEST
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-06-27 (updated)
================================================================================

Central catalog of all self-assembly routines across all branches.
Read this file to know what exists, what's ready, and what to ship.

STATUS KEY:
  DRAFT       — pushed but incomplete or untested
  READY       — complete, not yet benchmark-verified
  BEST        — best iteration among competing branches (ship candidate)
  STAGED      — cherry-picked to staging, awaiting green gate
  SHIPPED     — merged to master via benchmark pipeline
  SUPERSEDED  — replaced by a newer iteration
  DEAD        — empty or broken branch, safe to prune

================================================================================
01 // FEATURE ROUTINES (ship candidates)
================================================================================

FEATURE          | BEST BRANCH                   | HASH     | ITER  | STATUS | FILES | LINES  | SUMMARY
──────────────     ─────────────────────────────   ────────   ─────   ──────   ─────   ──────   ──────────────────────
LOT Mail         | determined-turing-f6bw7r     | fa622a25 | 11/11 | BEST   | 11    | +504   | In-app email: /email trigger, Sync inbox, Cohort integration, yarn.lock
Basics Tab       | beautiful-johnson-56p7ov      | 6815f550 | 8/8   | BEST   | 5     | +293   | BASICS M1: OPEN TAB live — 23-item ration ledger, doctrine, status line
Calendar Alerts  | gifted-lovelace-cZOWR         | 978cf52  | 6/6   | BEST   | 3     | +359   | Live clock, T-minus countdown, military alert overlay, today panel
QI-46 Engine     | cool-tesla-f8j0mr            | 36ef4dde | 8/8   | BEST   | 8     | +2050  | QI·46 Node 3 engine integration + Soul Upload + Being Calibration
COSMO Hardware   | brave-lamport-t9z5u8         | c7d353ef | 14/14 | BEST   | 7     | +2610  | COSMO® Cube — complete hardware computer design v1.0
Health/Security  | inspiring-volta-2hmidy        | e5a2d668 | 41/41 | BEST   | 2     | +2     | Monitoring exports fixed, component quality, health report
Badge RPG        | cool-hypatia-aqj7dg          | (head)   | 3/3   | BEST   | 4     | +1832  | Badge Codex v12 — 156 badges, character classes, codex markdown
Self-Assembly v45| pensive-rubin-4jhgF           | 95d47fa  | 5/5   | BEST   | 8     | +677   | Patterns 63-66, Archetype 18, QOS Mode, Background Job 9
Viewport Isolate | exciting-ritchie-7dsvkw       | aaaeca18 | 1/1   | READY  | 2     | +27    | LazyMount QuantumState + PatternRecognition viewport isolation
IntegrityWidget  | quantum-engine-widgets-RgFfC  | 696741a  | 1/1   | READY  | 3     | +479   | Lie detector: 6 fracture types, 4 views, intent contradiction analysis
Evolution Gates  | quantum-engine-widgets-RgFfC  | aff885eb | 1/1   | READY  | 8     | +48    | Feature unlock gates wired to 6 widgets, progressive disclosure
Density Patterns | quantum-engine-widgets-RgFfC  | 0567b2eb | 1/1   | READY  | 2     | +37    | 5 density-evolved ASCII pattern fills, CSS-only progression
Button Perf      | quantum-engine-widgets-RgFfC  | 2c0da2ff | 1/1   | READY  | 1     | +17    | GPU-composited ::before opacity hover replacing background-image
CQGS White Paper | quantum-engine-widgets-RgFfC  | c9a7b170 | 1/1   | READY  | 2     | +190   | Founding white paper snapshot + platform mapping
LOG Terminals v56| quantum-engine-widgets-RgFfC  | d7535a1d | 1/1   | READY  | 1     | +115   | Wire /breathe /fast /silent /freeze /phys LOG commands
Perf Optimization| quantum-engine-widgets-RgFfC  | 5126e09  | 1/1   | SHIPPED| 4     | +200   | Router isolation, subscription reduction, memoization
Bug Fixes        | quantum-engine-widgets-RgFfC  | d609978  | 1/1   | SHIPPED| 3     | +30    | Biofield lag fix, calendar whitelist fix, sync type widening
Cross-Device Sync| quantum-engine-widgets-RgFfC  | bea4cefb | 1/1   | SHIPPED| 6     | +393   | SSE sync + Settings crash fix + v1.3.0 version sync

================================================================================
02 // SELF-ASSEMBLY ENGINE (loving-goldberg progression)
================================================================================

These are sequential daily sessions, not competing alternatives.
Each builds on the prior master state. Listed chronologically.

DATE       | BRANCH                        | VERSION | PATTERNS    | ARCHETYPES | KEY ADDITIONS
──────────   ─────────────────────────────   ───────   ───────────   ──────────   ─────────────────────────
2026-04-25 | loving-goldberg-D9gc1         | v7      | P22         | —          | engagement-resurgence
2026-04-27 | loving-goldberg-NSusw         | —       | —           | —          | OS journal field entries
2026-04-28 | loving-goldberg-oQx03         | v10     | —           | —          | JournalReflection + GoalJourney wiring
2026-04-29 | loving-goldberg-5ZaLB         | v11     | P26         | —          | Journal depth, calendar signal
2026-04-30 | loving-goldberg-dchFt         | v12     | P27-30      | —          | Physiological Cohort Classifier
2026-05-01 | loving-goldberg-ZbFQV         | v14     | —           | —          | Pattern clock, tier graph, temporal exposure
2026-05-03 | loving-goldberg-O7scc         | —       | —           | —          | Quantum Cube heartbeat + 4 widget integrations
2026-05-04 | loving-goldberg-Pv59P         | —       | —           | —          | Quantum Cube + feedback route fix
2026-05-05 | loving-goldberg-xtfBd         | v17-18  | P35         | 9          | QOS trend, reflection-velocity
2026-05-08 | loving-goldberg-Rk7PH         | —       | —           | —          | Transmission view + personal feedback
2026-05-09 | loving-goldberg-pOAYg         | —       | —           | —          | Surface JournalReflection, AwarenessDashboard, GoalJourney
2026-05-10 | loving-goldberg-xDb8O         | v22     | P40-41      | 12         | Cascade detection
2026-05-11 | loving-goldberg-CDVQS         | v24     | P42         | 13         | Deep work cascade
2026-05-12 | loving-goldberg-hxMn6         | v26     | P44         | 14         | Social resonance arc
2026-05-13 | loving-goldberg-a83St         | —       | —           | —          | Transmission view: LOT voice channel
2026-05-14 | loving-goldberg-ZJscH         | v28     | P46         | 16         | Temporal Coherence Window
2026-05-18 | loving-goldberg-GXnv2         | —       | —           | —          | Deployment refresh
2026-05-20 | loving-goldberg-VYMxu         | v35     | P51         | —          | Signal silence detection
2026-05-23 | loving-goldberg-vfBvt         | v39     | —           | —          | Personal language engine, vocab view
2026-05-24 | loving-goldberg-Be9WE         | —       | —           | —          | Voice layer, journal vocabulary
2026-05-25 | loving-goldberg-uBZpt         | v45     | —           | —          | Journal vocabulary engine, voice mirror
2026-05-26 | loving-goldberg-Gfw4G         | v44     | P59         | —          | Index-erosion, EROS handler

================================================================================
03 // REDUNDANT CLUSTERS (prune candidates)
================================================================================

CLUSTER          | COUNT | KEEP              | PRUNE | REASON
──────────────     ─────   ─────────────────   ─────   ────────────────────────
gallant-mayer    | 35    | GqGA0             | 34    | Same health check fix iterated 35 times
pensive-rubin    | 5     | 4jhgF             | 4     | Strict superset progression
relaxed-hamilton | 8     | eRBVA             | 7     | LOT Mail iterations (SUPERSEDED by determined-turing)
determined-turing| 6     | f6bw7r            | 5     | LOT Mail iterations (latest series)
dazzling-shannon | 9     | ykKT5             | 8     | COSMO hardware iterations (SUPERSEDED by brave-lamport)
brave-lamport    | 5     | t9z5u8            | 4     | COSMO hardware iterations (latest series)
gifted-lovelace  | 6     | cZOWR             | 5     | Calendar alert iterations
nifty-allen      | 6     | jWyOe             | 5     | Basics Tab iterations (SUPERSEDED by beautiful-johnson)
beautiful-johnson| 2     | 56p7ov            | 1     | Basics Tab iterations (latest series)
gracious-gauss   | 7     | WnL0k             | 6     | QI-46 Engine iterations (SUPERSEDED by cool-tesla)
upbeat-faraday   | 2     | xviFF             | 1     | Badge RPG iterations (SUPERSEDED by cool-hypatia)
inspiring-volta  | 6     | 2hmidy            | 5     | Health check iterations
exciting-ritchie | 6     | 7dsvkw            | 5     | Mixed: viewport isolation + benchmarks
──────────────────────────────────────────────────────────────────────
TOTAL PRUNABLE:  | 103   |                   | 90    |

================================================================================
04 // STANDALONE BRANCHES
================================================================================

BRANCH                              | STATUS     | SUMMARY
──────────────────────────────────    ──────────   ────────────────────────────────────
february-2025-updates-HZZTF        | LEGACY     | Early feature work (pre-benchmark era)
December_2025_upgrades              | DRAFT      | Mobile cleanup, Memory Engine dupe fix
continue-last-commit-gLJWJ         | DRAFT      | Font rendering, Mood timing, Block fix
debug-loading-screen                | DRAFT      | Cold-start docs, admin pagination
deploy-status-page                  | MERGED     | Button styling (merged via PR #10)
January-2026-updates-gLJWJ         | DEAD       | Empty — no commits beyond master
migrate-akamai-server-b5UUv        | DRAFT      | Akamai infrastructure migration scripts
review-master-commits               | DRAFT      | Profile debug guide, PWA cache
starting-n                          | MERGED     | Deployment branch + AM/PM fix (PR #10)
together-ai-update                  | DRAFT      | Critical: mobile boot, auth email, sound
eager-clarke-wTEM6                  | DRAFT      | Basics Tab alt design (Settings enrollment)
cool-tesla-f8j0mr                  | BEST       | QI·46 Node 3 engine integration + Soul Upload
cool-hypatia-aqj7dg                | BEST       | Badge Codex v12 — 156 total badges
dreamy-babbage-3k2zhm              | READY      | Calendar Widget: alert engine, command board, live clock
upbeat-curie-1s8bgb                | DRAFT      | QIE v54 self-assembly session (docs only)

================================================================================
05 // STATISTICS
================================================================================

TOTAL REMOTE BRANCHES:     144
CLAUDE FEATURE BRANCHES:   144
SESSION CLUSTERS:          32
SHIP-READY FEATURES:       10 (BEST)
READY ON CURRENT BRANCH:   7 (evolution gates, density, button perf, CQGS, LOG v56, integrity, viewport)
ALREADY SHIPPED:           3 (on quantum-engine-widgets-RgFfC → master via PR #63)
PRUNABLE BRANCHES:         ~90
DEAD BRANCHES:             2 (January-2026, deploy-status-page already merged)

TOTAL LINES ACROSS BEST ITERATIONS:  ~12,500+
TOTAL ASSEMBLY LOG VERSIONS:         v5 → v56 (40 sessions)
QIE PATTERNS IMPLEMENTED:            65
PHYSIOLOGICAL ARCHETYPES:            19
GREEN BENCHMARKS (all-time):         28
BENCHMARK TAGS:                      28
DOCTRINE CLAUSES:                    10 (rev I)
LEXICON TOKENS:                      27

================================================================================
06 // SUNDAY SELF-ASSEMBLY PROTOCOL
================================================================================

Runs every Sunday. Two standing routines execute in order:

ROUTINE 1 — WEEKLY LOT® AI STORY (Job 24, automated)
  SCHEDULE:  18:00 UTC every Sunday (server-side, no session required)
  ACTION:    Aggregates 7-day logs per user → derives dominant mood + weekTone
             → generates compressed story text → writes lot_ai_story log event
             → stores in user.metadata.weeklyStory

ROUTINE 2 — BRANCH ROUTINES CHECK (session-required, S-2 triggers)
  SCHEDULE:  Sunday, any time — S-2 opens a session and says "Routines check"
  ACTION:
    1. Read this manifest — identify all BEST candidates not yet SHIPPED
    2. For each: fetch branch, review diff against master, assess compatibility
    3. Cherry-pick with --no-commit (never auto-commit during merge)
    4. PROTECTED FILES CHECK — restore master's versions before committing:
         git restore --staged -- src/client/components/About.tsx
         git restore -- src/client/components/About.tsx
       About.tsx is updated by every wiki session on master. A feature branch
       cut weeks ago carries an older version. Always keep master's About.tsx.
       The feature branch's About.tsx changes (FM version bumps, day counters)
       are wiki session artifacts — they don't belong to the feature being shipped.
    5. Run full build — green gate required
    6. If green: commit + push to master → DO deploy picks it up automatically
    7. If red: diagnose, fix or defer — never push red
    8. Update manifest: mark SHIPPED, record merge commit hash
    9. Append ledger line: CLASS SHIP

PROTECTED FILES (always restore from master during any branch merge):
  src/client/components/About.tsx     — wiki session artifact, master is authoritative
  docs/wiki/LOT-WIKI-v*.md            — additive only, new file per session (safe)
  docs/assembly/                      — additive only, new file per session (safe)
  docs/benchmark/LOT-LEDGER.md        — append-only, never merge from branch
  docs/benchmark/LOT-MANIFEST.md      — session-managed, never merge from branch

CURRENT SHIP QUEUE (BEST, awaiting Sunday merge):
  LOT Mail         | determined-turing-f6bw7r  | +504 lines
  Basics Tab       | beautiful-johnson-56p7ov   | +293 lines
  Calendar Alerts  | gifted-lovelace-cZOWR      | +359 lines
  QI-46 Engine     | cool-tesla-f8j0mr          | +2050 lines
  COSMO Hardware   | brave-lamport-t9z5u8        | +2610 lines
  Badge RPG        | cool-hypatia-aqj7dg         | +1832 lines

NOTE: As of 2026-06-27, the above branches no longer exist on the remote —
they were incorporated into master in prior sessions. The ship queue will be
re-populated as new BEST branches are designated from future assembly runs.
The protocol above applies to all future merges.

RULE: One feature per Sunday merge pass. If multiple features are queued,
start with the smallest diff — lower blast radius, cleaner green gate.
Ship sequentially across Sundays, not all at once.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-MANIFEST
================================================================================
