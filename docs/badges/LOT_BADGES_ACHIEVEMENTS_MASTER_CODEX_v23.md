<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT — Badges & Achievements Master Codex v23
## The RPG & Arcade of Self-Care — Full Accounting

**Author:** Vadik Marmeladov, CEO & Founder, LOT Systems
**Copyright:** © 2025–2026 LOT Systems. All rights reserved.
**Theme:** RPG · Arcade · Self-Care · Sci-Fi · Space · Mission · Starship
**Edition:** v23 — July 2026 · +35 badges · 529 total

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║                                                                  ║
║         BADGES & ACHIEVEMENTS MASTER CODEX — v23                 ║
║                                                                  ║
║    RPG · ARCADE · SELF-CARE · SCI-FI · SPACE · MISSION          ║
║                                                                  ║
║    "A starship is built to go further                            ║
║     than anyone has gone before.                                 ║
║     You are the starship."                                       ║
║                                                                  ║
║        [ STARSHIP DECK: ACTIVE ]                                 ║
║                                                                  ║
║   ↑·↑·◉  L · A · U · N · C · H   C · O · N · F · I · R · M ·E ·D  ║
║   ◉→∞    MISSION: ACTIVE                                         ║
║   ○·∗·○  ASTRONAUT CLASS: CONFIRMED                              ║
║                                                                  ║
║   v22 → v23: +35 badges  (494 → 529 total)                       ║
║   Word Turn v14   — THE STARSHIP DECK  (launch/mission/…)        ║
║   Time EE v14     — MISSION CONTROL    (07:07/20:20/02:22/15:45) ║
║   Calendar EE v13 — SPACE FIRSTS       (Gagarin/Zarya/Pluto)     ║
║   Behavioral v13  — ASTRONAUT PATTERNS (morning/sustained/orbit) ║
║   Achievement v11 — MISSION COMMANDER  (sequence/underway/…)     ║
║   Mastery v13     — INFINITE MISSION   (century/librarian/…)     ║
║   Secret Boss v13 — FINAL TRANSMISSION (houston/gagarin/sagan)   ║
║                                                                  ║
║   BUG FIX: first_signal → sputnik_signal (collision resolved)    ║
║   WIRE-UP: Calendar v8/v9/v11 now active in checkCalendar()      ║
║                                                                  ║
║       THE STARSHIP NEVER LANDS. LOG ENTRY = LAUNCH.             ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## DELTA FROM v22

```
v22  →  v23   ADDITIONS
────────────────────────────────────────────────────────────────────
Word Turn v14        +12  (launch/mission/astronaut/capsule/
                          telemetry/countdown/reentry/crew/
                          starship/module/docking/spacewalk)
Time Easter v14      + 4  (lucky_pair/vision_year/binary_triple/
                          signal_nine) — 07:07/20:20/02:22/15:45
Calendar Easter v13  + 3  (gagarin_day/zarya_signal/pluto_discovered)
Behavioral v13       + 3  (morning_mission/sustained_transmission/
                          rapid_orbit)
Achievement RPG v11  + 6  (launch_sequence/mission_underway/
                          mission_complete/mission_control_access/
                          explorer_class/space_race_complete)
Mastery Tier v13     + 4  (century_explorer/librarian_omega/
                          orbital_period/twelve_tongues)
Secret Boss v13      + 3  (houston_signal/gagarin_echo/sagan_protocol)
────────────────────────────────────────────────────────────────────
TOTAL NEW            +35
v22 TOTAL:           494
v23 TOTAL:           529
────────────────────────────────────────────────────────────────────
BUG FIX              first_signal renamed → sputnik_signal
                     (avoided collision with Achievement RPG v3)
WIRE-UPS             Calendar v8/v9/v11 triggers now live in code
                     (specced in v17–v21 but previously unwired)
```

---

## PART I — NEW BADGES v23

---

### 1.A — WORD TURN BADGES v14 — THE STARSHIP DECK (12 badges, NEW)

The vocabulary of space exploration applied to the self.
The starship is not a metaphor — it is the most accurate description
of what you are doing when you arrive here.

You are piloting yourself through uncharted space.
The check-in is the telemetry report.
The journal is the mission log.
The archive is mission control.

Launch is not the end. It is the beginning of data.
Reentry is not failure. It is return with information.
The crew is whoever shows up with you.

The Starship Deck speaks to those who understand:
self-care is not a gentle art. It is a technical operation.
It requires countdown, telemetry, and the courage to dock.

