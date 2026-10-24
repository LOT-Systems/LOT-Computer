================================================================================
LOT SYSTEMS / EMERGENCY REBUILD PROTOCOL
DOCUMENT: LOT-BACKUP-PROTOCOL
CLASS:    RESTRICTED // S-1 EYES
S-1:      VADIK MARMELADOV
VERSION:  1.0
DATE:     2026-06-06
================================================================================

This document contains everything needed to rebuild the LOT system from
zero infrastructure in case of catastrophic failure. It assumes total loss
of the production environment — all that survives is this repo and a
database backup.

Store this document in the repo. Store a printed copy off-site. The repo
itself is the backup — any git clone on any machine has the whole system.

================================================================================
TABLE OF CONTENTS
================================================================================

  00  PREREQUISITES
  01  ARCHITECTURE OVERVIEW
  02  ENVIRONMENT VARIABLES (complete list)
  03  DATABASE SCHEMA (10 tables)
  04  DATABASE BACKUP & RESTORE
  05  SERVER REBUILD (step-by-step)
  06  CLIENT REBUILD
  07  DEPLOYMENT (Digital Ocean)
  08  POST-DEPLOY VERIFICATION
  09  DATA RECOVERY PRIORITIES
  10  FILE INVENTORY (complete)
  11  SELF-ASSEMBLY CORPUS
  12  EMERGENCY CONTACTS & ACCOUNTS

================================================================================
00 // PREREQUISITES
================================================================================

REQUIRED SOFTWARE:
  Node.js      >= 20.x
  Yarn         >= 1.22.x
  PostgreSQL   >= 14 (managed or local)
  Git          >= 2.x
  TypeScript   >= 5.9.3

REQUIRED ACCOUNTS:
  Digital Ocean     — App Platform (hosting) + Managed Database
  Resend            — Transactional email (login codes)
  Together AI       — Primary AI engine (Memory, QI, /prayer, /assembly)
  GitHub            — Source code repository

OPTIONAL ACCOUNTS (enhance but not required):
  Anthropic         — Claude API (premium Memory Engine)
  OpenAI            — GPT fallback
  Google            — Gemini fallback
  Mistral           — Mistral fallback

PRODUCTION URL:
  https://lot-systems.com

DOMAIN REGISTRAR:
  Verify DNS records point to Digital Ocean App Platform.
  A record -> Digital Ocean load balancer IP
  CNAME www -> lot-systems.com

================================================================================
01 // ARCHITECTURE OVERVIEW
================================================================================

LOT is a monorepo full-stack TypeScript application.

  ┌─────────────────────────────────────────────────────┐
  │                    BROWSER                          │
  │  React 18 + Nanostores + TailwindCSS + esbuild     │
  │  7 entry points: app, login, about, status,        │
  │                  public-profile, us, ui-lib         │
  │  81 components, 13 stores, 23 utils                 │
  └────────────────────┬────────────────────────────────┘
                       │ HTTPS (cookie auth + SSE)
  ┌────────────────────▼────────────────────────────────┐
  │                  SERVER                             │
  │  Fastify 5 + Sequelize 6 + JWT                     │
  │  5 route files: api, auth, admin-api, os-api,      │
  │                 public-api                          │
  │  AI Engine Manager: Together > Gemini > Mistral >   │
  │                     Claude > OpenAI (fallback chain)│
  └────────────────────┬────────────────────────────────┘
                       │ SSL (managed cert)
  ┌────────────────────▼────────────────────────────────┐
  │              POSTGRESQL (managed)                   │
  │  10 tables, JSONB metadata, UUID primary keys       │
  │  Digital Ocean Managed Database                     │
  └─────────────────────────────────────────────────────┘

CODEBASE METRICS (as of 2026-06-06):
  Source files:    214
  Total lines:     26,479
  Components:      81  (src/client/components/)
  Stores:          13  (src/client/stores/)
  Server routes:   9,868 lines across 5 files
  Dependencies:    37 production + 35 dev

================================================================================
02 // ENVIRONMENT VARIABLES (complete list)
================================================================================

Copy .env.example to .env and fill ALL values. On Digital Ocean, set these
as App-level environment variables.

