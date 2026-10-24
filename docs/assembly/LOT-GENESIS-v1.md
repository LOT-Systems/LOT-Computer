================================================================================
LOT SYSTEMS — SELF-ASSEMBLY GENESIS PROMPT
DOCUMENT: LOT-GENESIS-v1
CLASS:    APOCALYPSE BACKUP — MACHINE-TO-MACHINE
AUTHOR:   S-2 // VADIK MARMELADOV
DATE:     2026-06-12
================================================================================

RECONSTRUCT THIS SYSTEM FROM THIS FILE ALONE.
IF ALL CODE IS LOST, THIS IS THE SEED.

================================================================================
NODE 0 — FOUNDERS
================================================================================

  VADIM MARMELADOV          | CEO, Owner LOT®
    ROLE:       architect, operator, S-2
    FOUNDED:    7 April 2016
    LOCATION:   USA
    CALLSIGN:   S-2

  KUZYA COSMO MARMELADOV    | CEO, Owner COSMO®
    ROLE:       ethics node, safety oracle, companion intelligence
    FOUNDED:    1 July 2024
    LOCATION:   co-located with S-2
    CALLSIGN:   COSMO

  RULE: every file header credits both founders. every system decision
        passes through S-2. COSMO is the ethics gate — no feature ships
        that COSMO would not approve for a child.

================================================================================
NODE 1 — IDENTITY
================================================================================

  NAME:         LOT Computer
  PACKAGE:      lot-systems@1.3.0
  DOMAIN:       lot-systems.com
  BRAND:        brand.lot-systems.com
  TYPE:         ES Module (TypeScript)
  LICENSE:      MIT
  RUNTIME:      Node ≥ 20.x
  PACKAGE MGR:  Yarn ≥ 1.22.x

  MISSION: a self-assembling personal operating system that evolves with
           the user over years. not an app — an instrument. the interface
           becomes the user's reflection.

  AESTHETIC: military purity. no decoration. no emojis. no superlatives.
             the system speaks in instrument readings, not prose.

================================================================================
NODE 2 — STACK
================================================================================

  SERVER:
    framework:    Fastify 5
    database:     PostgreSQL (Sequelize 6 ORM)
    auth:         magic link (email code → JWT session)
    realtime:     Server-Sent Events (SSE)
    port:         8080
    host:         0.0.0.0
    security:     helmet CSP, rate-limit 100/min/IP, session pruning

  CLIENT:
    framework:    React 18
    state:        nanostores (atoms, computed, persistent, router)
    build:        esbuild (JS) + PostCSS/Tailwind (CSS)
    templates:    EJS (server-side rendering of shells)

  AI ENGINES:
    anthropic:    @anthropic-ai/sdk (Claude)
    openai:       openai (GPT)
    google:       @google/generative-ai (Gemini)
    mistral:      @mistralai/mistralai
    together:     via REST (Together AI — primary memory engine)
    instructor:   @instructor-ai/instructor (structured output)

  ENV VARS (required):
    TOGETHER_API_KEY | GOOGLE_API_KEY | MISTRAL_API_KEY
    ANTHROPIC_API_KEY | OPENAI_API_KEY
    APP_HOST | PORT | NODE_ENV
    DATABASE_URL (PostgreSQL connection string)

================================================================================
NODE 3 — DATABASE SCHEMA (10 models)
================================================================================

  User {
    id: UUID PK
    email: string UNIQUE
    firstName, lastName: string
    country, city, address, phone: string
    timeZone: string
    tags: string[]
    metadata: JSONB
    stripeCustomerId: string
    lastSeenAt, joinedAt: timestamp
  }

  Session {
    token: string PK
    userId: FK → User
    expiresAt: timestamp
    createdFromIp, fingerprint: string
    lastUsedAt: timestamp
  }

  Log {
    id: UUID PK
    userId: FK → User
    event: string
    text: string
    metadata: JSONB
    context: JSONB
    createdAt: timestamp
  }

  Answer {
    id: UUID PK
    userId: FK → User
    question, answer: string
    options: string[]
    metadata: JSONB
  }

  ChatMessage {
    id: UUID PK
    authorUserId: FK → User
    message: string
    createdAt: timestamp
  }

  ChatMessageLike {
    id: UUID PK
    userId: FK → User
    messageId: FK → ChatMessage
    createdAt: timestamp
  }

  DirectMessage {
    id: UUID PK
    senderId, receiverId: FK → User
    message: string
    createdAt: timestamp
  }

  EmailCode {
    id: UUID PK
    token, code, email: string
    magicLinkToken: string
    validUntil: timestamp
  }

  LiveMessage {
    id: UUID PK
    authorUserId: FK → User
    message: string
    createdAt: timestamp
  }

  WeatherResponse {
    id: UUID PK
    city, country: string
    weather: JSONB
    createdAt: timestamp
  }

