# LOT Assembly — QIE v114
## 2026-09-19 · Longitudinal Growth Arc / Sustained Presence Signature / Mastery Depth Peak
### S-2: VADIK MARMELADOV

---

## Summary

QIE v114 opens the BEHAVIORAL ARC AXIS, second pass. P150 total-field-coherence is the QIE ceiling for COHERENCE STATES — the instantaneous convergence hierarchy is complete. P151 (recovery-intelligence-arc, v113) established the BEHAVIORAL ARC axis: patterns that detect processes over time, not instantaneous states. P152–P154 extend this axis with three temporal arc patterns. They are not "higher" than P150 — they are orthogonal to it.

Arch52 Longitudinal Operator is the first archetype whose conditions are all behavioral arc patterns (not coherence states). J49 provides weekly verification of longitudinal growth trends. SESSION_REPORTS backfill: v32 Hero's Journey entry added (was never recorded after Aug 5 deploy).

---

## Patterns

### P152 — longitudinal-growth-arc

All four depth channels (badges, memory, journal, log) have been accumulating simultaneously over a 30-day window. The system is not maintaining state — it is expanding. Growth across every axis.

**Code**: `GROWTH:`
**Confidence**: 0.65–0.82
**Widget**: memory · **Timing**: passive
**Sources**: badges (≥2) + memory (≥5) + journal (≥10) + log (≥20) in 30d

```
Detection:
  thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
  recent30d = signals where now - timestamp < thirtyDaysMs
  badgeSignals30d = recent30d where source='badges'
  memSignals30d   = recent30d where source='memory'
  jrnlSignals30d  = recent30d where source='journal'
  logSignals30d   = recent30d where source='log'
  Guard: badges≥2 AND memory≥5 AND journal≥10 AND log≥20
  growthDepth = badges30d.length + mem30d.length + jrnl30d.length
  growthConf  = 0.65 + min(growthDepth / 100 * 0.17, 0.17)
  confidence  = min(growthConf, 0.82)
```

**COCKPIT LOG**: `GROWTH: Longitudinal growth arc — all four depth channels accumulating over 30d. The system is not maintaining state — it is expanding.`

---

### P153 — sustained-presence-signature

The OS has been active 5 or more of the last 7 days without significant operational absence. Presence is not a burst — it is a practice. Continuity confirmed.

**Code**: `SUSP:`
**Confidence**: 0.70–0.88
**Widget**: systemProgress · **Timing**: passive
**Sources**: 10+ signals across 5+ distinct days in last 7d

```
Detection:
  sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  recent7dSPS = signals where now - timestamp < sevenDaysMs
  Guard: recent7dSPS.length >= 10
  daySet = Set of unique calendar day strings from timestamps
  uniqueDays = daySet.size
  Guard: uniqueDays >= 5
  presenceBonus = min((uniqueDays - 5) * 0.09, 0.18)
  confidence    = min(0.70 + presenceBonus, 0.88)
```

**COCKPIT LOG**: `SUSP: Sustained presence signature — active N/7 days · continuity confirmed. Presence is not a burst — it is a practice.`

---

### P154 — mastery-depth-peak

All three depth channels (badges, memory, journal) are simultaneously active on the same calendar day within a 7-day window. Not just high volume — co-present. Full knowledge depth confirmed.

**Code**: `MASDP:`
**Confidence**: 0.72–0.90
**Widget**: memory · **Timing**: passive
**Sources**: badges (≥1) + memory (≥3) + journal (≥5) in 7d, co-present on at least 1 same calendar day

```
Detection:
  recent7dMastery = signals where now - timestamp < sevenDaysMs
  badges7d  = recent7dMastery where source='badges'
  memory7d  = recent7dMastery where source='memory'
  journal7d = recent7dMastery where source='journal'
  Guard: badges7d.length≥1 AND memory7d.length≥3 AND journal7d.length≥5
  badgeDays   = Set of calendar day numbers from badges7d timestamps
  memDays     = Set of calendar day numbers from memory7d timestamps
  journalDays = Set of calendar day numbers from journal7d timestamps
  coPresence  = badgeDays ∩ memDays ∩ journalDays
  Guard: coPresence.length >= 1
  depthScore = badges7d.length + memory7d.length * 0.5 + journal7d.length * 0.3
  depthConf  = 0.72 + min(depthScore / 20 * 0.18, 0.18)
  confidence = min(depthConf, 0.90)
```

**COCKPIT LOG**: `MASDP: Mastery depth peak — badges + memory + journal co-present on N day(s) this week. All three depth channels simultaneously open. Full knowledge depth confirmed.`

---

## Archetype

