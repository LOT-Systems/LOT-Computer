# SESSION REPORT — USERSHIP 12-MONTH EVOLUTION
## Date: 2026-11-22 · Branch: claude/elegant-mendel-53g88a
### Session Type: Product design / brainstorm (scheduled routine, no code changes)

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                       ║
║  Usership · 12 Chapters · Compressed Memory Story               ║
║  November 22, 2026                                              ║
║  Authorized: S-2 // VADIK MARMELADOV                            ║
╚══════════════════════════════════════════════════════════════════╝
```

## 1. Task

Outline the month-to-month evolution of the paid Usership tier, from a barebone
Day-1 UI to LOT® AI at Month 12, using `/u/machiavelli` as the evolved reference.
Focus: tangible monthly delivery of the compressed Memory story, driven by Log
entries, Memory answers, morning check-ins and self-care clicks. Badges,
affirmations, "Months unlocked: N/12" widget.

## 2. Framework compliance

| Step | Done |
|---|---|
| 1. Scan repository | Yes. `src/` widgets, memory engine, scheduled jobs, public API, shared types. |
| 2. Read the .MDs | 381 .md files in repo. Read in full or in part: README, docs/README, latest SR (Codex v33), Memory Compression Architecture, Style Guide, Wiki v83 Usership entry, QI·46 12-month section. The rest were grep-searched for Usership / 12-month / Memory topics, not read line by line. |
| 3. Push with detailed .MD | `docs/technical/LOT-USERSHIP-12-MONTH-EVOLUTION.md` + this report. |
| 4. Focus on compressed Memory tangibility | Hierarchical compression: Logs → Chapter → Story → Year Codex (§3 of design doc). |

## 3. Key findings from the scan

```
G1  story-generator.ts reads only the 30 most recent answers — no monthly memory.
G2  MonthlyPulseWidget counts months from joinedAt, not from Usership start.
G3  Month dismissal lives in localStorage — no server-side seal.
G4  Feature unlocks are not paced by paid tenure.
G5  No Usership-month badge line among 843 badges.
G6  Machiavelli demo shows the end state, not the 12-month path.
```

## 4. Deliverable summary

- **Doctrine:** time unlocks the month, practice fills it. A paying user never
  loses a month; the four signals set its depth (Trace / Sketch / Portrait / Codex).
- **12 chapters in 4 acts:** Arrival (M1–3), Pattern (M4–6), Depth (M7–9),
  Legacy (M10–12 → LOT® AI). Each month has a UI state, unlocks, a compression
  deliverable, an affirmation and an ASCII badge.
- **Widgets:** `Months unlocked:` (context), `Month N:` seal (evolves
  MonthlyPulseWidget), `Chapter:` (paragraph-long insight + quote),
  `Meridian:` / `Codex:` timeline.
- **Machiavelli:** proposed `usership` block with 12 sealed chapters and
  reachable year targets (312 Log · 365 Memory · 288 mornings · 240 self-care).
- **Roadmap:** 5 independent phases. Phase 1+2 (usership start date, server
  seal, chapter generator) deliver the core monthly paragraph.

## 5. Build status

Documentation only. No source files changed. No build run needed.

## 6. Next session candidates

1. Phase 1: `getUsershipMonth()` + `metadata.usership.startedAt`, fix G2.
2. Phase 2: `chapter-generator.ts` with local fallback.
3. S-2 decisions on open questions (§10 of design doc).