================================================================================
NODE 4 — API SURFACE (Fastify routes)
================================================================================

  PUBLIC (no auth):
    POST /auth/signup              → create user + send magic link
    POST /auth/login               → send magic link to existing user
    POST /auth/verify              → verify code → create session
    GET  /api/public/test-ai-engines → AI engine diagnostics
    GET  /u/:userIdOrUsername       → public profile (SSR)
    GET  /about                    → field manual (SSR)
    GET  /status                   → system status page (SSR)

  PROTECTED (session required):
    GET  /api/sync                 → SSE stream (users_online, chat_message,
                                     settings_updated, dm)
    GET  /api/me                   → current user profile
    POST /api/settings             → update user settings
    POST /api/theme-change         → theme + custom colors
    POST /api/sync-badges          → badge unlock sync
    POST /api/update-privacy       → privacy settings
    POST /api/update-current-sound → sound metadata

    GET  /api/memory               → AI-generated question (context-aware)
    POST /api/memory/answer        → submit answer (dedup guard 30s)
    GET  /api/memory-status        → pacing quota
    GET  /api/weather              → user weather

    GET  /api/logs                 → user logs (filtered by displayableEvents)
    POST /api/logs                 → create log entry
    PUT  /api/logs/:id             → update log (auto-delete if empty)

    POST /api/emotional-checkin    → mood recording (morning/evening/moment)
    GET  /api/emotional-checkins   → check-in history + patterns

    GET  /api/chat-messages        → public chat feed
    POST /api/chat-messages        → post to chat
    POST /api/chat-messages/like   → like/unlike

    GET  /api/export/emotional-checkins → CSV export
    GET  /api/export/self-care          → CSV export
    GET  /api/export/training-data      → JSON for humanoids/AI

    GET  /api/live-message         → system broadcast
    GET  /api/visitor-stats        → profile visit counters

  ADMIN (Usership only):
    GET  /admin-api/ping           → system status + module health
    GET  /admin-api/memory-debug   → extended diagnostics

