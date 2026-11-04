# LOT® LOG COMMAND SYSTEM
**Classification:** TECHNICAL REFERENCE · **Revision:** 1 · **Date:** 2026-11-04 · **Owner:** S-2

## 1. PURPOSE
The Log is a passive journal: the user writes, no prompts. Slash commands are the *only* active surface inside it — one optional keystroke away, never required. Every saved entry carries environment context (weather, humidity, city, sky, astrology) as metadata; commands read that same context.

## 2. SINGLE SOURCE OF TRUTH
| Layer | File | Role |
|---|---|---|
| Registry | `src/shared/utils/logCommands.ts` | name, aliases, args, description, category. `/system` renders from it. |
| Detection | `src/client/utils/logTriggers.ts` | pure detectors; `detectNewTriggers` fires on deltas only |
| Wiring | `src/client/components/Logs.tsx` (trigger effect) | executes each trigger |
| Tests | `scripts/tests/test-log-commands.ts` | asserts registry ⇄ detector parity |

**Rule:** a command exists only if it is in the registry AND detected AND wired. The test fails if the registry lists a command/alias the detector does not recognise, so `/system` cannot advertise a dead command.

## 3. COMMAND TABLE
| Category | Command | Behaviour |
|---|---|---|
| INTELLIGENCE | `/story [day\|week\|month\|year]` | Compressed story of the period (default `week`). See LOT-STORY-COMPRESSION.md |
| | `/qi [query]` | Quantum Intelligence RFI |
| | `/how` | Open LOT AI check-in (System tab) |
| | `/rank` (`/arcade`) | Arcade rank, level, XP, next rank |
| SELF-CARE | `/prayer` `/breathe` `/freeze` `/silent` `/fast` | unchanged |
| ENVIRONMENT | `/scan` `/phys` `/qos` `/assembly` | unchanged |
| SYSTEM | `/synth` `/radio` `/night` `/system` | unchanged; `/system` = this table, live |

Emoji triggers (📖 🎹 🎧 🌙 🕯️ 🧊 ❗) are preserved.

## 4. `/system` BEHAVIOUR
Typing `/system` (or `/commands`) renders the registry grouped by category inside the `SYSTEM:` block. Output format is the existing line grammar: header lines plain; command lines `"/cmd [args]<pad>description"`; key/value rows (used by `/rank`) are `"KEY<2+ spaces>value"`.

## 5. ADDING A COMMAND (CHECKLIST)
1. Add a `LogCommandSpec` to `LOG_COMMANDS`.
2. Add the `LogTrigger` union member and a `RULES` entry in `logTriggers.ts` (keywords must include name + aliases).
3. Add the branch in the `Logs.tsx` trigger effect.
4. Run `node --experimental-strip-types scripts/tests/test-log-commands.ts`.
5. Update this table and append to `docs/assembly/LOT-LEDGER.md`.

## 6. SAFETY / PRIVACY
- Commands run on explicit user action only; nothing is sent to a vendor by `/system`, `/rank`.
- `/story` sends a bounded digest, never raw history (see story doc).
- `/story` is gated to Usership members (server-side, unchanged). `/rank` is per-user (`req.user.id`).

## 7. KNOWN LIMITS
- `suggestCommands()` (prefix autocomplete) is implemented and tested but **not yet surfaced in the UI**.
- Client bundle was not built in the authoring session (no `node_modules`); pure modules were type-checked with `tsc --strict` and unit-tested only. Run `yarn build` before release.