```
╔══════════════════════════════════════════════════════════════════╗
║       WORD TURN ENGINE v14 — THE STARSHIP DECK — NEW             ║
╠═══════════════╦═══════════╦══════════════════════════════════════╣
║  Word/Phrase  ║  Symbol   ║  Badge Name / Message                ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "launch"     ║  ↑·↑·◉    ║  LAUNCH CONFIRMED                    ║
║  "launched"   ║           ║  ↳ The countdown ended. You began.   ║
║  "launching"  ║           ║    This moment is T+0. Archive       ║
║               ║           ║    confirmed: you are off the ground.║
║               ║           ║    ↑·↑·◉                             ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "mission"    ║  ◉→∞      ║  MISSION ACTIVE                      ║
║  "missions"   ║           ║  ↳ You have named the purpose.       ║
║               ║           ║    A mission has parameters.         ║
║               ║           ║    The archive logs it: active. ◉→∞  ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "astronaut"  ║  ○·∗·○    ║  ASTRONAUT MODE                      ║
║  "astronauts" ║           ║  ↳ You named the class.              ║
║               ║           ║    One who goes beyond the known.    ║
║               ║           ║    The archive confirms: you qualify.║
║               ║           ║    ○·∗·○                             ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "capsule"    ║  ─╗─      ║  CAPSULE ENTRY                       ║
║  "capsules"   ║           ║  ↳ The capsule is the smallest unit  ║
║               ║           ║    of survivable space. This entry   ║
║               ║           ║    is yours. Sealed. ─╗─             ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "telemetry"  ║  ▒·▒·▒    ║  TELEMETRY LIVE                      ║
║               ║           ║  ↳ Data is flowing. The archive is   ║
║               ║           ║    receiving your signal. Readout:   ║
║               ║           ║    nominal. You are transmitting.    ║
║               ║           ║    ▒·▒·▒                             ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "countdown"  ║  3·2·1    ║  COUNTDOWN INITIATED                 ║
║  "countdowns" ║           ║  ↳ You used the word.                ║
║               ║           ║    Something is about to begin.      ║
║               ║           ║    The archive holds the sequence.   ║
║               ║           ║    3 · 2 · 1 · ◉                     ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "reentry"    ║  ≋·∞·≋    ║  REENTRY BURN                        ║
║  "re-entry"   ║           ║  ↳ The return through atmosphere.    ║
║               ║           ║    Friction is the cost of return.   ║
║               ║           ║    You survived reentry. Archive     ║
║               ║           ║    records: heat shield held. ≋·∞·≋  ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "crew"       ║  ○·○·○    ║  CREW SIGNAL                         ║
║               ║           ║  ↳ You named the collective.         ║
║               ║           ║    A crew is not a crowd. A crew is  ║
║               ║           ║    chosen interdependence. Archive:  ║
║               ║           ║    crew manifest received. ○·○·○     ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "starship"   ║  ≋→∞      ║  STARSHIP MODE                       ║
║  "starships"  ║           ║  ↳ A starship is built to go further ║
║               ║           ║    than anyone has gone.             ║
║               ║           ║    You are the starship. ≋→∞         ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "module"     ║  ╔·╗      ║  MODULE LOCKED                       ║
║  "modules"    ║           ║  ↳ A module is a self-contained      ║
║               ║           ║    unit that connects to a larger    ║
║               ║           ║    system. You are a module. ╔·╗     ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "docking"    ║  ◉=◉      ║  DOCKING COMPLETE                    ║
║               ║           ║  ↳ Two systems have aligned.         ║
║               ║           ║    The approach was precise.         ║
║               ║           ║    The lock engaged. You are         ║
║               ║           ║    connected now. ◉=◉                ║
╠═══════════════╬═══════════╬══════════════════════════════════════╣
║  "spacewalk"  ║  ○·∗      ║  SPACEWALK MODE                      ║
║  "spacewalks" ║           ║  ↳ Outside the capsule. Tethered     ║
║  "spacewalked"║           ║    but exposed. The archive marks:   ║
║               ║           ║    you stepped into open space.      ║
║               ║           ║    That required trust. ○·∗          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 1.B — TIME EASTER EGG v14 — MISSION CONTROL HOURS (4 badges, NEW)

Certain hours carry coordinates. The clock speaks in mission time.
The archive was always listening at these frequencies.
You have to arrive at the right moment.

```
╔══════════════════════════════════════════════════════════════════╗
║       TIME EASTER EGG v14 — MISSION CONTROL HOURS — NEW          ║
╠══════════════╦════════╦═══════════╦═══════════════════════════════╣
║  Badge       ║  Time  ║  Symbol   ║  Message                      ║
╠══════════════╬════════╬═══════════╬═══════════════════════════════╣
║  lucky_pair  ║  07:07 ║  ∗·∗      ║  LUCKY PAIR                   ║
║              ║        ║           ║  ↳ Double seven. The archive  ║
║              ║        ║           ║    marks this as a resonant   ║
║              ║        ║           ║    hour. You were here. ∗·∗   ║
╠══════════════╬════════╬═══════════╬═══════════════════════════════╣
║  vision_year ║  20:20 ║  ◎·◎      ║  VISION YEAR                  ║
║              ║        ║           ║  ↳ 2020: the year nothing     ║
║              ║        ║           ║    was certain. The archive   ║
║              ║        ║           ║    remembers that. So do you. ║
║              ║        ║           ║    ◎·◎                        ║
╠══════════════╬════════╬═══════════╬═══════════════════════════════╣
║  binary_triple║ 02:22 ║  ○·○·○    ║  BINARY TRIPLE                ║
║              ║        ║           ║  ↳ 2 and then 22.             ║
║              ║        ║           ║    Binary echo. The machine   ║
║              ║        ║           ║    confirms: pattern present. ║
║              ║        ║           ║    ○·○·○                      ║
╠══════════════╬════════╬═══════════╬═══════════════════════════════╣
║  signal_nine ║  15:45 ║  ─∘─      ║  SIGNAL NINE                  ║
║              ║        ║           ║  ↳ 15:45 = 3+4+5+6+7+8+9+10  ║
║              ║        ║           ║    in sequence. The archive   ║
║              ║        ║           ║    records pattern in time.   ║
║              ║        ║           ║    ─∘─                        ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 1.C — CALENDAR EASTER EGG v13 — SPACE FIRSTS (3 badges, NEW)

The archive marks the days when humanity first crossed new thresholds.
Check in on these dates to receive the record.

