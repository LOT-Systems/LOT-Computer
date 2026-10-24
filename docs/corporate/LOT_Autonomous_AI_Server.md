<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT COMPUTER — AUTONOMOUS TRANSPARENT AI SERVER
## Hardware + Stack Specification · System Preparation Report
## 30 May 2026

---

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   LOT SYSTEMS CORPORATION                                     ║
║   AUTONOMOUS TRANSPARENT AI SERVER                            ║
║                                                               ║
║   SELF-HOSTED / LOCAL-INFERENCE / AUDIT-BY-DEFAULT            ║
║                                                               ║
║   THE METAL IS THE FLOOR. THE DISCIPLINE IS THE STRUCTURE.    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 00 — PRINCIPLE

A single-node machine that runs the company. Local large-language-model inference, agent orchestration, and an append-only transparency ledger. No silent writes. Every action emits a record. The irreversible operations sit behind a human gate. Hardware is the floor; discipline is the structure.

```
┌──────────────┐  ┌──────────────────┐  ┌───────────────────────┐  ┌──────────────────┐
│ OWN THE      │  │ RECORD EVERY     │  │ GATE THE              │  │ CUT POWER        │
│ METAL        │  │ ACT              │  │ IRREVERSIBLE          │  │ AT WILL          │
└──────────────┘  └──────────────────┘  └───────────────────────┘  └──────────────────┘
```

---

## 01 — NODE-0 / THE METAL

```
COMPONENT        SPEC                                    ENTRY      SERIOUS
─────────────────────────────────────────────────────────────────────────────
GPU              RTX 5090 32GB → 2× / A6000-class       $2,000     $4,200
CPU              7950X 16C → Threadripper 7960X 24C      $500       $1,300
BOARD            AM5 → TRX50 HEDT                        $300       $900
RAM              128GB → 256GB ECC DDR5                   $600       $1,300
STORAGE          2TB + 2×8TB NVMe / ZFS mirror           $1,050     $1,250
PSU              1600W Platinum 12VHPWR                   $350       $450
UPS              1500VA line-interactive                   $250       $400
CASE/COOL/NIC    4U / 360 AIO / 10GbE                    $550       $750
─────────────────────────────────────────────────────────────────────────────
TOTAL            SINGLE-GPU → DUAL-GPU NODE              ≈ $5,600   ≈ $10,550
```

---

## 02 — NODE-1 / THE STACK

```
LAYER           CHOICE                          WHY
─────────────────────────────────────────────────────────────────────────────
OS              Debian 12 / Fedora Server       Bare, boring, stable
FILESYSTEM      ZFS                             Checksums + snapshots = rollback
CONTAINERS      Docker + Compose                Isolated, declared, reproducible
PROXY / TLS     Caddy                           Automatic HTTPS, one config file
INGRESS         Cloudflare Tunnel               No open inbound ports
GIT             Gitea                           Self-hosted, mirrors GitHub
MODEL SERVE     Ollama / vLLM                   Ollama for iteration, vLLM for throughput
MODELS          LLaMA 3.3 70B Q4 / Qwen 2.5    Big for work, small for routing
ORCHESTRATION   Fastify (existing stack)        Already the LOT backend
DATABASE        PostgreSQL                      Already the LOT database
```

---

## 03 — SYSTEM PREPARATION STATUS

### What Already Existed

```
COMPONENT                     STATUS
─────────────────────────────────────────────────
Fastify 5.6.1 server          ✓ OPERATIONAL
PostgreSQL via Sequelize       ✓ OPERATIONAL
AI Engine abstraction layer    ✓ OPERATIONAL (5 cloud providers)
Audit log table                ✓ OPERATIONAL (auth events)
Dockerfile                     ✓ OPERATIONAL
Security middleware            ✓ OPERATIONAL (rate limit, fingerprint, CSP)
Session management             ✓ OPERATIONAL (JWT, cookies, expiry)
```

### What Was Added (This Session)

```
COMPONENT                     FILE                                    STATUS
──────────────────────────────────────────────────────────────────────────────
Ollama Engine (local LLM)     src/server/utils/ai-engines.ts          ✓ ADDED
  - 7-model fallback chain    llama3.3:70b → qwen2.5:72b → 8b
  - OpenAI-compatible API     via OLLAMA_BASE_URL
  - Primary in auto mode      ollama → together → gemini → ...

Agent Decision Ledger         src/server/utils/ledger.ts              ✓ ADDED
  - INPUT → CLASSIFY →        recordAction() — append-only
    ACTION → RECORD
  - Action classification     read/write/notify/financial/irreversible
  - Human gate system          requiresGate() — blocks irreversible ops
  - Kill switch               killAgentLoop() — halts all agent loops
  - Gate approval/denial      approveAction() / denyAction()

Ledger Migration              migrations/20260530120000_...           ✓ ADDED
  - agent_ledger table        BIGINT PK, append-only, JSONB metadata
  - 5 indexes                 timestamp, source, classification, gate, userId

Docker Compose (NODE-0)       docker-compose.node0.yml                ✓ ADDED
  - postgres                  16-alpine, local, no SSL
  - ollama                    GPU passthrough, model volume
  - app                       LOT Computer, Ollama-first
  - caddy                     Automatic HTTPS, reverse proxy
  - gitea                     Self-hosted git, GitHub mirror

Caddy Config                  Caddyfile                               ✓ ADDED
  - Reverse proxy             app:8080
  - Security headers          HSTS, X-Frame-Options, etc.
  - Git subdomain             git.lot-systems.com → gitea

NODE-0 Environment            .env.node0.example                      ✓ ADDED
  - Local Postgres            DB_SSL=false, port 5432
  - Ollama primary            OLLAMA_ENABLED=true
  - Cloud fallback            Optional API keys

SSL-Optional DB Connection    src/server/utils/db.ts                  ✓ MODIFIED
  - DB_SSL=false support      Skips SSL for local Postgres
```