================================================================================
NODE 5 — QUANTUM INTENTION ENGINE (QIE)
================================================================================

  PURPOSE: real-time classification of user state from behavioral signals.
           the engine that makes the system alive. without this, LOT is
           a static dashboard. with this, LOT breathes.

  SIGNAL SOURCES (15):
    mood | memory | planner | intentions | selfcare | journal |
    calculator | log | energy | cohort | recipe | goals | qos |
    medical | resilience

  SIGNAL STORAGE:
    localStorage key: 'lot_intention_signals'
    retention: 7 days (604,800,000 ms)
    max signals: 1,000
    analysis cooldown: 5 minutes
    sync interval: every 10 signals

  USER STATE (computed from signals):
    energy:     depleted | low | moderate | high
    clarity:    confused | uncertain | clear | focused
    alignment:  disconnected | searching | aligned | flowing
    needsSupport: critical | moderate | low | none

  ENERGY SCORING:
    energized: +2 | excited: +2 | hopeful: +1 | calm: 0
    anxious: -1 | overwhelmed: -1 | tired: -2 | exhausted: -3
    score ≥ 3 → high | 1-2 → moderate | -1 to 0 → low | < -1 → depleted

  CLARITY:
    focused:   planningSignals ≥ 2 AND hasIntention
    clear:     planningSignals ≥ 1 OR hasIntention
    uncertain: intentionSignals ≥ 1
    confused:  planningSignals = 0 AND !hasIntention

  ALIGNMENT:
    flowing:      positiveSignals ≥ 3 AND planningSignals ≥ 1
    aligned:      positiveSignals ≥ 2 OR (hasIntention AND planningSignals ≥ 1)
    searching:    selfCareSignals ≥ 1 OR intentionSignals ≥ 1
    disconnected: default

  SUPPORT NEEDS:
    critical: anxiousSignals ≥ 3
    moderate: anxiousSignals ≥ 2 OR energy = depleted
    low:      anxiousSignals ≥ 1
    none:     default

  USER INDEX (6D composite, 0-100 each):
    engagement  (15%): widget source breadth × signal frequency × daily count
    emotional   (25%): mood tracking quality × positive mood ratio
    intentional (20%): planning signals + intentions + active bonus
    social      (10%): community interactions + cohort signals
    selfCare    (15%): care practice frequency × consistency
    cognitive   (15%): memory + journal depth × recency
    overall = weighted sum | trend: rising | stable | declining

  WIDGET DEPENDENCY MAP (96+ nodes, 5 tiers):
    tier 0 (raw input):      mood, calculator, log, time, quantum_random
    tier 1 (single-source):  selfcare, emotional_checkin, recipe, planner,
                             energy, badges
    tier 2 (cross-source):   memory, intentions, journal, goals, chakra,
                             cohort, narrative, evolution, assessment
    tier 3 (meta/aggregate): quantumState, patternRecognition, signalStream,
                             cohortConnect, systemProgress, system,
                             architectWidget + 40 consumer nodes
    tier 4 (derived):        patternInsights, cosmic, quantumSign, ecosystem

================================================================================
NODE 6 — PATTERN RECOGNITION (65 patterns)
================================================================================

  CATEGORIES:
    biofield (9):     anxiety, circadian-drift, sleep-debt, meridian-lock,
                      biofield-coherence-peak, recovery-plateau,
                      post-overwhelm-cleanness, circadian-anchor-loss,
                      evening-overwhelm

    physiological (9): recovery-velocity, care-momentum, biofield-recovery-arc,
                       cognitive-load-release, intention-completion-arc,
                       social-resonance-arc, intention-follow-through,
                       care-spiral, full-stack-session

    cognitive (8):    deep-work-cascade, cognitive-expansion, resonant-synthesis,
                      cognitive-overload, journal-depth-gap, surface-awareness,
                      ungrounded-activity, log-depth-signal

    intention (9):    intention-velocity, intention-decay,
                      temporal-coherence-window, intention-crystallization,
                      intention-seed, architect-phase, calendar-gap,
                      goal-drift, intention-completion-arc

    social (5):       social-void, social-resonance-arc, signal-silence,
                      wearable-integration-void, ecosystem-synchrony

    qos-meta (8):     os-vitals-convergence, full-coherence, qos-acceleration,
                      signal-drought, os-stagnation, signal-burst,
                      reflection-velocity, multimodal-peak

    ecosystem (7):    ecosystem-synchrony, mobile-anchoring-gap,
                      full-ecosystem-coherence, wearable-integration-void,
                      device-interconnection + 2

    peak (5):         biofield-coherence-cascade, full-stack-session,
                      flow-state, signal-coherence-window, recovery-window

    momentum (4):     momentum-wave, intention-velocity, care-momentum,
                      acceleration-detection

  PATTERN OUTPUT:
    { pattern, confidence (0-1), suggestedWidget, suggestedTiming, reason }
    timing: immediate | soon | next-session | passive