```
╔══════════════════════════════════════════════════════════════════╗
║       CALENDAR EASTER EGG v13 — SPACE FIRSTS — NEW               ║
╠══════════════╦══════════════╦════════════════════════════════════╣
║  Badge       ║  Date        ║  Description                       ║
╠══════════════╬══════════════╬════════════════════════════════════╣
║  gagarin_day ║  April 12    ║  GAGARIN DAY  ↑·◉                  ║
║              ║              ║  First human in space, 1961.       ║
║              ║              ║  Yuri Gagarin orbited Earth.       ║
║              ║              ║  108 minutes. One orbit.           ║
║              ║              ║  The archive marks the first.      ║
║              ║              ║  Rarity: RARE [hidden]             ║
╠══════════════╬══════════════╬════════════════════════════════════╣
║ zarya_signal ║  November 20 ║  ZARYA SIGNAL  ═══◉                ║
║              ║              ║  ISS Zarya module launched, 1998.  ║
║              ║              ║  First piece of the station.       ║
║              ║              ║  Module to orbit: construction     ║
║              ║              ║  of the human outpost began.       ║
║              ║              ║  Rarity: UNCOMMON [hidden]         ║
╠══════════════╬══════════════╬════════════════════════════════════╣
║pluto_discovered║ February 18║  PLUTO DISCOVERED  ○··             ║
║              ║              ║  Clyde Tombaugh found Pluto, 1930. ║
║              ║              ║  Small, cold, distant, real.       ║
║              ║              ║  The archive notes: existence      ║
║              ║              ║  does not require adjacency.       ║
║              ║              ║  Rarity: UNCOMMON [hidden]         ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 1.D — BEHAVIORAL EASTER EGG v13 — ASTRONAUT PATTERNS (3 badges, NEW)

These badges reward the patterns of long-duration mission behavior.
No one announces them. They accumulate invisibly. The archive notices.

```
╔══════════════════════════════════════════════════════════════════╗
║       BEHAVIORAL EASTER EGG v13 — ASTRONAUT PATTERNS — NEW       ║
╠═════════════════════╦═════════╦═════════════════════════════════╣
║  Badge              ║ Symbol  ║  Trigger                         ║
╠═════════════════════╬═════════╬═════════════════════════════════╣
║  morning_mission    ║  ∴·∴·∴  ║  7 consecutive morning check-ins ║
║                     ║         ║  before 09:00                    ║
║  Rarity: UNCOMMON   ║         ║  ↳ The astronaut begins before   ║
║  [hidden]           ║         ║    the day begins. Seven times.  ║
║                     ║         ║    The archive notes the pattern.║
╠═════════════════════╬═════════╬═════════════════════════════════╣
║  sustained_         ║  ≋≋≋    ║  250+ word journal entry for     ║
║  transmission       ║         ║  3 consecutive days              ║
║                     ║         ║  ↳ Sustained signal. Mission     ║
║  Rarity: RARE       ║         ║    control requires continuous   ║
║  [hidden]           ║         ║    telemetry. You delivered.     ║
║                     ║         ║    Three transmissions. Heard.   ║
╠═════════════════════╬═════════╬═════════════════════════════════╣
║  rapid_orbit        ║  ○→○→○  ║  3 check-ins in under 4 hours   ║
║                     ║         ║  on the same calendar day        ║
║  Rarity: UNCOMMON   ║         ║  ↳ Orbital cadence: tight.       ║
║  [hidden]           ║         ║    Three contact windows in one  ║
║                     ║         ║    day. The orbit is complete.   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 1.E — ACHIEVEMENT RPG v11 — MISSION COMMANDER CLASS (6 badges, NEW)

