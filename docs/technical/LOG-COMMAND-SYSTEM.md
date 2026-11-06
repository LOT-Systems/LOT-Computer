# LOG COMMAND SYSTEM — `/system` · `/story` · `/rank`

```
CLASS:     TECHNICAL // LOT® AI
S-2:       VADIK MARMELADOV
DATE:      2026-11-06
STATUS:    SHIPPED ON BRANCH claude/youthful-ritchie-ftfkby
MODULE:    src/client/utils/logCommands.ts
TEST:      npx tsx scripts/tests/test-log-commands.ts
```

## 1. PURPOSE
The Log is a passive-AI journal: the user writes, no prompts or questions. Each entry carries context
metadata (weather, time, location, astrology). Slash commands are the *only* explicit interface; they
are discovered by typing `/system`.

```
LOT User data → LOT Quantum Intent Engine → AI vendor (Together AI) → LOT personalized data stored
```

## 2. COMMANDS
| Command | Category | Effect |
|---|---|---|
| `/system` (`/commands`) | SYSTEM | Prints all commands, generated from the registry |
| `/story [day\|week\|month\|year]` (`📖`) | AI | Compressed story. Server `/api/story` first; deterministic local compression if the engine is unreachable |
| `/rank` (`/level`) | ARCADE | Level, XP, streak, next rank |
| `/qi` `/prayer` `/how` | AI | Existing |
| `/scan` `/assembly` `/phys` `/qos` `/sil` `/fast` | STATE | Existing |
| `/breathe` `/freeze` `/silent` `/synth` `/radio` `/night` | AMBIENT | Existing |

## 3. ARCHITECTURE
```
Log text ──► detectNewTriggers (logTriggers.ts) ──► handler in Logs.tsx (NoteEditor effect)
                                   ▲
         LOG_COMMANDS registry (logCommands.ts) ──► formatSystemHelp() / suggestCommand()
```
* **Single source of truth.** `/system` output is generated from `LOG_COMMANDS`; the hand-written list in
  `Logs.tsx` was removed. Adding a command = one registry row + one trigger rule.
* **Parity test** fails if a registry command has no trigger rule.
* Output blocks are display-only except `/story` and `/prayer`, which append to the entry (📖 / 🕯️ block).
  `composeLocalStory` strips those blocks and command tokens, so system output is never re-compressed.

## 4. `/story` — LOCAL COMPRESSION
Pure function `composeLocalStory(logs, window, now)`. No network, no model.
Output: entry/day/word counts, top themes (stopword-filtered term frequency, ≥2 occurrences), places,
temperature range, opening and latest line. Windows: 1 / 7 / 30 / 365 days. Empty window returns an invitation, not an error.
Intended as the *floor*: the Together AI story is richer; the local one never fails.

## 5. ARCADE EVOLUTION (`/rank`)
Self-care framing, not points-for-points'-sake: consistency is the stat.

* **XP** = entries + 5 × streak days (streak bonus capped at 100 days).
* **Streak** = consecutive UTC days with an entry, ending today or yesterday (a missed *today* does not zero it).
* **Ranks:** SIGNAL (0) → OPERATOR (10) → NAVIGATOR (40) → ARCHIVIST (120) → ORACLE (300) → ARCHITECT (700).
* Independent of the existing badge codex (`badges.ts`); the rank ladder is a lightweight, always-available
  view. Mapping to badge milestones is a follow-up.

## 6. VERIFICATION
```
npx tsx scripts/tests/test-log-commands.ts   → "log-commands: all assertions passed"
npx tsc --noEmit -p tsconfig.json            → no errors in Logs.tsx / logCommands.ts / logTriggers.ts
```
Not run: full client build, browser manual test (no GUI in this environment).

## 7. KNOWN LIMITS / NEXT
1. `/rank` is client-local (reads `localStore.logById`); server-side XP persistence not implemented.
2. `/story` window argument is parsed client-side only; the server prompt does not yet receive the window.
3. Unknown-command feedback: `suggestCommand` exists and is tested but not yet surfaced in the UI.
4. Proactive loop (morning question → follow-up on spikes/pattern changes) remains in the QIE/job layer; see
   `MEMORY-AND-QUANTUM-INTENT-ENGINES.md`.
5. Privacy: local story/rank never leave the device; only the existing `/api/story` call transmits data.