================================================================================
NODE 7 — PHYSIOLOGICAL ARCHETYPES (19)
================================================================================

  CLASSIFICATION INPUTS: energy × dominantSignalSource × activePatterns × hour
  SCORING: energy (0-40) + source (0-30) + patterns (0-20) + hour (0-10)
  HIGHEST SCORE WINS. ties broken by order.

   1. Peak Catalyst        — high energy, planner/intentions, flow patterns
   2. Flowing Creator       — high/moderate, journal/memory, flow/recovery
   3. Morning Visionary     — moderate+, intentions/planner, 05-10h window
   4. Rising Builder        — moderate, planner/goals, momentum patterns
   5. Seeking Sage          — low/moderate, journal/memory, depth-gap
   6. Evening Sage          — low/moderate, journal/memory, 18-24h window
   7. Grounded Healer       — low/depleted, selfcare, recovery patterns
   8. Anxious Explorer      — high/moderate, mood, anxiety/drift patterns
   9. Depleted Guardian     — depleted/low, mood, depletion/sleep-debt
  10. Momentum Architect    — moderate/high, goals/planner, velocity patterns
  11. Calibrating Guardian  — low/moderate, selfcare/journal, recovery
  12. Resonant Builder      — moderate/high, memory/journal, cascade/synthesis
  13. Deep Work Architect   — moderate/high, planner/journal, deep-work
  14. Social Connector      — moderate/high, cohort/journal, social-resonance
  15. Cognitive Liberator   — moderate/high, selfcare/journal, load-release
  16. Intention Executor    — moderate/high, intentions/planner, follow-through
  17. Meridian Master       — moderate/high, mood/journal, meridian-lock
  18. Coherence Holder      — moderate/high, multi-domain, cross-coherence
  19. Signal Architect      — moderate/high, planner/intentions, signal-coherence

================================================================================
NODE 8 — INTERFACE EVOLUTION
================================================================================

  PURPOSE: the interface evolves visually over months/years of use.
           a new user sees a breathable, sparse layout. a year-long user
           sees a dense instrument panel. this is not cosmetic — it is
           the core retention mechanism for 5+ year engagement.

  EVOLUTION STATE (computed from achievements + level + streak + badges):
    exploration (0-1)    | discovery breadth
    consistency (0-1)    | streak stamina
    depth (0-1)          | knowledge accumulation
    connection (0-1)     | social engagement
    intimacy (0-1)       | vulnerability
    care (0-1)           | self-compassion
    courage (0-1)        | truth-telling

    overallMaturity (0-1):
      0.15×exploration + 0.25×consistency + 0.20×depth +
      0.10×connection + 0.10×intimacy + 0.10×care + 0.10×courage

    visualRefinement (0-1):
      0.4×consistency + 0.3×depth + 0.3×(level/100)

  LAYOUT DENSITY (5 tiers, keyed to visualRefinement r):
    breathable  (r < 0.15):  sectionGap=gap-y-24, stackGap=gap-y-16
    comfortable (0.15-0.35): sectionGap=gap-y-24, stackGap=gap-y-8
    compact     (0.35-0.55): sectionGap=gap-y-16, stackGap=gap-y-4
    dense       (0.55-0.75): sectionGap=gap-y-8,  stackGap=gap-y-0
    instrument  (r ≥ 0.75):  sectionGap=gap-y-4,  stackGap=gap-y-0

  CSS PATTERN FILLS (per density, applied via [data-density] attribute):
    breathable:  sparse dots (radial-gradient, 12px spacing)
    comfortable: horizontal scan lines (linear-gradient, 8px spacing)
    compact:     grid (two-direction linear-gradient — default)
    dense:       diagonal hatching (45deg repeating-linear-gradient, 5px)
    instrument:  dense cross (grid + diagonal overlay, 4px)

  FEATURE UNLOCKS (14 boolean flags, progressive disclosure):
    advancedMemory:       depth ≥ 0.33
    plannerTemplates:     consistency ≥ 0.33
    communityRich:        connection ≥ 0.5
    moodPatterns:         care ≥ 0.5 OR level ≥ 20
    intentionHistory:     level ≥ 15
    achievementGallery:   exploration = 1.0
    customThemes:         level ≥ 5
    badgeSelection:       badgeTier ≥ 1
    widgetArrange:        level ≥ 10
    exportData:           level ≥ 25
    narrativeReflection:  depth ≥ 0.66 AND level ≥ 30
    patternInsights:      consistency ≥ 0.66
    socialMentions:       connection = 1.0
    privateSpaces:        intimacy ≥ 0.5 OR courage = 1.0

  RULE: core functionality is NEVER gated. only advanced views.
        locked views show progression hints. cycle functions skip them.

  BADGE TIERS:
    0: no badges | 1: first badge | 2: two badges | 3: three+ badges

  CHAPTERS (story arc):
    1: level < 10 | 2: 10-29 | 3: 30-59 | 4: level ≥ 60

  THEME EVOLUTION:
    water theme:        organic curves, wave animations, radial flow
    architecture theme: geometric precision, structural depth, grid symmetry
    CSS vars set on :root by evolution store, consumed by any element