```
╔══════════════════════════════════════════════════════════════════╗
║       ACHIEVEMENT RPG v11 — MISSION COMMANDER CLASS — NEW         ║
╠════════════════════════╦══════════╦══════════════════════════════╣
║  Badge                 ║  Symbol  ║  Unlock Condition            ║
╠════════════════════════╬══════════╬══════════════════════════════╣
║  launch_sequence       ║  ↑·◉     ║  Earn any 1 Word Turn v14    ║
║  Rarity: COMMON        ║          ║  (Starship Deck) badge        ║
╠════════════════════════╬══════════╬══════════════════════════════╣
║  mission_underway      ║  ◉→∞     ║  Earn any 5 Word Turn v14    ║
║  Rarity: UNCOMMON      ║          ║  (Starship Deck) badges       ║
╠════════════════════════╬══════════╬══════════════════════════════╣
║  mission_complete      ║  ∞·◉·∞   ║  Earn all 12 Word Turn v14   ║
║  Rarity: EPIC          ║          ║  (Starship Deck) badges       ║
╠════════════════════════╬══════════╬══════════════════════════════╣
║  mission_control_access║  ▒·▒     ║  Earn all 4 Time Easter Egg  ║
║  Rarity: RARE          ║          ║  v14 (Mission Control) badges ║
╠════════════════════════╬══════════╬══════════════════════════════╣
║  explorer_class        ║  ○·∗·○   ║  Earn all 3 Calendar v13     ║
║  Rarity: RARE          ║          ║  (Space Firsts) badges        ║
╠════════════════════════╬══════════╬══════════════════════════════╣
║  space_race_complete   ║  ↑·○     ║  Both gagarin_day AND         ║
║  Rarity: EPIC          ║          ║  moon_landing earned          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 1.F — MASTERY TIER v13 — THE INFINITE MISSION (4 badges, NEW)

```
╔══════════════════════════════════════════════════════════════════╗
║       MASTERY TIER v13 — THE INFINITE MISSION — NEW              ║
╠════════════════════════╦══════════╦══════════════════════════════╣
║  Badge                 ║  Symbol  ║  Unlock Condition            ║
╠════════════════════════╬══════════╬══════════════════════════════╣
║  century_explorer      ║  ◎·◎     ║  200+ distinct calendar days  ║
║  Rarity: EPIC          ║          ║  with any check-in           ║
╠════════════════════════╬══════════╬══════════════════════════════╣
║  librarian_omega       ║  ∞·≋·∞   ║  5,000+ total journal words  ║
║  Rarity: EPIC          ║          ║  (lifetime)                  ║
╠════════════════════════╬══════════╬══════════════════════════════╣
║  orbital_period        ║  ○→○     ║  Account age ≥ 7 years        ║
║  Rarity: LEGENDARY     ║          ║  (2,555+ days since creation) ║
╠════════════════════════╬══════════╬══════════════════════════════╣
║  twelve_tongues        ║  ◉·◈·◉   ║  1+ badge from each of all   ║
║  Rarity: COSMIC        ║          ║  14 Word Turn engines (v1–v14)║
╚══════════════════════════════════════════════════════════════════╝
```

---

### 1.G — SECRET BOSS v13 — FINAL TRANSMISSION (3 badges, NEW)

These three badges require specific phrases to appear in any journal
or memory entry. No hint. No progress bar. The archive simply listens.

```
╔══════════════════════════════════════════════════════════════════╗
║       SECRET BOSS v13 — FINAL TRANSMISSION — NEW                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ·◉·  HOUSTON SIGNAL                 Write "Houston" in any      ║
║        Rarity: RARE [hidden]          journal or memory entry     ║
║        ↳ "Houston, we have a situation."                         ║
║          You named the ground team.                              ║
║          The archive is ground team. It is always listening.     ║
║          You reached out. Contact confirmed. ·◉·                 ║
║                                                                  ║
║  ↑·∘  GAGARIN ECHO                   Write "Gagarin" in any      ║
║        Rarity: RARE [hidden]          journal or memory entry     ║
║        ↳ Yuri Gagarin said "poyekhali" — "let's go."            ║
║          The simplest possible statement before leaving Earth.   ║
║          You named him. The archive notes the echo. ↑·∘          ║
║                                                                  ║
║  ○·∞·○  SAGAN PROTOCOL              Write "Pale Blue Dot" in     ║
║           Rarity: EPIC [hidden]       any journal or memory entry ║
║           ↳ Carl Sagan: "Look again at that dot.                 ║
║             That's here. That's home. That's us."               ║
║             You wrote those words.                               ║
║             The archive adds: you are on that dot.               ║
║             Looking back. Writing. Present. ○·∞·○                ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## PART II — IMPLEMENTATION NOTES v23

### 2.A — BUG FIX: first_signal → sputnik_signal

```
ISSUE:    Two badges shared the ID 'first_signal'
          — Achievement RPG v3 (10+ memory answers)
          — Calendar v9 Sputnik Day (Oct 4)
          JavaScript objects use last-write-wins for duplicate keys.
          The Sputnik definition was silently overwriting the RPG v3 badge.

FIX:      Calendar Sputnik badge renamed:
          first_signal → sputnik_signal
          Updated in: BadgeType union, BADGES registry, easter-eggs.ts

RESULT:   Both badges now function correctly.
          Achievement RPG v3 'first_signal' = 10+ memory answers
          Calendar v9 'sputnik_signal' = check in on October 4
```

### 2.B — CALENDAR WIRE-UPS COMPLETED

```
PREVIOUSLY SPECCED BUT UNWIRED:
  Calendar v8 — Game Anniversaries   (specced in v17)
    new_year_sig    Jan 1   — New Year Signal
    sonic_day       Sep 9   — Sonic the Hedgehog birthday
    winter_code     Dec 25  — Holiday Protocol

  Calendar v9 — Sci-Fi Literary Calendar  (specced in v19)
    turing_day      Jun 23  — Alan Turing born 1912
    moon_landing    Jul 20  — First lunar footprint 1969
    sputnik_signal  Oct 4   — Sputnik launch 1957

  Calendar v11 — Space Firsts (pre-v23 spec)
    gagarin_day     Apr 12  — First human in space 1961
    zarya_signal    Nov 20  — ISS Zarya module launch 1998
    pluto_discovered Feb 18 — Pluto discovered 1930

NOW ACTIVE: All 9 dates are live in checkCalendarEasterEggs()
```

### 2.C — WORD TURN VERSION NUMBERING

```
CODE ←→ SPEC ALIGNMENT:
  The code implements word turn engines in sequence.
  The spec (codex MDs) numbers them canonically.

  v12 (Alchemist) — specced in Codex v21, pending code implementation
  v13 (Oracle)    — specced in Codex v22, pending code implementation
  v14 (Starship Deck) — specced + implemented in Codex v23 (THIS)

  Code comment labels were updated from v12→v14 to match spec.
  Alchemist and Oracle word turn code implementation: future session.
```

---

## PART III — COMPLETE BADGE REGISTRY v23

### ACCOUNTING SUMMARY

