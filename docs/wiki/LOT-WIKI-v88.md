<!-- 
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT-WIKI-v88
## Layers of Time — Operator Reference Manual
### Revision: v88 · Field Manual Sync: v114 · Date: 2026-09-16 · Day 1115+

---

> *"The zenith is the point directly overhead. The nadir is the point directly below. You are the instrument between them. The observatory opens when you name both."*
> — Badge Engine v33, THE ANCIENT OBSERVATORY

---

## DELTA RECORD: v87 → v88

**Base:** LOT-WIKI-v87 (2026-08-05)  
**This revision adds:** Badge Engine v33 THE ANCIENT OBSERVATORY. Field Manual v114 sync. All counters updated to September 16, 2026 state.

All sections not listed below are unchanged from LOT-WIKI-v87.

---

## CHANGED SECTIONS

### §14 — BADGE SYSTEM v33: THE ANCIENT OBSERVATORY

**Previous:** Badge System v30 THE CODEX READER (750 badges)  
**Current:** Badge System v33 THE ANCIENT OBSERVATORY (843 badges)

**Version history delta (v30 → v33):**
- v31 THE CYBERSPACE CODEX: 750→781 badges (+31). Word Turn v21 sci-fi concept vocabulary. Calendar EE v19. Behavioral v18. Secret Boss v18 (gibson/dick/lem).
- v32 THE HERO'S JOURNEY: 781→812 badges (+31). Word Turn v22 hero's journey vocabulary. Campbell/Hobbit/Odyssey calendar EE v20. Hero_session/long_quest/threshold_moment behavioral v19. Secret Boss v19 (tolkien/odysseus/gilgamesh).
- v33 THE ANCIENT OBSERVATORY: 812→843 badges (+31). Word Turn v23 astronomical observation vocabulary. Calendar EE v21 (astronomers' birthdays). Behavioral v20. Secret Boss v20 (copernicus/galileo/kepler).

**Total badge count:** 843  
**Rarity tiers:** COMMON · UNCOMMON · RARE · EPIC · LEGENDARY · COSMIC · MYTHIC  
**Categories:** Word Turn · Calendar Easter Egg · Time Easter Egg · Behavioral · Achievement RPG · Mastery Tier · Secret Boss

---

### §16 — WORD TURN ENGINE: v23 ANCIENT OBSERVATORY

**Previous:** Word Turn Engine complete lexicon v22 (Hero's Journey)  
**Current:** Word Turn Engine complete lexicon v23 (Ancient Observatory)

#### Word Turn v23 — THE ANCIENT OBSERVATORY

| Badge ID | Symbol | Trigger Pattern | Rarity |
|---|---|---|---|
| zenith_reached | ↑·◉ | /\bzenith\b/i | RARE |
| nadir_point | ↓·◉ | /\bnadir\b/i | UNCOMMON |
| eclipse_note | ○·◉·○ | /\b(solar eclipse\|lunar eclipse\|eclipse)\b/i | RARE |
| aphelion_log | ○·∞ | /\baphelion\b/i | RARE |
| perihelion_note | ●·○ | /\bperihelion\b/i | RARE |
| azimuth_arc | →·∿ | /\bazimuth\b/i | RARE |
| declination_field | ∧·◉ | /\b(declination\|right ascension)\b/i | EPIC |
| culmination_arc | ↑·○ | /\bculmina(tion\|ting)\b/i | RARE |
| opposition_gate | ○·∞·○ | /\b(opposition\|retrograde)\b/i | RARE |
| ecliptic_path | ∿·→ | /\becliptic\b/i | UNCOMMON |
| parallax_note | ◈·○ | /\bparallax\b/i | RARE |
| precession_arc | ∿·∿·∿ | /\b(precession\|axial precession)\b/i | EPIC |

**Word Turn detection functions (easter-eggs.ts):**
- `detectWordTurns(text)` — existing function, now includes v23 patterns
- `checkObservatorySession(journalText)` — NEW: awards observatory_session if 3+ v23 vocab words present
- `checkDawnObserver()` — NEW: awards dawn_observer if check-in before 05:30 on 2+ days in 7-day window
- `checkLongNight()` — NEW: awards long_night if journal entry written 01:00–04:00 local

**OBSERVATORY_WORDS_V23 constant:** 13 regex patterns used by checkObservatorySession().

#### Secret Boss v20 — THE GREAT OBSERVERS

| Badge ID | Symbol | Trigger | Rarity |
|---|---|---|---|
| copernicus_key | ○→◉ | /\b(copernicus\|heliocentric)\b/i | RARE, hidden |
| galileo_signal | ◉·●·● | /\b(galileo\|moons of jupiter)\b/i | EPIC, hidden |
| kepler_arc | ○·∿·○ | /\b(kepler\|ellipse\|orbital mechanics)\b/i | MYTHIC, hidden |

**Unlock messages (examples):**
- copernicus_key: "↳ Copernicus moved Earth from center. He did not publish until his death. The heliocentric model waited thirty years for its author to be safe. Some truths require patience. ○→◉"
- galileo_signal: "↳ Galileo saw four moons orbiting Jupiter in 1610. Proof that not everything orbits Earth. He was put under house arrest for it. The signal was always there. ◉·●·●"
- kepler_arc: "↳ Kepler proved orbits are ellipses, not perfect circles. The universe is not as simple as we wish. Precision requires releasing the ideal. ○·∿·○"

---

### §16b — CALENDAR EASTER EGG ENGINE: v21 THE ASTRONOMERS' CALENDAR

**Previous:** Calendar EE v20 (Campbell Birthday Mar26 · Hobbit Day Sep22 · Odyssey Day Dec21)  
**Current:** Calendar EE v21 adds three astronomers' birthdays

| Badge ID | Symbol | Date | Person |
|---|---|---|---|
| galileo_birthday | ◉·● | February 15 | Galileo Galilei (born Feb 15, 1564) |
| copernicus_day | ○→◉ | February 19 | Nicolaus Copernicus (born Feb 19, 1473) |
| hubble_day | ∞·◉ | November 20 | Edwin Hubble (born Nov 20, 1889) |

**Detection:** `checkCalendarEasterEggs()` in easter-eggs.ts. Fires on every check-in by comparing `month` and `day` of current date.

---

### §16c — BEHAVIORAL ENGINE: v20 OBSERVATORY PATTERNS

**Previous:** Behavioral v19 (hero_session · long_quest · threshold_moment)  
**Current:** Behavioral v20 adds three observatory patterns

| Badge ID | Symbol | Trigger condition | Rarity |
|---|---|---|---|
| dawn_observer | ∘·↑ | Check-in before 05:30 local on 2+ days within any 7-day window | EPIC |
| long_night | ○·▓·○ | Journal entry written between 01:00 and 04:00 local time | RARE |
| observatory_session | ◉·∧·◉ | 3+ Ancient Observatory vocabulary words in a single journal entry | RARE |

**Implementation note:** `checkDawnObserver()` stores check-in dates in `localStorage['dawn_observer_dates']`. `checkObservatorySession()` filters `OBSERVATORY_WORDS_V23` regex array against the journal text and counts matches.

---

### §14b — ACHIEVEMENT RPG v21 — OBSERVATORY CLASS

| Badge ID | Symbol | Requirement | Rarity |
|---|---|---|---|
| observatory_entry | ∘→○ | Any 1 Word Turn v23 badge | COMMON |
| star_chart | ≈→○ | Any 5 Word Turn v23 badges | UNCOMMON |
| observatory_complete | ≋→○ | All 12 Word Turn v23 badges | LEGENDARY |
| celestial_arc | ○·◈ | observatory_complete + all 3 Calendar v21 badges | LEGENDARY |
| twenty_three_engines_arc | ◈·◈·○ | 1 badge from each Word Turn engine v1–v23 | LEGENDARY |
| stellar_opus | ○·◉·○ | observatory_complete + observatory_session | LEGENDARY |

---

### §14c — MASTERY TIER v23 — THE LONG VIEW

| Badge ID | Symbol | Requirement | Rarity |
|---|---|---|---|
| ancient_record | ∿·∞·∿ | 1,000+ distinct calendar days with at least one check-in | EPIC |
| grand_opus | ●·∞·○ | 175,000+ total journal words written | LEGENDARY |
| epoch_age | ╔═╗·○ | Account age ≥ 10 years (3,650+ days since signup) | LEGENDARY |
| twenty_three_registers | ◈·◈·○·∞ | Earn at least 1 badge from all 23 Word Turn engines | COSMIC |

**Progression chain:** twenty_one_registers (v21) → twenty_two_registers (v22) → twenty_three_registers (v23)  
**All three are COSMIC rarity.**

---

### §27 — VOCABULARY INDEX ADDITIONS (v88 delta)

New terms added to the vocabulary index:

| Term | Definition |
|---|---|
| ZENITH | The point in the celestial sphere directly above the observer. Highest arc of any body. |
| NADIR | The point in the celestial sphere directly below the observer. Lowest arc. |
| AZIMUTH | Compass bearing measured along the horizon from north to the point directly below the target. |
| DECLINATION | Celestial coordinate equivalent to latitude; measured in degrees north/south of the celestial equator. |
| RIGHT ASCENSION | Celestial coordinate equivalent to longitude; measured in hours east of the vernal equinox. |
| ECLIPTIC | The apparent annual path of the Sun against the background stars; the plane of Earth's orbit extended to the celestial sphere. |
| PARALLAX | Apparent shift in position of a nearby object against a distant background due to change in observer position; the basis of stellar distance measurement. |
| PRECESSION | Long-period wobble of Earth's rotation axis; the north pole traces a circle over ~26,000 years; the north star was not always Polaris. |
| APHELION | Earth's farthest point from the Sun (~152.1M km, early July). |
| PERIHELION | Earth's closest point to the Sun (~147.1M km, early January). |
| OPPOSITION | Configuration where Earth is between the Sun and an outer planet; the planet appears largest and brightest. |
| RETROGRADE | Apparent backward (westward) motion of a planet due to Earth overtaking it in its orbit. |
| CULMINATION | The moment a celestial body crosses the observer's meridian at its highest altitude. |
| ECLIPSE | Alignment of three bodies such that one passes into the shadow of another (solar or lunar). |
| OBSERVATORY_SESSION | Behavioral badge: 3+ Ancient Observatory vocabulary terms in one journal entry. |
| DAWN_OBSERVER | Behavioral badge: check-in before 05:30 local on 2+ days within 7 days. |
| LONG_NIGHT | Behavioral badge: journal entry written 01:00–04:00 local. |
| ANCIENT OBSERVATORY | Badge Engine v33 theme. Astronomical observation vocabulary. 12 Word Turn badges + 6 RPG + 4 Mastery + 3 Calendar + 3 Behavioral + 3 Secret Boss. |

---

### §28 — SYSTEM STATE SNAPSHOT (v88)

| Counter | Value |
|---|---|
| Day counter | 1115+ (as of September 16, 2026) |
| Field Manual | v114 |
| Self-Assembly phase | v114 |
| QIE patterns | 151 (P1–P151; P150 = total-field-coherence, ceiling confirmed) |
| QIE archetypes | 51 |
| Background jobs | 48 |
| Dep map nodes | 190+ |
| Log event handlers | 151+ |
| Assembly modules | 18 |
| User Index dimensions | 6 (ENG · EMO · INT · SOC · CARE · COG) |
| Ecosystem nodes | 6 (CAR · HOME · CPU · PHN · WCH · ROBOT) |
| Badge total | 843 |
| Word Turn engines | 23 |
| Word turn trigger words | 246+ |
| Secret boss triggers | 77 |
| Badge categories | 70+ |
| COSMO Gate | Active |

**QIE Ceiling note:** P150 total-field-coherence is the highest behavioral pattern defined. The badge engine is architecturally independent of the QIE ceiling and continues to expand.

**Badge progression landmarks:**

| Version | Name | Count | Delta |
|---|---|---|---|
| v1 baseline | — | ~76 | — |
| v15 | The Becoming Lexicon | 249 | COSMIC tier introduced |
| v18 | Arcade Protocol | 354 | — |
| v24 | The Oracle Archive | 564 | — |
| v25 | The Alchemist | 595 | MYTHIC tier introduced |
| v26 | The Quantum Library | 626 | — |
| v27 | The Neon Arcade | 657 | — |
| v28 | The Midnight Radio | 688 | — |
| v29 | The Bio-Terminal | 719 | — |
| v30 | The Codex Reader | 750 | — |
| v31 | The Cyberspace Codex | 781 | — |
| v32 | The Hero's Journey | 812 | — |
| **v33** | **The Ancient Observatory** | **843** | — |

---

## FIELD MANUAL REVISION LOG (v88 delta)

**FM v114 (2026-09-16):** Badge Engine v33 THE ANCIENT OBSERVATORY deployed. +31 badges (812→843). Day 1072+→1115+. 750→843 badge count. 20→23 Word Turn engines. 74→77 secret boss triggers. 210→246+ word turns. Self-Assembly phase v113→v114.

**FM v113 (2026-08-04):** QIE P149–P151 (quantum-presence-crystallization · total-field-coherence · recovery-intelligence-arc). Arch51 Quantum Presence Crystallizer. J48. P150 total-field-coherence = QIE ceiling. Day 1072+.

---

*LOT Systems Corporation · Vadim Marmeladov, CEO*  
*© 2025–2026 LOT Systems. All rights reserved.*  
*LOT-WIKI-v88 · 2026-09-16 · Day 1115+*
