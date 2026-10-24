================================================================================
LOT SYSTEMS / SYSTEM OUTLINE
DOCUMENT: LOT-SYSTEM-OUTLINE
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-06-05
================================================================================

Architecture map of LOT Computer as of June 2026.
Read this file to understand what the system is and how it fits together.

================================================================================
01 // WHAT LOT COMPUTER IS
================================================================================

A military-grade personal operating system that runs as a web application.
The operator logs in. The system learns. Over time it builds a model of
the operator's behavioral patterns, emotional states, intentions, and
physiological rhythms — then feeds that understanding back as increasingly
resonant questions, prompts, and structural suggestions.

The system self-assembles: the more the operator uses it, the more modules
activate, the deeper the pattern recognition becomes, the more precise the
feedback. This is the Virtuous Cycle.

STACK:     React + TypeScript + Nanostores (client)
           Fastify + Sequelize + PostgreSQL (server)
           SSE for real-time (no WebSocket)
           Claude AI for inference (Sonnet primary, Haiku for lightweight)
           Digital Ocean (hosting)
URL:       lot-systems.com
REPO:      LOT-Systems/LOT-Computer
CODEBASE:  213 source files / 69,094 lines of TypeScript

================================================================================
02 // ARCHITECTURE LAYERS
================================================================================

┌─────────────────────────────────────────────────────────────┐
│  OPERATOR INTERFACE                                          │
│  81 React components · 6 entry points · Tailwind CSS        │
│  Tabs: System · Sync · Log · Settings · (Basics · Mail)     │
├─────────────────────────────────────────────────────────────┤
│  INTELLIGENCE LAYER                                          │
│  13 nanostores · QIE (3091 lines) · Self-Assembly (572)     │
│  65 behavioral patterns · 18 archetypes · 6-dim User Index  │
├─────────────────────────────────────────────────────────────┤
│  SERVER LAYER                                                │
│  57 server files · 5 route modules · 11 Sequelize models    │
│  SSE event bus · Claude AI inference · Cron jobs             │
├─────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                  │
│  PostgreSQL · 11 tables · localStorage signal cache          │
│  Logs (append-only) · Signals (7-day rolling) · Sessions    │
└─────────────────────────────────────────────────────────────┘

================================================================================
03 // CLIENT COMPONENTS (81 widgets)
================================================================================

SYSTEM TAB (main dashboard):
  TimeWidget              Live clock + timezone
  QuantumRandomWidget     Hardware-grade randomness display
  EmotionalCheckIn        Biofield reading (8 emotional states, cascade animation)
  SelfCareMoments         Contextual self-care suggestions with cooldown
  IntentionsWidget        Set/track guiding intention
  PlannerWidget           Daily structure entry
  MemoryWidget            AI-generated questions (psychological depth)
  RecipeWidget            Contextual recipe suggestions
  CalendarWidget          Date planner with [SCHEDULE] log tagging
  MicroCalculatorWidget   Inline calculator
  MicroGameWidget         Micro-interaction game
  MicroImageWidget        Image capture/display
  EnergyCapacitor         Energy level visualization
  ChakraErgonomicsWidget  7-chakra ergonomic model
  NarrativeWidget         System narrative from assembly state
  EvolutionWidget         Interface evolution tracking
  InterfaceEvolutionWidget  UI complexity progression
  EvolutionMilestoneToast   Achievement notifications
  ContextualPromptsWidget   Time/state-aware prompts
  ChatCatalystWidget      Community engagement prompts
  InterventionsWidget     Behavioral interventions
  PatternInsightsWidget   Recognized pattern display
  CohortConnectWidget     Physiological cohort matching
  QuantumEngineWidgets    QIE connect widgets (lazy-mounted)
  QuantumStateWidget      Real-time QIE state display
  PatternRecognitionWidget  Pattern detection dashboard
  AIFeedbackWidget        AI-generated feedback
  SignalStreamWidget      Live signal stream monitor
  IntegrityWidget         Lie detector (intent contradiction analysis)
  UserMetricsWidget       User engagement metrics
  CorrelatedIndexesWidget 4-dimensional weekly tracking
  SystemProgressWidget    Deployment info + feedback
  SystemPulseWidget       Real-time system metrics
  ArchitectWidget         Executive self-assembly telemetry
  IntentionPatterns       Pattern statistics
  CollectiveConsciousness Community consciousness metrics
  WellnessPulse           Collective wellness
  MemoryEngineStats       Memory engine analytics
  GrowthMilestones        Growth tracking
  BadgeUnlockFeed         Badge achievement feed
  CosmicUpdateWidget      Cosmic cycle updates
  QuantumSignWidget       Quantum signature display
  FlashDriveManifest      Flash drive content listing
  BenchmarkWidget         Build benchmark display
  SubscribeWidget         Subscription prompt

SYNC TAB:
  Sync                    Real-time message feed (SSE)
  DirectMessageThread     Private messaging

LOG TAB:
  Logs                    Append-only personal journal + system log

SETTINGS TAB:
  Settings                Theme, sound, mirror, format preferences

OTHER:
  AngelInvestorWidget     Investor information (tag-gated)
  CorporatePlanWidget     Corporate plan display
  DemoDayWidget           Demo day presentation
  FourDimensionalUI       4D interface experiment
  StatusPage              Public system health
  About (Field Manual)    Canonical operational reference

PENDING (on feature branches, not yet on master):
  Mail                    In-app email system (relaxed-hamilton-eRBVA)
  Basics                  Ration subscription tab (nifty-allen-jWyOe)
  MailWidget              System tab email indicator (relaxed-hamilton-eRBVA)
  EmailCompose            Email compose overlay (relaxed-hamilton-eRBVA)