```
┌─────────────────────────────────────────────────────────────────┐
│                    BADGE INVENTORY v23                          │
├──────────────────────────────┬──────────────────────────────────┤
│  Category                    │  Count                           │
├──────────────────────────────┼──────────────────────────────────┤
│  Milestone (Core)            │   3                              │
│  Milestone (Extended)        │   7                              │
│  Easter Egg — Time v1        │   4                              │
│  Easter Egg — Time v2        │   4                              │
│  Easter Egg — Time v3        │   4                              │
│  Easter Egg — Time v4        │   4                              │
│  Easter Egg — Time v5        │   4                              │
│  Easter Egg — Time v6        │   4                              │
│  Easter Egg — Time v7        │   4                              │
│  Easter Egg — Time v8        │   4                              │
│  Easter Egg — Time v9        │   4                              │
│  Easter Egg — Time v10       │   4                              │
│  Easter Egg — Time v11       │   4                              │
│  Easter Egg — Time v12       │   4                              │
│  Easter Egg — Time v13       │   4                              │
│  Easter Egg — Time v14       │   4  NEW                         │
│  Easter Egg — Calendar v1    │   8                              │
│  Easter Egg — Calendar v2    │   2                              │
│  Easter Egg — Calendar v3    │   3                              │
│  Easter Egg — Calendar v4    │   3                              │
│  Easter Egg — Calendar v5    │   3                              │
│  Easter Egg — Calendar v6    │   3                              │
│  Easter Egg — Calendar v7    │   3                              │
│  Easter Egg — Calendar v8    │   3  (wired)                     │
│  Easter Egg — Calendar v9    │   3  (wired)                     │
│  Easter Egg — Calendar v10   │   3                              │
│  Easter Egg — Calendar v11   │   3  (wired)                     │
│  Easter Egg — Calendar v12   │   3                              │
│  Easter Egg — Calendar v13   │   3  NEW                         │
│  Easter Egg — Behavioral v1  │   5                              │
│  Easter Egg — Behavioral v2  │   3                              │
│  Easter Egg — Behavioral v3  │   3                              │
│  Easter Egg — Behavioral v4  │   4                              │
│  Easter Egg — Behavioral v5  │   3                              │
│  Easter Egg — Behavioral v6  │   3                              │
│  Easter Egg — Behavioral v7  │   3                              │
│  Easter Egg — Behavioral v8  │   3                              │
│  Easter Egg — Behavioral v9  │   3                              │
│  Easter Egg — Behavioral v10 │   3                              │
│  Easter Egg — Behavioral v11 │   3                              │
│  Easter Egg — Behavioral v12 │   3                              │
│  Easter Egg — Behavioral v13 │   3  NEW                         │
│  Word Turn v1                │  12                              │
│  Word Turn v2 (Sci-Fi)       │  18                              │
│  Word Turn v3 (Computer)     │  12                              │
│  Word Turn v4 (Self-Care)    │  12                              │
│  Word Turn v5 (Signal Codex) │  12                              │
│  Word Turn v6 (Becoming)     │  12                              │
│  Word Turn v7 (Rogue Archive)│  12                              │
│  Word Turn v8 (Mainframe)    │  12                              │
│  Word Turn v9 (Arcade Cabin) │  12                              │
│  Word Turn v10 (Quantum)     │  12                              │
│  Word Turn v11 (Navigator)   │  12                              │
│  Word Turn v12 (Alchemist)   │  12  (specced, impl. pending)    │
│  Word Turn v13 (Oracle)      │  12  (specced, impl. pending)    │
│  Word Turn v14 (Starship Deck│  12  NEW + IMPLEMENTED           │
│  Pattern (Oceanic Mayan)     │   5                              │
│  Achievement (RPG Layer v1)  │  14                              │
│  Achievement (RPG Layer v2)  │   6                              │
│  Achievement (RPG Layer v3)  │   6                              │
│  Achievement (RPG Layer v4)  │   6                              │
│  Achievement (RPG Layer v5)  │   6                              │
│  Achievement (RPG Layer v6)  │   6                              │
│  Achievement (RPG Layer v7)  │   6                              │
│  Achievement (RPG Layer v8)  │   6                              │
│  Achievement (RPG Layer v9)  │   6                              │
│  Achievement (RPG Layer v10) │   6                              │
│  Achievement (RPG Layer v11) │   6  NEW                         │
│  Mastery Tier v1             │   5                              │
│  Mastery Tier v2             │   4                              │
│  Mastery Tier v3             │   4                              │
│  Mastery Tier v4             │   4                              │
│  Mastery Tier v5             │   4                              │
│  Mastery Tier v6             │   4                              │
│  Mastery Tier v7             │   4                              │
│  Mastery Tier v8             │   4                              │
│  Mastery Tier v9             │   4                              │
│  Mastery Tier v10            │   4                              │
│  Mastery Tier v11            │   4                              │
│  Mastery Tier v12            │   4                              │
│  Mastery Tier v13            │   4  NEW                         │
│  Secret Boss v1              │   7                              │
│  Secret Boss v2              │   3                              │
│  Secret Boss v3              │   3                              │
│  Secret Boss v4              │   3                              │
│  Secret Boss v5              │   3                              │
│  Secret Boss v6              │   3                              │
│  Secret Boss v7              │   3                              │
│  Secret Boss v8              │   3                              │
│  Secret Boss v9              │   3                              │
│  Secret Boss v10             │   3                              │
│  Secret Boss v11             │   3                              │
│  Secret Boss v12             │   3                              │
│  Secret Boss v13             │   3  NEW                         │
├──────────────────────────────┼──────────────────────────────────┤
│  TOTAL v22:                  │ 494                              │
│  v23 NEW:                    │  35                              │
│  v23 TOTAL:                  │ 529                              │
│  Hidden / Discoverable:      │ 497                              │
│  Visible / Documented:       │  32                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## PART IV — TIME EASTER EGG TABLE (v14 complete)

```
╔══════════════════════════════════════════════════════════════════╗
║         COMPLETE TIME EASTER EGG REGISTRY — v14                  ║
╠══════════════════════════════════════════════════════════════════╣
║  v1  ║  01:00-04:00  05:00-06:00  11:11  00:00                  ║
║  v2  ║  03:14  04:04  12:34  04:07                               ║
║  v3  ║  00:01  22:22  13:37  [07:07 — see v14 note]             ║
║  v4  ║  01:12  01:37  08:00  18:00                               ║
║  v5  ║  10:10  01:23  21:12  06:28                               ║
║  v6  ║  09:09  16:16  23:59  20:26                               ║
║  v7  ║  02:02  14:14  05:55  03:33                               ║
║  v8  ║  00:42  12:00  08:08  17:17                               ║
║  v9  ║  07:00  15:15  19:19  04:44                               ║
║  v10 ║  11:23  20:16  06:06  21:21                               ║
║  v11 ║  13:13  05:12  18:42  10:01                               ║
║  v12 ║  16:18  07:14  00:13  21:07                               ║
║  v13 ║  03:07  14:44  05:05  19:23                               ║
║  v14 ║  07:07  20:20  02:22  15:45           ← NEW              ║
╚══════════════════════════════════════════════════════════════════╝
  Total: 56 time-based easter egg badges (52 prior + 4 new)
  Note: v14 07:07 = lucky_pair (Mission Control badge)
        This is distinct from any v3 spec variant; v14 is implemented.
  Logic: Check-in at the exact moment. No hint. No announcement.