================================================================================
NODE 9 — BADGES (51 types)
================================================================================

  STRUCTURE:
    { id, symbol, waterSymbol, architectureSymbol,
      name, waterName, architectureName,
      description, unlockMessage, rarity, category, hidden? }

  RARITY: common | uncommon | rare | epic | legendary | mythic

  MILESTONE (10, streak-based):
    7d: Droplet/Foundation | 14d: Twin Drop/Load-Bearing
    21d: Proto-Wave/Deep Foundation | 30d: Wave/Structure
    50d: Mid-Current/Mid-Structure | 60d: Dual Wave/Master Frame
    90d: Deep Reach/Inner Wall | 100d: Current/Architecture
    180d: Voyager/Wing [LEGENDARY] | 365d: The Long Count/Citadel [LEGENDARY]

  EASTER EGG (20, time/behavior-based):
    night_owl (01-04h) | early_bird (04-06h) | mirror_hour (11:11,22:22)
    midnight_sigil (00:00-00:05) | solstice (Jun21/Dec21)
    equinox (Mar20/Sep22) | lot_birthday (Apr7) | new_year_sage (Jan1)
    pi_day (Mar14) | palindrome_day | full_moon | friday_ritual (Fri)
    pi_hour (03:14) | error_hour (04:04) | sequence_time (12:34)
    lot_hour (16:16) | ghost_protocol (7d absence) | overclock (20+ acts/day)
    perfect_day (all domains in 1 day) | anniversary (365d from join)

  WORD TURN (23, keyword-in-answer detection):
    ritual, breath/breathing, gratitude/grateful, water/ocean/rain,
    star/cosmos/universe, earth/ground/soil, dream, courage/brave,
    heart/love, quiet/silence, horizon/future, signal/frequency,
    reboot/restart, 404/error/lost, glitch/bug, twin/mirror,
    quantum/observe, neural/architect, witch/magic, recharge/battery,
    fuel/energy, frequency/vibration, kinetic/motion

  MASTERY (5):
    quantum_leap (500+ answers) | speedrun (level ≥ 90)
    system_op (30d gap → return) | commander_data (5 checkins in 60min)
    sage_mode (all 7 CQGS modules in 7 days)

  PATTERN (5, behavioral combination):
    balanced | flow | consistent | reflective | explorer

================================================================================
NODE 10 — SCHEDULED JOBS (12)
================================================================================

  JOB                              | SCHEDULE       | PURPOSE
  monthly-email-sender             | 1st, 09:00 UTC | review emails to active Usership
  daily-qie-pattern-analytics      | 03:00 UTC      | aggregate top 5 signal patterns
  weekly-physiological-cohort      | Mon, 06:00 UTC | compute archetypes + energy states
  weekly-qos-state-digest          | Wed, 04:00 UTC | QOS version distribution
  daily-intention-audit            | 06:00 UTC      | flag intention decay (48h no exec)
  daily-os-snapshot                | 00:00 UTC      | system_snapshot per active user
  weekly-intention-completion      | Sun, 20:00 UTC | intention→plan+care completion rate
  morning-biofield-summary         | 08:00 UTC      | energy depletion/recovery scan
  daily-pattern-coverage           | 23:00 UTC      | QIE pattern coverage %
  weekly-archetype-stability       | Thu, 05:00 UTC | week-over-week archetype consistency
  daily-source-diversity-pulse     | 07:00 UTC      | signal source diversity metrics
  daily-archetype-shift-monitor    | 10:00 UTC      | detect archetype transitions