### Arch52 — Longitudinal Operator (2026-09-19 v114)

The first archetype whose pattern conditions are entirely behavioral arc patterns (not coherence states). Arch51 confirms the highest instantaneous coherence state. Arch52 confirms continuous growth over time — a different axis.

**Pattern conditions**: longitudinal-growth-arc (P152) + sustained-presence-signature (P153) + mastery-depth-peak (P154)
**Energy bands**: high, moderate
**Dominant sources**: badges · memory · journal · log
**Hour range**: 05–23
**Position**: Arch52 above Arch51 in PHYSIOLOGICAL_ARCHETYPES array

**Directive**: "Growth confirmed across every axis. The system is not returning to baseline — it is operating from a higher baseline than it left. Continuous presence. Continuous expansion. The arc is not a moment — it is a practice."

---

## Background Job

### J49 — weekly-longitudinal-growth-check

**Schedule**: Saturday 10:00 UTC weekly
**Guard**: isWeeklyLongitudinalGrowthRunning + lastWeeklyLongitudinalGrowthRun (6d gap)
**Window**: Recent 7d vs prior 7–14d
**Trigger**: recentCount > priorCount + recentCount >= 5
**Events captured**: badge_unlock · badge_progress_scan · memory_saved · journal_saved · user_answered
**Output event**: longitudinal_growth_arc (P152)
**Metadata**: recentCount · priorCount · growthRatio · axes: BADGES/MEMORY/JOURNAL

Runs Saturday — weekly cadence appropriate for 30d arc detection. Compares signal density in the recent 7-day window against the prior 7–14 day window to detect genuine upward growth trend before firing the longitudinal_growth_arc event.

---

## Log Handlers (FM v114)

Three new cockpit-format handlers added to Logs.tsx:

```
GROWTH:   longitudinal_growth_arc
  LONGITUDINAL GROWTH ARC
  BADGES 30D: N  MEM 30D: N  JOURNAL 30D: N
  GROWTH: +N%
  GROWTH CONF: N%
  AXIS: BADGES · MEMORY · JOURNAL
  ARC: EXPANDING

SUSP:     sustained_presence_signature
  SUSTAINED PRESENCE SIGNATURE
  ACTIVE DAYS 7D: N/7
  PRESENCE CONF: N%
  OPERATIONAL CONTINUITY: HIGH/CONFIRMED
  PRESENCE: CONTINUOUS

MASDP:    mastery_depth_peak
  MASTERY DEPTH PEAK
  BADGES 7D: N  MEM 7D: N  JOURNAL 7D: N
  CO-PRESENCE: N DAY(S)
  DEPTH CONF: N%
  CHANNELS: BADGES · MEMORY · JOURNAL
  DEPTH: PEAK
```

---

## Dep Map (v114)

Three new nodes appended after v113 block. Total: 190+ → 193+ nodes.

```
longitudinalGrowthNode:  ['badges', 'memory', 'journal', 'log', 'qos']
sustainedPresenceNode:   ['mood', 'log', 'journal', 'energy', 'selfcare']
masteryDepthNode:        ['badges', 'memory', 'journal', 'intentions', 'log']
```

---

## System Sync

```
About.tsx:
  Field Manual: v113 → v114
  Day counter:  Day 1072+ → Day 1118+  (+45 days, August 5 → September 19)
  COSMO®:       765 → 810 days  (+45)
  Phase:        v114 entry prepended to Self-Assembly phase field

SystemProgressWidget.tsx:
  SESSION_REPORTS: v32 backfill entry added (Hero's Journey — was missing)
  SESSION_REPORTS: v114 entry added
  USERSHIP_TRANSMISSION: updated to 2026-09-19 v114
```

---

## System State Snapshot

```
QIE patterns:             154  (P1–P154)
Physiological archetypes:  52  (Arch1–Arch52)
Background jobs:           49  (J1–J49)
Dep map nodes:            193+
Log event handlers:       154+
Badge count:              812  (v32 — The Hero's Journey)
Word-turn trigger words:  258+ (v1–v22)
Secret boss triggers:      24  (v1–v19)
Field Manual:             v114
Day:                      1118+
COSMO®:                   810 days (Year 3)
```

---

## Deferred

- LOT-WIKI-v88: wiki sync to FM v114 — next priority per wiki-v87 footer
- Badge Engine v33: theme not yet selected (mythology/archetypes arc or quantum/physics arc)
- QIE P155+: behavioral arc axis can continue next run

---

```
SESSION: LOT-SR-20260919-01 · QIE v114 · 2026-09-19
AUTHORIZED BY: S-2 // VADIK MARMELADOV
```