```

---

## PART V — CALENDAR EASTER EGG TABLE (v13 complete)

```
╔══════════════════════════════════════════════════════════════════╗
║         COMPLETE CALENDAR EASTER EGG REGISTRY — v13              ║
╠══════════════════════════════════════════════════════════════════╣
║  v1  ║  Apr 7  Jul 1  Mar 14  Nov 23  Oct 10  Feb 2             ║
║       ║  Dec 9  Jan 23  (8 dates)                               ║
║  v2  ║  May 4  May 25  (2 dates)                                ║
║  v3  ║  Jul 4  Oct 31  Nov 11  (3 dates)                        ║
║  v4  ║  Full moon (any)  Solstice  Equinox  (3 triggers)        ║
║  v5  ║  [User birthday]  9/9  1/1  (3 dates)                   ║
║  v6  ║  Apr 4  Nov 11  Mar 1  (3 dates)                        ║
║  v7  ║  May 25  Jul 1*  Oct 31*  (3 dates)                     ║
║  v8  ║  Jan 1  Sep 9  Dec 25  (3 dates)  ← now wired           ║
║  v9  ║  Jun 23  Jul 20  Oct 4  (3 dates)  ← now wired          ║
║  v10 ║  Aug 25  Oct 12  Feb 29  (3 dates)                      ║
║  v11 ║  Apr 12  Nov 20  Feb 18  (3 dates)  ← now wired         ║
║  v12 ║  Apr 23  Sep 23  Jul 20  (3 dates)                      ║
║  v13 ║  Apr 12  Nov 20  Feb 18  ← NEW  (3 dates)               ║
╚══════════════════════════════════════════════════════════════════╝
  * Jul 1 and Oct 31 appear across multiple calendar versions
    with different badge flavors.
  Total distinct trigger dates: 40+
  Note: Calendar v11 and v13 share dates (Space Firsts theme);
        different badge IDs ensure both can be earned.
```

---

## PART VI — WORD TURN ENGINES — COMPLETE LEXICON v23

```
v1  — EMOTIONAL ROOTS    (ritual/breathe/grateful/ocean…)
v2  — SCI-FI EXPANSION   (reboot/quantum/glitch/COSMO…)
v3  — COMPUTER LORE      (hack/override/debug/signal…)
v4  — DAILY CARE         (water/walk/heal/rest/eat…)
v5  — SIGNAL CODEX       (solitude/wonder/phoenix/forge…)
v6  — BECOMING LEXICON   (surrender/restore/anchor/trust…)
v7  — ROGUE ARCHIVE      (loot/boss/save/respawn/grind…)
v8  — MAINFRAME          (compile/execute/buffer/stack…)
v9  — ARCADE CABINET     (coin/pixel/sprite/score/life…)
v10 — QUANTUM PROTOCOL   (quantum/entangle/collapse/observe…)
v11 — THE NAVIGATOR      (drift/vector/bearing/waypoint…)
v12 — THE ALCHEMIST      (transmute/crucible/distill/catalyst…)
      [specced in Codex v21 — code implementation pending]
v13 — THE ORACLE         (oracle/rune/sigil/invoke/cipher…)
      [specced in Codex v22 — code implementation pending]
v14 — THE STARSHIP DECK  (launch/mission/astronaut/capsule…) ← NEW
      [specced + IMPLEMENTED in Codex v23]