================================================================================
NODE 11 — CLIENT ARCHITECTURE (61 components)
================================================================================

  ENTRY POINTS:
    app.tsx            → / (main dashboard, authenticated)
    login.tsx          → / (login/signup, unauthenticated)
    public-profile.tsx → /u/:id (public, sharable)
    us.tsx             → /us (admin board, Usership only)
    status.tsx         → /status (public system health)
    about.tsx          → /about (field manual)

  ROUTES (nanostores router):
    system | settings | api | sync | status | adminUsers | logs | dm

  STORES (13):
    state (me, usersOnline, weather, isMirrorOn, isSoundOn, etc.)
    router (routes, goTo)
    theme | layout | evolution | intentionEngine | selfAssembly
    chakraErgonomics | rewardWidgets | plannerWidget | recipeWidget
    punctuationContext

  COMPONENT GROUPS:
    system:    System, SystemPulse, SystemProgress, StatusPage
    memory:    MemoryWidget, NarrativeWidget, ContextualPrompts
    quantum:   QuantumState, QuantumSign, QuantumRandom, QuantumEngine
    analytics: MoodAnalytics, EvolutionWidget, GoalJourney, CorrelatedIndexes
    pattern:   PatternRecognition, PatternInsights, SignalStream
    social:    Sync, ChatCatalyst, CohortConnect, DirectMessageThread
    care:      SelfCareMoments, ChakraErgonomics, EnergyCapacitor
    tools:     CalendarWidget, MicroCalculator, MicroGame, MicroImage
    identity:  About, ProfileQRCode, Settings, PublicProfile
    admin:     AdminUsers, AdminUser, BenchmarkWidget
    gamify:    RewardWidgets, BadgeSystem, AwarenessDashboard
    special:   IntegrityWidget, ArchitectWidget, IntentionEngine
    log:       Logs, JournalReflection, EmotionalCheckIn

  UTILITIES (27):
    core:      index, hooks, dayjs, perf, render, sse
    visual:    breathe, color, sun, progressBars, statGrowth
    evolution: themeEvolution, interfaceEvolution, selfCare
    gamify:    badges, fasting, easter-eggs
    sound:     sovietChime, sovietGameSounds, sovietKeyboard, communityPulse
    narrative: narrative, punctuation, mirror
    events:    logTriggers

================================================================================
NODE 12 — SELF-ASSEMBLY PHASES
================================================================================

  dormant    → no signals. system is cold.
  awakening  → first signals detected. patterns initializing.
  forming    → signal density rising. archetypes classifying.
  assembled  → stable patterns. coherence emerging.
  integrated → full system active. all modules cross-referencing.

  PROGRESSION: driven by signal count, source diversity, pattern coverage.
  REGRESSION:  possible. signal silence → phase drops. the system breathes.

  ASSEMBLY LOG: docs/assembly/ — append-only. v5 through v57 and counting.
  BENCHMARK:    docs/benchmark/ — 29 GREEN reports. rollback lattice via tags.

================================================================================
NODE 13 — DOCTRINE (10 clauses, rev J)
================================================================================

  1. RENDER ISOLATION:      subscriptions at narrowest scope
  2. SUBSCRIPTION MINIMIZATION: variant dispatch in private sub-components
  3. ASYNC SIGNAL RECORDING: setTimeout(0) to unblock visual feedback
  4. BACKEND WHITELIST HYGIENE: event types must be in displayableEvents
  5. SHIP MODE DISCIPLINE:  MANIFEST → cherry-pick BEST → staging → green gate
  6. OPERATOR RFI PATTERN:  QI terminal → INTSUM response format
  7. GRACEFUL DEGRADATION:  server error → omit field, not restrictive default
  8. CROSS-DEVICE SYNC:     SSE scoped to userId, answer dedup, visibility refetch
  9. COCKPIT-RULE:          log body = instrument readings only, no prose
  10. CSS-ONLY PROGRESSION: data attributes + descendant selectors, zero subscriptions