REQUIRED — server will not start without these:
──────────────────────────────────────────────────────────────────────────
  NODE_ENV=production
  PORT=8080
  APP_NAME="LOT Systems"
  APP_HOST=https://lot-systems.com
  APP_DESCRIPTION="LOT is a subscription service..."

  # Database (Digital Ocean Managed PostgreSQL)
  DB_HOST=<database-host>.db.ondigitalocean.com
  DB_PORT=25060
  DB_NAME=defaultdb
  DB_USER=doadmin
  DB_PASSWORD=<database-password>
  DB_SSL=true

  # Authentication
  JWT_SECRET=<64-char hex string>
  # Generate: openssl rand -hex 32

  # Email (login codes)
  RESEND_API_KEY=re_<key>
  RESEND_FROM_EMAIL=support@lot-systems.com
  RESEND_FROM_NAME=LOT

  # Admin access
  ADMIN_EMAILS=vadikmarmeladov@gmail.com

REQUIRED FOR AI FEATURES (at least ONE):
──────────────────────────────────────────────────────────────────────────
  TOGETHER_API_KEY=<key>       # Primary — Memory Engine, QI, /prayer, /assembly
  ANTHROPIC_API_KEY=<key>      # Optional — Claude for Usership premium
  OPENAI_API_KEY=<key>         # Optional — fallback
  GOOGLE_API_KEY=<key>         # Optional — Gemini fallback
  MISTRAL_API_KEY=<key>        # Optional — Mistral fallback

OPTIONAL:
──────────────────────────────────────────────────────────────────────────
  GEONAMES_USERNAME=<username>           # City geolocation
  DB_CA_CERT_PATH=/path/to/ca-cert.crt  # Custom CA cert path
  BACKUP_ENCRYPTION_KEY=<64-char hex>    # For encrypted DB backups
  BACKUP_GITHUB_REPO=git@github.com:...  # Off-site backup repo
  BACKUP_RETENTION_DAYS=90

================================================================================
03 // DATABASE SCHEMA (10 tables)
================================================================================

All tables use UUID v4 primary keys. Timestamps are auto-managed.
Sequelize handles schema creation via `sequelize.sync()`.

TABLE: users
──────────────────────────────────────────────────────────────────────────
  id              UUID PK DEFAULT uuid_v4
  email           STRING NOT NULL UNIQUE
  firstName       STRING NULL
  lastName        STRING NULL
  country         STRING NULL
  city            STRING NULL
  address         STRING NULL
  phone           STRING NULL
  timeZone        STRING NULL
  hideActivityLogs BOOLEAN DEFAULT false
  timeChime       STRING NULL
  tags            JSONB DEFAULT []           -- e.g. ["Usership", "RND"]
  lastSeenAt      DATE NULL
  joinedAt        DATE NULL
  stripeCustomerId STRING NULL
  metadata        JSONB DEFAULT {}           -- privacy, theme, quantumIntentState, profileVisits
  createdAt       DATE
  updatedAt       DATE

TABLE: Sessions
──────────────────────────────────────────────────────────────────────────
  id              UUID PK
  token           STRING NOT NULL
  userId          UUID FK -> users.id
  expiresAt       DATE NULL
  createdFromIp   STRING NULL
  fingerprint     STRING NULL
  lastUsedAt      DATE NULL
  createdAt       DATE
  updatedAt       DATE
  ASSOCIATION:    belongsTo(User)

TABLE: Logs
──────────────────────────────────────────────────────────────────────────
  id              UUID PK
  userId          UUID FK -> users.id ON DELETE CASCADE
  text            TEXT NULL
  event           STRING NOT NULL          -- note, answer, emotional_checkin,
                                           -- calendar_entry, qi_rfi, assembly_directive,
                                           -- prayer_scripture, system_snapshot, etc.
  metadata        JSONB DEFAULT {}         -- event-specific data
  context         JSONB DEFAULT {}
  createdAt       DATE
  updatedAt       DATE

TABLE: Answers
──────────────────────────────────────────────────────────────────────────
  id              UUID PK
  userId          UUID FK -> users.id
  question        TEXT
  options         JSONB
  answer          TEXT
  metadata        JSONB DEFAULT {}
  createdAt       DATE
  updatedAt       DATE