```

```
╔══════════════════════════════════════════════════════════════════╗
║                WORD TRIGGER REGISTRY v23                         ║
╠══════════════════════════════════════════════════════════════════╣
║  v1  (12): ritual · breathe · grateful · ocean · ground         ║
║            anchor · quiet · tide · forgive · begin              ║
║            soften · witness                                      ║
║                                                                  ║
║  v2  (18): reboot · quantum · glitch · COSMO · upload           ║
║            override · bandwidth · signal · node · sync          ║
║            protocol · frequency · archive · zero · binary       ║
║            transmission · satellite · constellation             ║
║                                                                  ║
║  v3  (12): hack · debug · loop · stack · execute                ║
║            compile · deploy · root · script · kernel            ║
║            terminal · process                                    ║
║                                                                  ║
║  v4  (12): water · walk · heal · rest · eat · sleep             ║
║            breathe · sun · move · stretch · nourish · hydrate   ║
║                                                                  ║
║  v5  (12): solitude · wonder · phoenix · forge · myth           ║
║            sovereign · eclipse · horizon · vigil · clarity      ║
║            ember · threshold                                     ║
║                                                                  ║
║  v6  (12): surrender · restore · anchor · trust · unfold        ║
║            release · gather · remember · receive · choose       ║
║            become · return                                       ║
║                                                                  ║
║  v7  (12): loot · boss · save · respawn · grind · dungeon       ║
║            quest · level · rogue · raid · guild · nexus         ║
║                                                                  ║
║  v8  (12): compile · execute · buffer · stack · malloc          ║
║            pipeline · daemon · interrupt · cache · branch        ║
║            subroutine · checkpoint                               ║
║                                                                  ║
║  v9  (12): coin · pixel · sprite · score · life · joystick      ║
║            blip · continue · high · reset · quarter · cheat     ║
║                                                                  ║
║  v10 (12): quantum · entangle · collapse · observe · tunnel     ║
║            spin · waveform · coherence · superposition · qubit  ║
║            eigenstate · decohere                                 ║
║                                                                  ║
║  v11 (12): drift · vector · bearing · waypoint · chart          ║
║            magnetic · meridian · course · heading · landmark    ║
║            navigate · compass                                    ║
║                                                                  ║
║  v12 (12): transmute · crucible · distill · catalyst · alloy    ║
║            sublimate · prima · opus · elixir · chrysalis        ║
║            refine · anneal                                       ║
║                                                                  ║
║  v13 (12): oracle · rune · sigil · invoke · cipher · augur      ║
║            covenant · arcane · vestige · axiom · glyph          ║
║            prophesy                                              ║
║                                                                  ║
║  v14 (12): launch · mission · astronaut · capsule · telemetry   ║  ← NEW
║            countdown · reentry · crew · starship · module       ║
║            docking · spacewalk                                   ║
║                                                                  ║
║  TOTAL: 162 word-turn trigger types (v1–v14)                    ║
║  (150 through v13 + 12 new in v14)                              ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## PART VII — VISUAL ATLAS — v23 NEW BADGES

### 7.A — WORD TURN v14 — STARSHIP DECK ASCII CARD GALLERY

```
┌────────────────────┐    ┌────────────────────┐
│  LAUNCH CONFIRMED  │    │  MISSION ACTIVE    │
│                    │    │                    │
│  ↑   ·   ↑   ·  ◉  │    │    ◉   →   ∞       │
│   T + 0 : lift off │    │  named. logged.    │
│   archive: airborne│    │  parameters set    │
│  Write: "launch"   │    │ Write: "mission"   │
└────────────────────┘    └────────────────────┘

┌────────────────────┐    ┌────────────────────┐
│  ASTRONAUT MODE    │    │  CAPSULE ENTRY     │
│                    │    │                    │
│   ○   ·   ∗   ·  ○ │    │      ─  ╗  ─       │
│  you go beyond     │    │  smallest unit of  │
│  the known: qualify│    │  survivable space  │
│Write: "astronaut"  │    │ Write: "capsule"   │
└────────────────────┘    └────────────────────┘

┌────────────────────┐    ┌────────────────────┐
│  TELEMETRY LIVE    │    │  COUNTDOWN         │
│                    │    │  INITIATED         │
│   ▒   ·   ▒   ·  ▒ │    │   3   ·   2   ·  1 │
│  data: flowing     │    │  something begins  │
│  signal: nominal   │    │  the sequence: set │
│Write: "telemetry"  │    │Write: "countdown"  │
└────────────────────┘    └────────────────────┘

┌────────────────────┐    ┌────────────────────┐
│  REENTRY BURN      │    │  CREW SIGNAL       │
│                    │    │                    │
│   ≋   ·   ∞   ·  ≋ │    │   ○   ·   ○   ·  ○ │
│  friction = return │    │  chosen: together  │
│  heat shield: held │    │  interdependent    │
│ Write: "reentry"   │    │   Write: "crew"    │
└────────────────────┘    └────────────────────┘

┌────────────────────┐    ┌────────────────────┐
│  STARSHIP MODE     │    │  MODULE LOCKED     │
│                    │    │                    │
│   ≋   →   →   ∞    │    │      ╔  ·  ╗       │
│  built to go       │    │  self-contained    │
│  further than all  │    │  connects: system  │
│Write: "starship"   │    │  Write: "module"   │
└────────────────────┘    └────────────────────┘

┌────────────────────┐    ┌────────────────────┐
│  DOCKING COMPLETE  │    │  SPACEWALK MODE    │
│                    │    │                    │
│   ◉   =   =   =  ◉ │    │   ○   ·   ∗        │
│  approach precise  │    │  outside capsule   │
│  lock engaged      │    │  tethered: exposed │
│ Write: "docking"   │    │Write: "spacewalk"  │
└────────────────────┘    └────────────────────┘
```

### 7.B — CALENDAR v13 — SPACE FIRSTS DAY CARDS