---

## 04 — THE TRANSPARENCY LAYER

### Agent Decision Schema

```
INPUT → CLASSIFY → ACTION → RECORD

Every loop emits an append-only ledger entry BEFORE the action commits.
```

### Action Classifications

```
CLASS           GATE      DESCRIPTION
───────────────────────────────────────────────────────
read            auto      No side effects
write           auto      Mutates local state
notify          HUMAN     Sends email, push, alert
financial       HUMAN     Moves money
irreversible    HUMAN     Cannot be undone
external        auto      Calls external API
```

### Ledger Table Schema

```
agent_ledger
  id              BIGINT AUTO-INCREMENT (append-only)
  timestamp       TIMESTAMP DEFAULT NOW()
  source          VARCHAR(128) — which system initiated
  input           TEXT — what triggered the action
  classification  VARCHAR(32) — read/write/notify/financial/irreversible
  action          VARCHAR(500) — what was done
  gate            VARCHAR(16) — auto/pending/approved/denied/expired
  result          TEXT — outcome
  metadata        JSONB — flexible context
  userId          UUID FK → users
  duration_ms     INTEGER — execution time
```

### Kill Switch

```
killAgentLoop()    — one call halts all agent loops
resumeAgentLoop()  — resume after review
isAgentLoopActive() — check before any autonomous action

The UPS + power cut is the physical backstop.
```

---

## 05 — INFERENCE CHAIN (Updated)

```
PRIORITY    ENGINE              LOCATION        MODEL
──────────────────────────────────────────────────────────────
1           Ollama (Local)      NODE-0 GPU      LLaMA 3.3 70B Q4
2           Together AI         Cloud           LLaMA 3.3 70B Turbo
3           Google Gemini       Cloud           Gemini 1.5 Pro
4           Mistral AI          Cloud           Mistral Large
5           Anthropic Claude    Cloud           Claude 3.5 Sonnet
6           OpenAI              Cloud           GPT-4 Turbo
```

When `OLLAMA_ENABLED=true`, the local engine is tried first. Cloud providers are fallback only. On NODE-0, the machine runs the thinking. The cloud is the safety net.

---

## 06 — BUILD ORDER

```
01   Assemble metal. Single GPU. Install OS on the 2TB NVMe.
02   Build the ZFS mirror on the 8TB drives. Take a baseline snapshot.
03   docker compose -f docker-compose.node0.yml up -d
04   Postgres + ledger table created automatically via migrations.
05   docker exec lot-ollama ollama pull llama3.3:70b-instruct-q4_K_M
06   App starts with Ollama as primary engine.
07   Human gate active on irreversible actions via ledger.ts.
08   Configure Gitea mirror: https://github.com/LOT-Systems/LOT-Computer.git
```

Order matters: the ledger exists before the first autonomous action, so there is never a window where the machine acts unobserved.

---

## 07 — FILE MAP

```
INFRASTRUCTURE:
  docker-compose.node0.yml        Full NODE-0 stack (5 services)
  Caddyfile                       Reverse proxy + HTTPS
  .env.node0.example              Environment template
  Dockerfile                      Application container (existing)

LOCAL INFERENCE:
  src/server/utils/ai-engines.ts
    ├─ OllamaEngine class         Local LLM via OpenAI-compatible API
    ├─ 7-model fallback chain     70B → 72B → 8B
    ├─ EnginePreference type      Added 'ollama'
    ├─ AIEngineManager            Ollama registered first
    └─ fallbackOrder              ollama → together → gemini → mistral → claude → openai

TRANSPARENCY LAYER:
  src/server/utils/ledger.ts
    ├─ recordAction()             Append-only ledger write
    ├─ classifyAction()           Auto-classify by action string
    ├─ requiresGate()             Check if human gate needed
    ├─ killAgentLoop()            Emergency halt
    ├─ approveAction()            Human approves gated action
    └─ denyAction()               Human denies gated action

  migrations/20260530120000_add-agent-ledger-table.cjs
    └─ agent_ledger table         BIGINT PK, 5 indexes, append-only

DATABASE:
  src/server/utils/db.ts
    └─ SSL-optional connection    DB_SSL=false for local Postgres
```

---

## 08 — THREE WAYS IN

```
FLOOR                           SERIOUS                         SINGLE-CARD MAX
──────────────────────────────────────────────────────────────────────────────────
7950X · 1× RTX 5090 32GB       Threadripper 7960X · 2× RTX    RTX PRO 6000
128GB ECC · single 8TB + 2TB   5090 (64GB) · 256GB ECC        Blackwell 96GB
Runs a 70B Q4 model daily      ZFS mirror · concurrent models  120B+ MoE models
≈ $5,600                       ≈ $10,550                       ≈ $8,500 (GPU)
```

---

## THE STANDARD

The server is judged not by what it can do unsupervised, but by what it cannot do without leaving a mark.

An action that cannot be seen did not happen.

---

```
LOT SYSTEMS CORPORATION
Autonomous Transparent AI Server
System Preparation Report
v1.3.0 · 30 May 2026
Made in the USA
```