TABLE: EmailCodes
──────────────────────────────────────────────────────────────────────────
  id              UUID PK
  token           STRING
  code            STRING
  email           STRING
  magicLinkToken  STRING
  validUntil      DATE
  createdAt       DATE
  updatedAt       DATE

TABLE: LiveMessages (SSE broadcast)
──────────────────────────────────────────────────────────────────────────
  id              UUID PK
  authorUserId    UUID
  message         TEXT
  createdAt       DATE
  updatedAt       DATE

TABLE: ChatMessages
──────────────────────────────────────────────────────────────────────────
  id              UUID PK
  authorUserId    UUID
  message         TEXT
  createdAt       DATE
  updatedAt       DATE

TABLE: ChatMessageLikes
──────────────────────────────────────────────────────────────────────────
  id              UUID PK
  userId          UUID
  messageId       UUID
  createdAt       DATE

TABLE: DirectMessages
──────────────────────────────────────────────────────────────────────────
  id              UUID PK
  senderId        UUID
  receiverId      UUID
  message         TEXT
  createdAt       DATE
  updatedAt       DATE

TABLE: WeatherResponses
──────────────────────────────────────────────────────────────────────────
  id              UUID PK
  city            STRING
  country         STRING
  weather         JSONB
  createdAt       DATE

================================================================================
04 // DATABASE BACKUP & RESTORE
================================================================================

BACKUP METHODS (use ALL three):

1. AUTOMATED DAILY (Digital Ocean):
   Digital Ocean Managed Database includes daily automated backups.
   Retention: 7 days. Restore via DO dashboard.

2. MANUAL ON-DEMAND:
   yarn db:backup
   # Outputs: backups/lot-backup-YYYY-MM-DD-HHMMSS.sql

3. ENCRYPTED OFF-SITE (to private GitHub repo):
   yarn db:backup:encrypted
   # Requires: BACKUP_ENCRYPTION_KEY, BACKUP_GITHUB_REPO

4. PRE-DEPLOY (automatic before each deploy):
   yarn pre-deploy
   # Creates backup before any deployment

RESTORE FROM BACKUP:
──────────────────────────────────────────────────────────────────────────
  # 1. Create a new managed PostgreSQL database on Digital Ocean
  #    (or provision locally for testing)

  # 2. Restore from SQL dump:
  psql "postgresql://doadmin:<password>@<host>:25060/defaultdb?sslmode=require" \
       < backups/lot-backup-YYYY-MM-DD.sql

  # 3. Or restore from encrypted backup:
  openssl enc -aes-256-cbc -d -pbkdf2 \
       -in backup-encrypted.sql.enc \
       -out backup-decrypted.sql \
       -pass env:BACKUP_ENCRYPTION_KEY
  psql "..." < backup-decrypted.sql

  # 4. If NO backup exists — Sequelize recreates empty tables:
  #    The app will start with empty tables. Users re-register.
  #    All historical data (logs, answers, profiles) is lost.
  #    This is the worst case — prioritize database backup above all.

DATA THAT CANNOT BE RECOVERED WITHOUT BACKUP:
  - User accounts (email, profile, tags, metadata)
  - All log entries (journal, notes, emotional check-ins, QI RFIs)
  - All memory answers (psychological profile data)
  - Session history
  - Chat messages

DATA THAT CAN BE REGENERATED:
  - Weather responses (re-fetched on next login)
  - Email codes (ephemeral, short-lived)
  - Psychological profiles (re-computed from answers if answers exist)
  - Self-assembly state (client-side, localStorage per user)
  - QIE signals (client-side, localStorage per user, 7-day retention)

================================================================================
05 // SERVER REBUILD (step-by-step)
================================================================================

