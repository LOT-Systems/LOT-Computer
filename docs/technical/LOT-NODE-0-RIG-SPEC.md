================================================================================
LOT SYSTEMS CORPORATION
AUTONOMOUS TRANSPARENT AI SERVER
HARDWARE + STACK SPECIFICATION
SELF-HOSTED / LOCAL-INFERENCE / AUDIT-BY-DEFAULT
================================================================================

DOCUMENT    RIG-SPEC / NODE-0
ISSUE DATE  2026.05.29
CLASS       INTERNAL / BUILD
STYLE       TERMINAL GRID
SOURCE      LOT_Autonomous_AI_Server_Spec.pdf

================================================================================

## 00  PRINCIPLE — WHAT "AUTONOMOUS" ACTUALLY MEANS

Autonomy here is not a black box that acts in secret. It is a machine that
drafts, routes, monitors, and proposes — continuously, without prompting —
while every consequential act is written to a record before it happens. The
hardware below is sized so the model that does the thinking runs on metal
you own, in a room you control, on power you can cut.

    OWN THE METAL    RECORD EVERY ACT    GATE THE IRREVERSIBLE    CUT POWER AT WILL

The transparency layer mirrors the LOT paper-trail logic: input → classify
→ action → record. An action that cannot be seen did not happen. The server
is judged not by what it can do unsupervised, but by what it cannot do
without leaving a mark.

================================================================================

## 01  NODE-0 / THE METAL — HARDWARE

### GPU — THE INFERENCE ENGINE

RTX 5090 32GB GDDR7 · 1,792 GB/s bandwidth · FP4/FP8 native (Blackwell).
The single number that matters for token speed is memory bandwidth — the
5090 carries ~77% more than the 4090. Runs LLaMA 3.3 70B at Q4, 30-40B
models comfortably without offload. The correct fresh-buy in 2026.

    STREET ≈ $2,000–$3,900
    ALT: RTX 4090 24GB ≈ $1,800–$2,750 (used, scarce)

### CPU + PLATFORM

AMD Threadripper 7960X · 24C / 48T · sTR5 · 88 usable PCIe lanes ·
quad-channel ECC DDR5. The lane count is the point: it feeds one or two
GPUs at full width and leaves room for NVMe + 10GbE. Lower-cost path:
Ryzen 9 7950X (16C) on AM5 — fewer lanes, still strong for a single GPU.

    7960X ≈ $1,000–$1,500
    TRX50 BOARD ≈ $700–$1,100
    ALT 7950X ≈ $500

### MEMORY (ECC)

128GB ECC DDR5-5200, quad-channel (4x32GB). ECC corrects bit-flips on an
always-on machine — one flipped bit over a long run corrupts state silently,
which is the opposite of transparent. Step to 256GB only if you run a second
GPU or large concurrent context windows.

    128GB ECC DDR5 ≈ $550–$800

### STORAGE / VAULT

2TB NVMe (OS + hot models) · 8TB NVMe (model library + data vault),
configured as a ZFS mirror. ZFS gives checksummed integrity and atomic
snapshots — you can roll the whole machine back to a known-good state.
The mirror means a single drive death does not take the company down.

    2TB ≈ $150
    2x 8TB ≈ $900–$1,100

### POWER + UPS

1600W 80+ Platinum with native 12VHPWR — headroom for a second GPU without
re-buying. Paired with a UPS so a grid blip triggers a clean ZFS shutdown
rather than a corrupt pool. The UPS is not optional on an always-on node.

    PSU ≈ $300–$450
    UPS (1500VA) ≈ $200–$400

### CHASSIS + NET + COOL

Full-tower or 4U rack case · >=3-slot GPU clearance · high static-pressure
airflow · 10GbE NIC · 360mm AIO or high-end air for the 350W CPU. A 5090
under sustained inference runs hot — thermal headroom is uptime.

    CASE + COOL + NIC ≈ $500–$750

================================================================================

## 02  COST — RIG BREAKDOWN

```
COMPONENT       SPEC                                    ENTRY       SERIOUS
─────────       ────                                    ─────       ───────
GPU             RTX 5090 32GB → 2x / A6000-class        $2,000      $4,200
CPU             7950X 16C → Threadripper 7960X 24C      $500        $1,300
BOARD           AM5 → TRX50 HEDT                        $300        $900
RAM             128GB → 256GB ECC DDR5                   $600        $1,300
STORAGE         2TB + 2x8TB NVMe / ZFS mirror           $1,050      $1,250
PSU             1600W Platinum 12VHPWR                   $350        $450
UPS             1500VA line-interactive                  $250        $400
CASE/COOL/NIC   4U / 360 AIO / 10GbE                    $550        $750
─────────       ────────────────────────────────         ─────       ───────
TOTAL           SINGLE-GPU → DUAL-GPU NODE               ≈ $5,600    ≈ $10,550
```