```
╔══════════════════════════════════════════════╗
║                                              ║
║       G A G A R I N   D A Y                 ║
║                                              ║
║              ↑   ·   ◉                      ║
║                                              ║
║   CHECK IN ON APRIL 12                      ║
║                                              ║
║   "April 12, 1961.                          ║
║    108 minutes. One orbit.                  ║
║    Yuri Gagarin said poyekhali:             ║
║    'let's go.'                              ║
║    The simplest words before the largest    ║
║    thing a human had ever done.             ║
║    You arrived today. The archive:          ║
║    poyekhali."                              ║
║                                              ║
║   Rarity: RARE [hidden]                     ║
║                                              ║
╚══════════════════════════════════════════════╝

╔══════════════════════════════════════════════╗
║                                              ║
║       Z A R Y A   S I G N A L               ║
║                                              ║
║              ═  ═  ═  ◉                     ║
║                                              ║
║   CHECK IN ON NOVEMBER 20                   ║
║                                              ║
║   "November 20, 1998.                       ║
║    Zarya — 'dawn' in Russian —              ║
║    became the first module of the ISS.      ║
║    Construction of the outpost began.       ║
║    A permanent human presence in space:     ║
║    initiated from this single piece.        ║
║    All things start with the first module." ║
║                                              ║
║   Rarity: UNCOMMON [hidden]                 ║
║                                              ║
╚══════════════════════════════════════════════╝

╔══════════════════════════════════════════════╗
║                                              ║
║     P L U T O   D I S C O V E R E D         ║
║                                              ║
║              ○   ·   ·                      ║
║                                              ║
║   CHECK IN ON FEBRUARY 18                   ║
║                                              ║
║   "February 18, 1930.                       ║
║    Clyde Tombaugh found Pluto.              ║
║    Small, cold, at the edge.                ║
║    Reclassified but real.                   ║
║    Existence does not require proximity.    ║
║    The archive notes: neither do you."      ║
║                                              ║
║   Rarity: UNCOMMON [hidden]                 ║
║                                              ║
╚══════════════════════════════════════════════╝
```

---

## PART VIII — DESIGN PHILOSOPHY v23

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              LOT BADGE ENGINE — DESIGN PRINCIPLES               ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  THE ARCHIVE PRINCIPLE                                           ║
║  ──────────────────────                                          ║
║  The archive does not grade.                                     ║
║  It records. A badge is a timestamp with a name.                ║
║  The name is chosen to honor what the moment contains.          ║
║                                                                  ║
║  THE DISCOVERY PRINCIPLE                                         ║
║  ──────────────────────────                                      ║
║  Most badges are hidden.                                         ║
║  Discovery is part of the experience.                           ║
║  The player should encounter badges — not hunt them.            ║
║  Hunting produces anxiety. Encounter produces delight.          ║
║                                                                  ║
║  THE WORD TURN PRINCIPLE                                         ║
║  ──────────────────────────                                      ║
║  Words have energetic signatures.                               ║
║  When a word with a signature appears in the archive,           ║
║  the archive responds.                                          ║
║  This is not magic. It is attention economy.                    ║
║  The system rewards language choice.                            ║
║  Language choice changes thought.                               ║
║                                                                  ║
║  THE TIMESTAMP PRINCIPLE                                         ║
║  ──────────────────────────                                      ║
║  Certain moments in the day are designated.                     ║
║  Not because they are special — but because designating         ║
║  them makes them special.                                       ║
║  Ritual is designation. The archive is the priest.              ║
║                                                                  ║
║  THE SPACE PRINCIPLE (v23 addition)                              ║
║  ─────────────────────────────────                               ║
║  Self-care is a technical operation, not just a gentle art.     ║
║  It requires launch sequence, telemetry, and the courage        ║
║  to reenter after leaving.                                      ║
║  The starship vocabulary honors this.                           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## PART IX — IMPLEMENTATION STATUS v23

```
╔══════════════════════════════════════════════════════════════════╗
║              IMPLEMENTATION STATUS — v23                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  File                              Status                        ║
║  ─────────────────────────────────────────────────────────────  ║
║  src/client/utils/badges.ts        ✓ v14 badges added           ║
║                                      sputnik_signal bug fix      ║
║                                      338+ BADGES entries         ║
║                                                                  ║
║  src/client/utils/easter-eggs.ts   ✓ v14 word turns wired       ║
║                                      Time v14 checks added       ║
║                                      Calendar v8/v9/v11 wired    ║
║                                      Calendar v13 (Gagarin etc.) ║
║                                                                  ║
║  docs/badges/                      ✓ v23 codex MD written       ║
║                                    ✓ v23 PDF generated           ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PENDING (future sessions)                                       ║
║  ─────────────────────────────────────────────────────────────  ║
║  Word Turn v12 (Alchemist): specced in v21, not yet in code     ║
║  Word Turn v13 (Oracle): specced in v22, not yet in code        ║
║  Calendar v12 (Apr 23/Sep 23): specced in v22, not yet wired    ║
║  Behavioral v12 (oracle patterns): specced in v22, not wired    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## PART X — VERSION HISTORY (v23 summary entry)

```
╔══════════════════════════════════════════════════════════════════╗
║  VERSION  ║ BADGES ║  THEME                                      ║
╠═══════════╬════════╬═════════════════════════════════════════════╣
║  v1–v16   ║   285  ║  Origin through Rogue Archive               ║
║  v17      ║   306  ║  Mainframe Protocol                         ║
║  v18      ║   340  ║  Arcade Cabinet + Secret Boss               ║
║  v19      ║   389  ║  The Operator's Grimoire (Spell Book)       ║
║  v20      ║   424  ║  The Origin Code (Navigator Protocol)       ║
║  v21      ║   459  ║  The Alchemist Engine                       ║
║  v22      ║   494  ║  The Oracle Engine                          ║
║  v23      ║   529  ║  The Starship Deck  ← THIS                  ║
╚══════════════════════════════════════════════════════════════════╝

529 badges across 70 categories.
497 hidden. 32 visible.
Some you find by checking in at 07:07.
Some by writing "Houston" in a journal entry.
Some by surviving seven mornings in a row before the day begins.
Some by naming that you are on a pale blue dot and writing it down.
The archive is listening. The deck is active.
You are the starship. The mission: ongoing.

"Self-care is not a quest you complete.
 It is a world you build."

© 2025–2026 LOT Systems. All rights reserved.
LOT® Founded 7 April 2016 · brand.lot-systems.com
```

---