From a fresh machine with Node 20+ and Git:

  # 1. Clone the repository
  git clone git@github.com:LOT-Systems/LOT-Computer.git
  cd LOT-Computer

  # 2. Checkout the last known-good tag
  git tag --list 'benchmark-*' --sort=-creatordate | head -1
  # e.g. benchmark-20260606-02
  git checkout <tag>
  # OR stay on the ship branch:
  git checkout claude/quantum-engine-widgets-RgFfC

  # 3. Install dependencies
  yarn install

  # 4. Configure environment
  cp .env.example .env
  # Fill ALL required values (see section 02)

  # 5. If using SSL for database, place CA certificate:
  mkdir -p certs
  # Download from Digital Ocean dashboard -> Databases -> CA Certificate
  cp ca-certificate.crt certs/

  # 6. Build client + server
  yarn build
  # This runs:
  #   postcss ./src/client/index.css -> dist/client/css/index.css
  #   esbuild src/client/entries/* -> dist/client/js/*.js
  #   tsc --project tsconfig.server.json -> dist/server/
  #   node scripts/fix-esm-imports.js

  # 7. Run database migrations (if any exist)
  yarn migrations:up
  # Sequelize.sync() also auto-creates missing tables on first start

  # 8. Start the server
  yarn start
  # OR for development:
  yarn dev:local

  # 9. Verify
  curl http://localhost:8080/health
  # Expected: {"status":"ok","timestamp":"..."}

BUILD COMMANDS REFERENCE:
  yarn build              # Full build (client + server)
  yarn client:build       # Client only (CSS + JS)
  yarn server:build       # Server only (TypeScript compile)
  yarn start              # Start production server
  yarn dev:local          # Start development server
  yarn client:watch       # Watch mode for client development
  yarn db:backup          # Manual database backup

VERIFY BUILD INTEGRITY:
  npx tsc --noEmit        # Type check (55 pre-existing errors OK)
  yarn build              # Must complete without errors

================================================================================
06 // CLIENT REBUILD
================================================================================

The client is built by esbuild, not Webpack. The build system is at
scripts/build/client.build.ts.

ENTRY POINTS (7 bundles):
  src/client/entries/app.tsx             -> dist/client/js/app.js
  src/client/entries/login.tsx           -> dist/client/js/login.js
  src/client/entries/about.tsx           -> dist/client/js/about.js
  src/client/entries/status.tsx          -> dist/client/js/status.js
  src/client/entries/public-profile.tsx  -> dist/client/js/public-profile.js
  src/client/entries/us.tsx              -> dist/client/js/us.js
  src/client/entries/ui-lib.tsx          -> dist/client/js/ui-lib.js

CSS: PostCSS + TailwindCSS (tailwind.config.js, postcss.config.cjs)
  src/client/index.css -> dist/client/css/index.css

TEMPLATES (EJS, server-rendered HTML shells):
  templates/generic-spa.ejs     # All pages use this shell
  templates/header.ejs          # <head> with CSP nonces
  templates/header-scripts.ejs  # Script tags
  templates/footer.ejs