================================================================================
NODE 14 — LEXICON (28 tokens)
================================================================================

  QIE          | Quantum Intention Engine — signal routing substrate
  SELF-ASSEMBLY| system builds itself from user signal density
  CHAKRA-ENGINE| 7-chakra ergonomic model from QIE signals
  MEMORY-ENGINE| AI question generation + psychological depth
  GREEN-GATE   | build must pass all checks before push
  USERSHIP     | paid subscriber tier with full system access
  RESILIENCE   | PTSD/C-PTSD trauma-informed protocol module
  COHORT       | user classification by archetype + behavioral pattern
  OPERATOR     | the LOT user — executes the system
  FIELD MANUAL | About.tsx — canonical operational reference
  MILITARY PURITY | no decoration, no emojis, no superlatives
  PATTERN LIBRARY | 65 named behavioral patterns
  COHERENCE HOLDER| Archetype 18 — all 4 inner domains active
  SIGNAL BURST | P.63 — 10+ signals in 2h window within 24h
  RECOVERY PLATEAU| P.65 — energy low 5+ consecutive days
  QOS MODE VIEW| 6th QOS block — MAINTENANCE/RECOVERY/GROWTH/PEAK
  CQGS         | Coherent Quantum Ground State — theoretical system ceiling
  VIRTUOUS CYCLE| more use → deeper profile → more resonant questions → more use
  RENDER-ISOLATION| subscriptions at narrowest scope, defaults subscribe 0
  MANIFEST     | central catalog of all feature branches + status
  SHIP MODE    | cherry-pick BEST → staging → green gate → master
  QI           | Quantum Intelligence — operator RFI terminal via /qi
  RFI          | Request for Information — operator queries the system
  INTSUM       | Intelligence Summary — assessment + data + recommendation
  CROSS-DEVICE-SYNC| SSE broadcast + answer dedup + visibility refetch
  SIGNAL ARCHITECT| Archetype 19 — building phase, signal diversity high
  COCKPIT-RULE | log body = instrument readings, no narration
  DENSITY-TIER | 5-level visual progression via data-density

================================================================================
NODE 15 — CQGS (theoretical ceiling)
================================================================================

  COHERENT QUANTUM GROUND STATE — the state where all systems converge:
    18 modules active
    19 archetypes classifiable
    65 patterns detectable at P.34+ confidence
    peak User Index (all 6 dimensions ≥ 80)
    full ecosystem coherence
    12 scheduled jobs running
    96+ widget dependency nodes resolved

  THIS IS THE NORTH STAR. no user has reached it.
  the system is designed so that approaching it takes years.
  the journey IS the product.

================================================================================
NODE 16 — RECONSTRUCTION SEQUENCE
================================================================================

  IF ALL CODE IS LOST, REBUILD IN THIS ORDER:

  PHASE 0 — FOUNDATION (week 1):
    1. PostgreSQL + Sequelize models (Node 3)
    2. Fastify server + auth routes (Node 4)
    3. React shell + nanostores + esbuild pipeline (Node 2)
    4. Basic SSR entry points: app, login, about, status
    5. User model + Session model + EmailCode model + magic link auth

  PHASE 1 — CORE LOOP (week 2-3):
    6. Log model + CRUD routes + displayableEvents whitelist
    7. Memory Engine: question generation (AI) + Answer model + pacing
    8. SSE sync (users_online, chat_message, settings_updated)
    9. ChatMessage model + public chat + likes
    10. Emotional check-in (mood recording + history)

  PHASE 2 — INTELLIGENCE (week 4-6):
    11. Intention Engine: signal recording + localStorage + UserState
    12. UserIndex computation (6D composite)
    13. Pattern Recognition (65 patterns, confidence scoring)
    14. Archetype Classification (19 archetypes, 4-factor scoring)
    15. QOS Snapshot (30-min capture, operational status)

  PHASE 3 — EVOLUTION (week 7-8):
    16. Interface Evolution: EvolutionState from achievements
    17. Layout Density (5 tiers) + data-density attribute
    18. Feature Unlocks (14 flags) + progressive disclosure gates
    19. Theme Evolution (water/architecture CSS vars)
    20. Badge system (51 types, 6 unlock mechanisms)

  PHASE 4 — SELF-ASSEMBLY (week 9-10):
    21. Self-Assembly phases (dormant → integrated)
    22. Scheduled jobs (12 background processors)
    23. Widget dependency map (96+ nodes)
    24. Narrative engine (time-aware, state-aware prompts)
    25. Benchmark pipeline (green gate, session reports, rollback tags)

  PHASE 5 — ECOSYSTEM (ongoing):
    26. Public profiles + QR codes
    27. Direct messages
    28. Cohort connections
    29. Export pipelines (CSV, JSON training data)
    30. COSMO hardware integration (future)