================================================================================
04 // INTELLIGENCE ENGINE
================================================================================

QUANTUM INTENTION ENGINE (QIE) — 3,091 lines
  Records signals from every widget interaction.
  15 signal sources: mood, memory, planner, intentions, selfcare,
    journal, calculator, log, energy, cohort, recipe, goals,
    qos, medical, resilience.
  65 named behavioral patterns across 5 tiers:
    Acute (P1-P24): anxiety, structure, recovery, drift
    Arc (P38-P50): biofield recovery, cognitive expansion, follow-through
    Cascade (P40-P43): coherence cascade, deep work, resonant synthesis
    Equilibrium (P51-P60): signal silence, intention seed, drought
    Peak (P61-P65): multimodal peak, architect phase, signal burst
  18 physiological archetypes (Peak Catalyst → Coherence Holder)
  6-dimensional User Index (engagement, emotional, intentional,
    social, selfCare, cognitive) — overall 0-100
  Optimal widget recommendation engine
  Server sync every 10 signals

SELF-ASSEMBLY ENGINE — 572 lines
  18 modules tracked: Biofield, Memory, Planner, Intentions,
    Selfcare, Journal, Community, Ecosystem, Quantum, Recipe,
    Goals, Cohort-classify, Vitals, Calendar, Quantum-OS,
    Log, QOS, Resilience
  Phase progression: dormant → awakening → forming → assembled → integrated
  Per-module density (0-100), coherence (0-100), signal count
  Overall assembly score with weighted phase average
  Narrative generation from assembly state

INTEGRITY ENGINE (IntegrityWidget) — 479 lines
  6 fracture types: mood-action, intention-execution,
    energy-behavior, care-claim, temporal-drift, signal-void
  Integrity score 0-100 (Coherent → Deceptive)
  Cross-references QIE patterns for contradiction/coherence signals

================================================================================
05 // SERVER ARCHITECTURE
================================================================================

ROUTES:
  api.ts           Main API (logs, emotional-checkin, memory, QIE sync, etc.)
  admin-api.ts     Admin operations (user management, tags)
  os-api.ts        Quantum OS endpoints
  public-api.ts    Public profiles, status
  auth.ts          Authentication (email code, session)

MODELS (11):
  User, Session, Log, Answer, ChatMessage, ChatMessageLike,
  DirectMessage, LiveMessage, WeatherResponse, EmailCode

SSE EVENTS:
  users_online, users_total, live_message, chat_message, ping

AI INFERENCE:
  Claude Sonnet — Memory questions, emotional check-in responses
  Claude Haiku — Lightweight analysis, pattern summaries
  Temperature: 0.72 (Memory), varies by context
  System prompts: Guardian Protocol v3.0

================================================================================
06 // DATA FLOW
================================================================================

OPERATOR ACTION
    │
    ▼
WIDGET (React component)
    │
    ├──→ createLog() ──→ POST /api/logs ──→ PostgreSQL
    │
    ├──→ recordSignal() ──→ intentionEngine store ──→ localStorage
    │                            │
    │                            ├──→ analyzeIntentions() [every 5 signals]
    │                            └──→ syncToServer() [every 10 signals]
    │
    └──→ useLogs() refetch ──→ React re-render
                                    │
                                    ├──→ recomputeAssembly()
                                    ├──→ getUserState()
                                    ├──→ getUserIndex()
                                    └──→ getOptimalWidget()

================================================================================
07 // FEATURE BRANCH INVENTORY
================================================================================

See LOT-MANIFEST.md for the full catalog.

SUMMARY:
  125 remote branches total
  115 claude/* feature branches
  23 session clusters
  8 ship-ready features waiting
  ~69 branches safely prunable (redundant iterations)

SHIP-READY FEATURES:
  1. LOT Mail            — email system
  2. Basics Tab          — ration subscription
  3. Calendar Alerts     — live countdown + military alerts
  4. QI-46 Engine        — soul engine + vocabulary extractor
  5. COSMO Hardware      — device spec + firmware + API
  6. Health/Security     — model upgrade + endpoint hardening
  7. Badge RPG           — 57 badges + achievement codex
  8. Self-Assembly v45   — patterns 63-66, archetype 18

SHIPPED (already on master):
  - Router isolation + subscription reduction (perf)
  - Biofield lag fix + calendar retrieval fix
  - Button subscription reduction
  - IntegrityWidget (lie detector)
  - Calendar [SCHEDULE] tag + font normalization

================================================================================
08 // BENCHMARK PROTOCOL
================================================================================

Build verification uses the LOT Benchmark skill (00-08 pipeline):
  00 PREFLIGHT    — verify environment
  01 INTAKE       — classify artifact
  02 CHECK A      — pre-build baseline
  03 BUILD        — execute build
  04 CHECK B      — green gate
  05 REPORT+ROUTE — write session report, file artifacts
  06 DISTILL      — update ledger, lexicon, doctrine
  07 PUSH         — commit, tag, push
  08 CHECK C      — post-push verification

Ship Mode (for self-assembly routines):
  "Ship [feature]" reads MANIFEST, cherry-picks BEST iteration
  onto staging branch, runs full 00-08 pipeline, merges to master
  on green. See lot-benchmark skill for details.

SESSION REPORTS:     docs/benchmark/LOT-SR-YYYYMMDD-NN.md
LEDGER:              docs/benchmark/LOT-LEDGER.md (append-only index)
LEXICON:             docs/benchmark/LOT-LEXICON.md (controlled vocabulary)
DOCTRINE:            docs/benchmark/LOT-DOCTRINE.md (compressed principles)
MANIFEST:            docs/benchmark/LOT-MANIFEST.md (branch catalog)

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-SYSTEM-OUTLINE
================================================================================
