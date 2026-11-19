# SESSION REPORT — USERSHIP 12-MONTH EVOLUTION · v1.0
## Date: 2026-11-19 · Branch: claude/elegant-mendel-mf5w9p
### Session Type: Product Design — Paid Tier Year One (Day 1 → LOT® AI)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                        ║
║  Usership · Twelve Volumes · Memory Compression Ladder           ║
║  November 19, 2026 · Scheduled routine                           ║
║  Authorized: S-2 // VADIK MARMELADOV                             ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. FRAMEWORK COMPLIANCE

| Step | Requirement | Result |
|---|---|---|
| 1 | Scan repository | DONE: branch clean, HEAD `9f2b88c` (Codex v33). Scanned `src/` for Usership, Memory, density, profile, demo account |
| 2 | Read the .MDs | DONE (targeted): 381 .md files in repo. Read in full or in part: README, docs/README, INTERFACE_EVOLUTION, MEMORY-ENGINE-COMPRESSION-ARCHITECTURE, widget→memory compression-loop assembly spec, LOT-STYLE-GUIDE, LOT_QI46_ENGINE (12-month Quantum Cube), LOT-SR-20261117-CODEX-v33. Grepped the remaining docs for Usership/12-month references. The ~300 wiki/codex/SR archives were scanned by keyword, not read line by line |
| 3 | Push session with detailed .MD | DONE: this report + `docs/technical/LOT-USERSHIP-12-MONTH-EVOLUTION.md` |
| 4 | Focus on 12-month tangibility of compressed Memory story | DONE: §5 "Memory Compression Ladder" of the spec |

**Demo account note:** `lot-systems.com/u/machiavelli` was **unreachable** from the session sandbox (egress
proxy 403). The demo profile was read from its source of truth, `src/server/routes/public-api.ts:745`
(1,469 Log entries · 2,847 Memory answers · 842 active days · archetype *The Strategist* · Memory Story · Weather
Station · Wallet · Legacy tag).

---

## 2. DELIVERABLE

**`docs/technical/LOT-USERSHIP-12-MONTH-EVOLUTION.md`**: the full design specification.

```
BOOK ONE · FOUNDATION     I Signal · II Rhythm · III Pattern
BOOK TWO · PRACTICE       IV Ritual · V Season · VI Mirror
BOOK THREE · DEPTH        VII Undercurrent · VIII Current · IX Architecture
BOOK FOUR · INTELLIGENCE  X Counsel · XI Legacy · XII LOT® AI
```

The core decisions:

- **A month unlocks when two things are true**: a calendar month has passed **and** the person has met a signal
  gate. The gate counts Log entries (×3 weight), morning check-ins (×2), self-care clicks and Memory answers.
- **Memory Capsule on every unlock.** It grows from 1 sentence (Vol I) to 1 page (Vol XII). The compression ratio
  is shown to the person, e.g. `Compressed 640 signals → 92 words.`
- **Voice arc:** the system *describes* you (I–VI) → *reads* you (VII–IX) → *speaks as* you (X–XII).
- **Widgets:** Volume (`Months unlocked: N/12`), the unlock ceremony, Ledger, Capsule (`Capsule: → Then: → Now:`),
  Chronicle, Principles, Counsel, Year One.
- **12 Volume Seals + 4 Book bookplates + 3 hidden seals**, ASCII-only, proposed as a Codex v34 Usership track.
- **Public profile `/u/user`** gains blocks per Volume and reaches the Machiavelli layout at XII. Legacy
  (XIII+) = Machiavelli exactly.

---

## 3. GAPS FOUND IN CURRENT CODE

1. `MonthlyPulseWidget` counts from `user.joinedAt`, not from the Usership start date. Someone who upgrades
   late starts mid-arc.
2. Pulse dismissal is stored only in `localStorage`, so it doesn't sync across devices and the AI can't see it.
3. The month count is time-only. There is no link to what the person actually did.

These are fixed by phase P1 of the implementation plan in the spec (§10).

---

## 4. CODE CHANGES

**None.** This was a design session. No runtime code was modified and the build state is unchanged from `9f2b88c`.

---

## 5. NEXT

- S-2 decisions on open questions (spec §11): what happens when a month is never gathered, email Capsules,
  exposing the demo `volumes`, Codex v34 count.
- Then P1 (journey API + `startedAt` + MonthlyPulse fix) → P2 (Volume widget) → P3 (Capsule engine).