Buy the single-GPU node first. The second GPU roughly doubles cost and power
draw for diminishing returns unless you are running concurrent large models
or fine-tuning. Prices are current street ranges, May 2026 — the 4090 is
discontinued and the 5090 carries a scarcity premium, so both move week
to week.

================================================================================

## 03  NODE-1 / THE STACK — SOFTWARE

```
LAYER           CHOICE                                  WHY
─────           ──────                                  ───
OS              Debian 12 / Fedora Server               Bare, boring, stable.
FILESYSTEM      ZFS                                     Checksums + snapshots = rollback.
CONTAINERS      Docker + Compose                        Each service isolated, declared.
PROXY / TLS     Caddy                                   Automatic HTTPS, one config file.
INGRESS         Cloudflare Tunnel                       No open inbound ports.
GIT             Gitea                                   Self-hosted, mirrors GitHub.
MODEL SERVE     Ollama / vLLM                           vLLM for throughput, Ollama for iteration.
MODELS          LLaMA 3.3 70B Q4 / Qwen 2.5 72B / 8B   Big for work, small for routing.
ORCHESTRATION   n8n or custom Fastify loop              Fastify matches existing LOT backend.
DATABASE        PostgreSQL                              Already the LOT stack. State + ledger.
```

================================================================================

## 04  NODE-2 / TRANSPARENCY LAYER — THE PAPER TRAIL

### THE AGENT DECISION SCHEMA

    INPUT → CLASSIFY → ACTION → RECORD

Every loop emits an append-only ledger entry BEFORE the action commits.

### TRANSPARENCY PILLARS

- APPEND-ONLY LEDGER — every agent action written to an immutable Postgres
  table; nothing overwrites, nothing deletes.

- AUDIT STREAM — Loki + Grafana, or plain JSONL piped to a read-only
  terminal you can watch live.

- NO SILENT WRITES — a service that mutates state without a ledger row is
  a bug, not a feature.

- HUMAN GATE — payments, outbound email, legal filings, and irreversible
  ops require explicit sign-off.

- KILL SWITCH — one command halts all agent loops; the UPS + power cut is
  the physical backstop.

    CAUTION: A server that sends email, moves money, or files documents
    without a human gate is a liability, not an asset. Put autonomy on
    the routing / drafting / monitoring layer. Put human confirmation on
    the irreversible layer. This split is the whole design.

================================================================================

## 05  SEQUENCE — BUILD ORDER

```
01   Assemble metal. Single GPU. Install OS on the 2TB NVMe.
02   Build the ZFS mirror on the 8TB drives. Take a baseline snapshot.
03   Docker + Caddy + Cloudflare Tunnel. Close every inbound port.
04   Stand up Postgres + the append-only ledger table FIRST — before any agent.
05   Ollama + pull LLaMA 3.3 70B Q4. Confirm tokens/sec on the 5090.
06   Wire the orchestration loop: INPUT → CLASSIFY → ACTION → RECORD.
07   Add the human gate on irreversible actions. Test the kill switch.
08   Mirror Gitea from GitHub. Snapshot. Hand the company to the machine.
```

Order matters: the ledger exists before the first autonomous action, so
there is never a window where the machine acts unobserved.

================================================================================

## 06  PATHS — THREE WAYS IN

```
FLOOR                           SERIOUS                         SINGLE-CARD MAX
─────                           ───────                         ───────────────
7950X · 1x RTX 5090 32GB ·     Threadripper 7960X · 2x RTX    RTX PRO 6000 Blackwell
128GB ECC · single 8TB + 2TB.  5090 (64GB) · 256GB ECC ·      96GB on one card — fits
Runs a 70B Q4 model daily.     ZFS mirror. Concurrent          120B+ MoE models with no
The honest starting point.     models, fine-tuning             PCIe-sync penalty. The
                                headroom, real uptime.          clean high-VRAM path.

≈ $5,600                       ≈ $10,550                       ≈ $8,500 (GPU only)
```

THE METAL IS THE FLOOR. THE DISCIPLINE IS THE STRUCTURE.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.05.29
================================================================================