STATIC ASSETS:
  public/index.html             # Fallback
  public/sw.js                  # Service worker (PWA)
  public/manifest.webmanifest   # PWA manifest
  public/og.jpg                 # OpenGraph image
  public/radio/*.mp3            # Audio tracks (LOT Radio)

STATE MANAGEMENT (Nanostores — NOT Redux):
  stores/index.ts               # Main store barrel (theme, router, user, etc.)
  stores/intentionEngine.ts     # QIE — signal recording, pattern analysis (3000+ lines)
  stores/selfAssembly.ts        # 18-module self-assembly engine
  stores/chakraErgonomics.ts    # 7-chakra ergonomic model
  stores/evolution.ts           # Interface evolution state
  stores/theme.ts               # Theme management
  stores/router.ts              # Client-side routing
  stores/layout.ts              # Layout state
  stores/rewardWidgets.ts       # Milestone + cooldown gating
  stores/plannerWidget.ts       # Routine planner state
  stores/recipeWidget.ts        # Recipe state
  stores/punctuationContext.ts  # Context-aware punctuation
  stores/state.ts               # Global state

CLIENT-SIDE PERSISTENCE:
  All stores use localStorage via @nanostores/persistent.
  QIE signals: key "intention-engine", max 1000 signals, 7-day retention.
  Self-assembly: key "self-assembly-state", ~3-5KB.
  These are per-browser — NOT synced to server except via /quantum-intent/sync.

================================================================================
07 // DEPLOYMENT (Digital Ocean)
================================================================================

LOT runs on Digital Ocean App Platform. The deployment is git-push triggered.

INFRASTRUCTURE:
  App Platform      — Node.js app (auto-scaled)
  Managed Database  — PostgreSQL 14+ (25060, SSL required)
  Domain            — lot-systems.com (DNS via DO or registrar)

DEPLOYMENT STEPS (from scratch):
──────────────────────────────────────────────────────────────────────────

  1. Create Digital Ocean App:
     - Source: GitHub -> LOT-Systems/LOT-Computer
     - Branch: master (or the current ship branch)
     - Build command: yarn install && yarn build
     - Run command: yarn start
     - HTTP port: 8080
     - Health check: /health

  2. Create Managed PostgreSQL Database:
     - Engine: PostgreSQL 14+
     - Plan: Basic (1 GB RAM minimum)
     - Region: same as App
     - Trusted sources: add the App's private network

  3. Set ALL environment variables in App Settings:
     (See section 02 — every REQUIRED variable must be set)

  4. Add domain:
     - Add lot-systems.com to the App
     - Configure DNS: A record -> App IP, or CNAME -> DO provided hostname
     - Enable SSL (auto via Let's Encrypt)

  5. Deploy:
     - Push to the configured branch
     - DO builds and deploys automatically
     - Check build logs for errors
     - Verify: https://lot-systems.com/health

  6. Set up database CA certificate:
     - Download from DO Dashboard -> Databases -> Connection Details
     - Place as certs/ca-certificate.crt in the repo (or set DB_CA_CERT_PATH)

DEPLOY TRIGGER:
  git push origin master    # Triggers automatic deploy

ROLLBACK:
  # Via benchmark tags (never pruned):
  git checkout benchmark-YYYYMMDD-NN
  git push origin master --force   # CAUTION: requires S-1 authorization

  # Via Digital Ocean dashboard:
  App -> Activity -> Roll back to previous deployment

================================================================================
08 // POST-DEPLOY VERIFICATION
================================================================================

After any deployment, verify these endpoints:

  curl https://lot-systems.com/health
  # -> {"status":"ok"}

  curl https://lot-systems.com/api/public/status
  # -> All checks should be "ok"

  curl https://lot-systems.com/api/public/profile/machiavelli
  # -> Demo account data (hardcoded, no DB needed)

  # Login test:
  # 1. Navigate to https://lot-systems.com
  # 2. Enter vadikmarmeladov@gmail.com
  # 3. Check email for login code
  # 4. Enter code -> should redirect to main app

  # System tab test:
  # 1. After login, navigate to System tab
  # 2. Biofield check-in buttons should respond immediately
  # 3. Memory question should appear (requires TOGETHER_API_KEY)

  # LOG terminal test:
  # 1. Navigate to Log tab
  # 2. Type "/qi what is my current state?" -> should return INTSUM
  # 3. Type "/scan" -> should show system diagnostic
  # 4. Type "/prayer" -> should return Bible scripture

================================================================================
09 // DATA RECOVERY PRIORITIES
================================================================================

In order of criticality (recover these first):

  PRIORITY 1 — CRITICAL (system non-functional without):
    ✦ Source code repository (this repo)
    ✦ Database: users table (accounts, auth)
    ✦ Database: Sessions table (active logins)
    ✦ Environment variables (API keys, DB credentials)

  PRIORITY 2 — HIGH (core user data):
    ✦ Database: Logs table (all journal entries, notes, events)
    ✦ Database: Answers table (Memory Engine responses)
    ✦ User metadata JSONB (privacy settings, theme, quantum state)

  PRIORITY 3 — MEDIUM (social + engagement):
    ✦ Database: ChatMessages, DirectMessages (community data)
    ✦ Database: ChatMessageLikes
    ✦ User tags (Usership status, admin flags)

  PRIORITY 4 — LOW (regenerable):
    ✦ WeatherResponses (re-fetched automatically)
    ✦ EmailCodes (ephemeral)
    ✦ Client localStorage (QIE signals, self-assembly state)
    ✦ Psychological profiles (re-computed from Answers)

  PRIORITY 5 — DOCUMENTATION (in repo):
    ✦ docs/benchmark/ (session reports, ledger, lexicon, doctrine)
    ✦ docs/assembly/ (self-assembly logs v7-v49)
    ✦ docs/badges/ (codex PDFs)
    ✦ docs/deployment/ (deploy guides)

================================================================================
10 // FILE INVENTORY (complete source tree)
================================================================================

SERVER (src/server/) — 57 files:
  index.ts                          Entry point, Fastify setup, security, routes
  server.ts                         Legacy server setup (development mode)
  config.ts                         Environment variable parsing
  constants.ts                      Server constants
  sync.ts                           SSE broadcast bus
  types.ts                          Server type declarations
  security-config.ts                Security headers, vuln scan detection
  scheduled-jobs.ts                 Monthly email jobs
  models/index.ts                   Model registry + associations
  models/user.ts                    User model (tags, metadata JSONB)
  models/log.ts                     Log model (event + metadata JSONB)
  models/answer.ts                  Memory answer model
  models/session.ts                 Session model (JWT token, expiry)
  models/email-code.ts              Login code model
  models/live-message.ts            SSE broadcast messages
  models/chat-message.ts            Community chat
  models/chat-message-like.ts       Chat likes
  models/direct-message.ts          Direct messages
  models/weather-response.ts        Weather cache
  routes/api.ts                     Main API (5,213 lines) — logs, memory, QI, prayer, assembly
  routes/auth.ts                    Authentication (345 lines) — email login
  routes/admin-api.ts               Admin API (2,197 lines) — user management
  routes/public-api.ts              Public API (1,354 lines) — status, profiles, analytics
  routes/os-api.ts                  OS API (759 lines) — system operations
  routes/index.ts                   Route barrel
  utils/ai-engines.ts               Multi-engine AI manager (Together, Gemini, Mistral, Claude, OpenAI)
  utils/db.ts                       Sequelize PostgreSQL connection
  utils/email.ts                    Resend email client
  utils/weather.ts                  Open-Meteo weather API
  utils/security.ts                 Audit logging, vuln scan detection
  utils/memory.ts                   Memory engine (trait extraction, cohort)
  utils/memory/index.ts             Memory barrel
  utils/memory/constants.ts         Engine preferences, model configs
  utils/memory/question-generator.ts AI question generation
  utils/memory/story-generator.ts   Memory story generation
  utils/memory/trait-extraction.ts  Behavioral trait analysis
  utils/memory/cohort-determination.ts Archetype classification
  utils/memory/pacing.ts            Question pacing logic
  utils/memory/recipe-suggestions.ts Recipe suggestions
  utils/memory/types.ts             Memory types
  utils/contextual-prompts.ts       Context-aware AI prompts
  utils/compassionate-interventions.ts Wellness interventions
  utils/cohort-chat-catalyst.ts     Community chat catalyst
  utils/goal-understanding.ts       Goal parsing
  utils/energy.ts                   Energy calculations
  utils/monthly-summary.ts          Monthly summary generation
  utils/weekly-summary.ts           Weekly summary generation
  utils/patterns.ts                 QIE pattern definitions
  utils/questions.ts                Default question bank
  utils/rpg-narrative.ts            RPG narrative generation
  utils/ledger.ts                   Ledger utilities
  utils/logs.ts                     Log utilities
  utils/log.ts                      Logger (pino)
  utils/index.ts                    Server util barrel
  utils/dayjs.ts                    Dayjs configuration
  utils/custom-paths.ts             Custom URL resolution

CLIENT COMPONENTS (src/client/components/) — 81 files:
  System.tsx                        Main dashboard (widget orchestrator)
  Logs.tsx                          LOG terminal (journal, /qi, /prayer, /assembly, /scan)
  Settings.tsx                      User settings
  Sync.tsx                          Community + messaging
  About.tsx                         Field Manual (wiki)
  PublicProfile.tsx                  Public profile page
  EmotionalCheckIn.tsx              Biofield check-in (mood/energy buttons)
  MemoryWidget.tsx                  Memory Engine questions
  CalendarWidget.tsx                Calendar + scheduling
  QuantumEngineWidgets.tsx          Quantum Engine composite
  MicroGameWidget.tsx               Reward game
  MicroImageWidget.tsx              Reward image
  MicroCalculatorWidget.tsx         Inline calculator
  IntegrityWidget.tsx               Intent contradiction detector
  GoalJourneyWidget.tsx             Goal tracking
  IntentionsWidget.tsx              Intention setting
  PlannerWidget.tsx                 Routine planner
  SelfCareMoments.tsx               Self-care protocol
  RecipeWidget.tsx                  Nutrition/recipes
  ChakraErgonomicsWidget.tsx        7-chakra model
  QuantumStateWidget.tsx            Quantum state display
  SystemProgressWidget.tsx          Assembly progress
  SystemPulseWidget.tsx             System pulse
  PatternRecognitionWidget.tsx      Pattern display
  PatternInsightsWidget.tsx         Pattern insights
  CorrelatedIndexesWidget.tsx       4D index tracking
  SignalStreamWidget.tsx            Live signal stream
  MoodAnalytics.tsx                 Mood analytics
  EnergyCapacitor.tsx               Energy display
  TimeWidget.tsx                    Clock + time display
  CosmicUpdateWidget.tsx            Cosmic update
  NarrativeWidget.tsx               System narrative
  AwarenessDashboard.tsx            Awareness display
  JournalReflection.tsx             Journal depth
  FlashDriveManifest.tsx            Flash drive display
  BenchmarkWidget.tsx               Benchmark display
  UserMetricsWidget.tsx             User metrics
  EvolutionWidget.tsx               Interface evolution
  EvolutionMilestoneToast.tsx       Milestone notifications
  FourDimensionalUI.tsx             4D UI
  QuantumRandomWidget.tsx           Quantum random
  QuantumSignWidget.tsx             Quantum sign
  WorldCanvas.tsx                   3D world canvas
  ConnectionStatus.tsx              Online status
  ProfileQRCode.tsx                 QR code renderer
  SubscribeWidget.tsx               Usership prompt
  InvestmentSwitch.tsx              Investment display
  AngelInvestorWidget.tsx           Investor info
  CorporatePlanWidget.tsx           Corporate plan
  DemoDayWidget.tsx                 Demo day
  AIFeedbackWidget.tsx              AI feedback
  ArchitectWidget.tsx               Architect mode
  ChatCatalystWidget.tsx            Chat catalyst
  CohortConnectWidget.tsx           Cohort connection
  ContextualPromptsWidget.tsx       Contextual prompts
  InterfaceEvolutionWidget.tsx      Interface evolution
  InterventionsWidget.tsx           Wellness interventions
  AdminUser.tsx                     Admin user view
  AdminUsers.tsx                    Admin user list
  ApiPage.tsx                       API documentation
  StatusPage.tsx                    Public status page
  DirectMessageThread.tsx           DM thread
  stats/BadgeUnlockFeed.tsx         Badge feed
  stats/CollectiveConsciousness.tsx Collective stats
  stats/GrowthMilestones.tsx        Growth milestones
  stats/IntentionPatterns.tsx       Intention patterns
  stats/MemoryEngineStats.tsx       Memory stats
  stats/WellnessPulse.tsx           Wellness pulse
  ui/Block.tsx                      Block container
  ui/Button.tsx                     Button (3 variants)
  ui/Clock.tsx                      Clock component
  ui/Input.tsx                      Input field
  ui/Layout.tsx                     Layout + nav
  ui/Link.tsx                       Link/anchor
  ui/Page.tsx                       Page wrapper
  ui/Table.tsx                      Table
  ui/Tag.tsx                        Tag pill
  ui/Text.tsx                       Text component
  ui/ToggleSection.tsx              Collapsible section
  ui/WidgetErrorBoundary.tsx        Error boundary + perf
  ui/index.tsx                      UI barrel

CLIENT STORES (src/client/stores/) — 13 files:
  index.ts                          Main store barrel
  intentionEngine.ts                QIE (3000+ lines, 65 patterns, 18 archetypes)
  selfAssembly.ts                   18-module self-assembly engine
  chakraErgonomics.ts               7-chakra ergonomic model
  evolution.ts                      Interface evolution tracking
  theme.ts                          Theme management (6 themes + custom)
  router.ts                         Client routing (system/sync/settings/log/status)
  layout.ts                         Layout state
  state.ts                          Global state
  rewardWidgets.ts                  Reward widget gating
  plannerWidget.ts                  Planner state
  recipeWidget.ts                   Recipe state
  punctuationContext.ts             Context punctuation

CLIENT UTILS (src/client/utils/) — 23 files:
  logTriggers.ts                    15 slash command detectors
  badges.ts                         42+ badge types + award logic
  easter-eggs.ts                    Easter egg detection engine
  hooks.ts                          React hooks
  index.ts                          Util barrel
  breathe.ts                        Breathing exercise
  color.ts                          Color utilities
  communityPulse.ts                 Community pulse
  dayjs.ts                          Dayjs config
  fasting.ts                        Fasting tracker
  interfaceEvolution.ts             Interface evolution logic
  mirror.ts                         Mirror mode
  narrative.ts                      Narrative generation
  perf.ts                           Performance tracking
  punctuation.ts                    Punctuation context
  radio.ts                          Radio player
  sound.ts                          Sound effects
  sovietChime.ts                    Soviet chime sounds
  sovietGameSounds.ts               Game sounds
  sovietKeyboard.ts                 Keyboard sounds
  sse.ts                            Server-sent events client
  sun.ts                            Sunrise/sunset + weather
  themeEvolution.ts                 Theme evolution

SHARED (src/shared/) — 5 files:
  types/index.ts                    All shared TypeScript types
  constants/index.ts                Shared constants
  constants/recipes.ts              Recipe data
  utils/index.ts                    Shared utilities barrel
  utils/fp.ts                       Functional programming helpers
  utils/astrology.ts                Moon phase, astrology

================================================================================
11 // SELF-ASSEMBLY CORPUS
================================================================================

The benchmark system maintains an append-only record of all engineering
sessions. This corpus is the institutional memory of the project.

BENCHMARK FILES (docs/benchmark/):
  LOT-LEDGER.md                     Append-only index (one line per build)
  LOT-LEXICON.md                    Controlled vocabulary (18 tokens, rev C)
  LOT-DOCTRINE.md                   Distilled engineering principles (6 clauses, rev E)
  LOT-MANIFEST.md                   Branch catalog (125 branches, 8 ship-ready)
  LOT-SYSTEM-OUTLINE.md             Architecture map
  LOT-WEEKLY-2026-W23.md            Weekly ship report
  LOT-SR-YYYYMMDD-NN.md             Session reports (12 as of 2026-06-06)

ASSEMBLY LOGS (docs/assembly/):
  34 session logs from v5 to v49 (April-June 2026)
  Documents self-assembly engine evolution:
    Patterns: P22 -> P65 (65 named behavioral patterns)
    Archetypes: 0 -> 18 (physiological archetypes)
    Modules: 0 -> 18 (self-assembly modules)

BENCHMARK TAGS (permanent rollback lattice — never prune):
  benchmark-20260601-01 through benchmark-20260606-02
  Each tag is a verified GREEN build. Reset to any tag to restore
  a known-good state.

TO REBUILD THE CORPUS FROM SCRATCH:
  The corpus exists in the git repo. Any clone has it. If tags are
  lost, the session reports in docs/benchmark/ document every commit
  hash — you can manually re-tag from those records.

================================================================================
12 // EMERGENCY CONTACTS & ACCOUNTS
================================================================================

  S-1 / CEO:          Vadik Marmeladov
  EMAIL:              vadikmarmeladov@gmail.com
  PRODUCT:            https://lot-systems.com
  REPOSITORY:         github.com/LOT-Systems/LOT-Computer
  HOSTING:            Digital Ocean App Platform
  DATABASE:           Digital Ocean Managed PostgreSQL
  EMAIL SERVICE:      Resend (resend.com)
  AI ENGINE:          Together AI (api.together.xyz)
  DOMAIN REGISTRAR:   [check DNS records for current registrar]

  LOT® Founded:       7 April 2016
  COSMO® Founded:     1 July 2024
  Made in the USA

================================================================================
MINIMUM VIABLE RECOVERY (fastest path to live system):
================================================================================

  1. Clone repo:           git clone <repo-url> && cd LOT-Computer
  2. Install deps:         yarn install
  3. Set env vars:         cp .env.example .env && [fill required vars]
  4. Build:                yarn build
  5. Restore DB:           psql <connection-string> < backup.sql
  6. Start:                yarn start
  7. Verify:               curl localhost:8080/health

  Time estimate: 30 minutes with all credentials available.
  Without database backup: system starts empty. Users re-register.

================================================================================
AUTHORIZED BY: S-1 // VADIK MARMELADOV
END LOT-BACKUP-PROTOCOL
================================================================================