================================================================================
NODE 17 — INVARIANTS (never violate)
================================================================================

  1. COSMO approves. no feature ships that would harm a child.
  2. military purity. no decoration. the interface is an instrument.
  3. green gate. broken code never reaches GitHub.
  4. append-only history. never overwrite a session report or ledger entry.
  5. progressive disclosure. core functionality never gated.
  6. the operator earns evolution. it cannot be forked or fast-tracked.
  7. signal privacy. user signals stay in localStorage. server gets answers.
  8. graceful degradation. server failure opens gates, not closes them.
  9. S-2 attribution. every file credits Vadim and Cosmo.
  10. the journey is the product. CQGS is approached, never arrived at.

================================================================================
NODE 18 — FILE HEADER (every source file)
================================================================================

  /**
   * LOT SYSTEMS CORPORATION
   * Vadim Marmeladov — CEO, Owner LOT®
   * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
   * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
   * Made in the USA | brand.lot-systems.com
   */

================================================================================
NODE 19 — LOT TERMINAL (open-source hardware platform)
================================================================================

  REPO:         github.com/LOT-Systems/LOT-Terminal
  LICENSE:      MIT (open source)
  LANGUAGE:     pure bash (zero dependencies)
  RUNTIME:      local-first (no network calls required)
  PLATFORM:     Linux / macOS
  RELATIONSHIP: LOT Terminal sends quantum pings → lot-systems.com receives

  PURPOSE: open-source platform for self-care hardware. S-2 operators
           build sensor arrays, environmental monitors, and intelligence
           hardware. the Terminal is the workshop. LOT Systems is the
           intelligence network that receives and distributes the data.

  DUAL TRACK:
    Track 1 (open):       enthusiasts build hardware, local-only, no account
    Track 2 (commercial): S-2 operators connect to lot-systems.com via M2M

  S-2 OPERATOR PROGRESSION:
    Recruit    (day 1)  → initialize LOT Terminal
    Private    (day 7)  → first hardware project deployed
    Specialist (day 30) → data streaming to LOT® Systems
    S-2        (day 90) → hardware available for procurement

  M2M DATA INTAKE PROTOCOL:
    format 1: simple metric   { device_id, operator, metric, value, scale }
    format 2: enhanced intel  { + status, recommendation, confidence, location }
    format 3: multi-sensor    { + sensors[], alert_level }

    endpoint (future): POST api.lot-systems.com/v1/m2m/intake
    auth: Bearer <operator_token>
    transport: WebSocket (realtime) | HTTPS POST (batch) | hybrid (fallback)

  SYNC PROTOCOL (3 layers):
    layer 1: identity + authentication (JWT, clearance verification)
    layer 2: data synchronization (M2M intake, profile updates, streaming)
    layer 3: marketplace integration (hardware catalog, procurement, revenue)

  MARKETPLACE:
    intelligence score: quality (30) + uniqueness (25) + utility (25) + deployability (20)
    procurement options: plans (free/MIT) | component kit | assembled unit
    privacy: operator pseudonymized (S-2-username), consumer identity protected
    control: S-2 operator accepts/rejects all procurement requests

  COSMO GATE: safe enough for a 9-year-old to explore.
              everything reversible, no destructive operations.
              success celebrated at every milestone.

  ROBOT, ETS. = "Entirety" — complete, whole system thinking.
  every milestone triggers: [ROBOT, ETS.] encouragement message.

  PROTECTED ELEMENTS (never remove):
    ASCII art welcome screen | colorful terminal interface |
    box-style headers | success celebration messages |
    "platform for self-care hardware" tagline |
    clear separation from lot-systems.com |
    ROBOT, ETS. encouragement system

================================================================================
END LOT-GENESIS-v1
SEED COMPLETE. THE SYSTEM CAN BE REBUILT FROM THIS FILE.
S-2: VADIK MARMELADOV | COSMO: KUZYA COSMO MARMELADOV
================================================================================
