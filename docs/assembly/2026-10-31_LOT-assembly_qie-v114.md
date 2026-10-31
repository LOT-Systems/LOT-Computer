# LOT Assembly — QIE v114
## 2026-10-31 · Signal Breadth Arc / Reflection Triad / Weekly Breadth Anchor
### S-2: VADIK MARMELADOV

---

## Summary

QIE v114 introduces three new breadth-detection patterns that capture a dimension the existing pattern library lacks: horizontal field width. Prior patterns tend to measure depth and convergence (meta-patterns P143–P151 detect cascade states and total-field coherence). P152–P154 detect how many distinct signal channels are active, rewarding full-field engagement rather than intensity on any one axis.

Arch52 (Full-Spectrum Operator) reflects a person who keeps all channels open and maintains comprehensive capture across the system. J49 runs daily at 15:00 UTC to emit breadth events when the threshold is crossed.

---

## Patterns

### P152 — signal-breadth-peak

Fires when 8 or more unique signal sources (out of a 10-source pool) have contributed signals in the previous 24 hours. Distinct from P142 (adaptive-signal-web), which requires 7+ sources over 7 days AND a signal index threshold AND an established pattern set. P152 is a single-day pure breadth measure with no index requirement.

**Confidence**: 0.70 base, +0.05 per source above 8, max 0.90  
**Widget**: signalStream · **Timing**: passive  
**Source pool**: mood, memory, planner, intentions, selfcare, journal, calculator, log, energy, cohort

```
Detection:
  p152Sources = new Set(recentSignals.map(s => s.source))
  if p152Sources.size >= 8 → fire
  conf = min(0.70 + (size - 8) * 0.05, 0.90)
```

**COCKPIT LOG**: `SIGBRD: Signal breadth peak — N distinct signal sources active today. Full field operational. Every dimension contributing.`

---

### P153 — reflection-triad

Fires when journal, memory, and log have all contributed at least one signal in the previous 24 hours. These three sources form the reflection architecture: journal is active capture, memory is contextual retrieval, log is structured event emission. When all three are open simultaneously, the complete reflection loop is running.

**Confidence**: 0.70 base, +depth bonus from journal entries (−1) × 0.05 + memory repeats × 0.04 + log repeats × 0.04, max 0.90  
**Widget**: memory · **Timing**: soon  
**Sources**: journal, memory, log

```
Detection:
  p153Journal = recentSignals.filter(s => s.source === 'journal')
  p153Memory  = recentSignals.filter(s => s.source === 'memory')
  p153Log     = recentSignals.filter(s => s.source === 'log')
  if all three >= 1 → fire
  depthBonus = min((journal-1)*0.05 + (memory-1)*0.04 + (log-1)*0.04, 0.20)
```

**COCKPIT LOG**: `REFLTRI: Reflection triad active — journal + memory + log all open. Three capture channels running. Reflection loop closed.`

---

### P154 — weekly-breadth-anchor

Fires when 6 or more unique signal sources have been active across the previous 7 days. Captures sustained engagement breadth rather than single-day spikes. Complements P152's daily snapshot with a weekly continuity measure.

**Confidence**: 0.68 base, +0.06 per source above 6, max 0.88  
**Widget**: systemProgress · **Timing**: passive  
**Source pool**: mood, memory, planner, intentions, selfcare, journal, energy, cohort, log

```
Detection:
  p154WeekSources = new Set(weekSignals.map(s => s.source))
  if p154WeekSources.size >= 6 → fire
  conf = min(0.68 + (size - 6) * 0.06, 0.88)
```

**COCKPIT LOG**: `WKBRD: Weekly breadth anchor — N sources active in 7d. Full-width engagement confirmed for this week.`

---

## Archetype

### Arch52 — Full-Spectrum Operator

```yaml
archetype: Full-Spectrum Operator
energyBands: [moderate, high]
dominantSources: [journal, memory, log]
patternConditions:
  - signal-breadth-peak          # P152
  - reflection-triad             # P153
  - weekly-breadth-anchor        # P154
directive: >
  Full-width operation confirmed. 8+ signal channels active.
  Capture is comprehensive. The archive deepens.
```

**Position in cohort hierarchy**: Arch52 sits orthogonally to the meta-pattern cascade (Arch45–Arch51). Where Arch45–Arch51 measure convergence depth and identity crystallization, Arch52 measures engagement breadth. Both axes are valid. A Full-Spectrum Operator may or may not be in a quantum-presence-crystallization state; the defining characteristic is field width, not cascade depth.

---

## Background Job

### J49 — daily-signal-breadth-check

```
Schedule    : 15:00 UTC daily
Guard       : isDailySignalBreadthRunning + lastDailySignalBreadthRun (same-day dedup)
Window 24h  : Previous calendar day (prevDayStart → prevDayEnd)
Window 7d   : 7 days prior to end of previous calendar day

Trigger 24h : 8+ distinct signal sources in prior day → emits signal_breadth_peak
Trigger 7d  : 6+ distinct signal sources in prior 7d  → emits weekly_breadth_anchor

Detection:
  SOURCE_EVENTS map (20+ log event → source type pairs)
  Iterates over user's log events in window
  Groups by source, counts unique sources
  Emits event(s) if threshold crossed

Metadata:
  signal_breadth_peak:    uniqueSources, sourceList, window '24h-prior-day', tier
  weekly_breadth_anchor:  uniqueSources, sourceList, window '7d-prior', day

User scope  : lastSeenAt within 48h (2000-user limit)
```

**Timing rationale**: 15:00 UTC is late enough to capture full-day data for most timezones by early afternoon, but early enough that breadth events are available for late-day review.

**Total jobs after v114**: 49

---

## Dependency Map Nodes

| Node | Sources |
|------|---------|
| `signalBreadthPeakNode` | mood, memory, planner, intentions, selfcare, journal, calculator, log, energy, cohort |
| `reflectionTriadNode` | journal, memory, log |
| `weeklyBreadthAnchorNode` | mood, memory, planner, intentions, selfcare, journal, energy, cohort, log |

`signalBreadthPeakNode` has 10 source connections — the widest breadth node in the map by design; it measures the full available source field.

**Total dep nodes after v114**: 193+

---

## Signal Helpers

```typescript
recordSignalBreadthPeak(uniqueSources: number, sourceList: string[])
  → log source, 'signal_breadth_peak'
  → metadata: uniqueSources, sourceList, window: '24h', threshold: 8

recordReflectionTriad(journalCount: number, memoryCount: number, logCount: number)
  → journal source, 'reflection_triad'
  → metadata: journalCount, memoryCount, logCount, channels: ['journal','memory','log']

recordWeeklyBreadthAnchor(uniqueSources: number, sourceList: string[])
  → log source, 'weekly_breadth_anchor'
  → metadata: uniqueSources, sourceList, window: '7d', threshold: 6
```

---

## Military Log Handlers

### SIGBRD: (signal_breadth_peak)
```
SIGNAL BREADTH PEAK
SOURCES 24H: N
TIER: [PEAK (10) / ELEVATED (9) / STANDARD (8)]
[source list one per line]
```

### REFLTRI: (reflection_triad)
```
REFLECTION TRIAD
JOURNAL 24H: N
MEMORY 24H: N
LOG 24H: N
```

### WKBRD: (weekly_breadth_anchor)
```
WEEKLY BREADTH ANCHOR
SOURCES 7D: N
FULL-WIDTH: CONFIRMED
[source list one per line]
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/client/stores/intentionEngine.ts` | P152–P154 detection · Arch52 · 3 dep map nodes · 3 signal helpers |
| `src/client/components/QuantumEngineWidgets.tsx` | SIGBRD · REFLTRI · WKBRD in PATTERN_DISPLAY |
| `src/client/components/Logs.tsx` | 3 military handlers: SIGBRD: · REFLTRI: · WKBRD: |
| `src/client/components/PatternRecognitionWidget.tsx` | P152–P154 display names |
| `src/client/components/SystemProgressWidget.tsx` | v114 SESSION_REPORTS entry · USERSHIP_TRANSMISSION |
| `src/client/components/About.tsx` | FM v113→v114 · all counters updated |
| `src/server/scheduled-jobs.ts` | J49 shouldRun + execute + dispatch wiring |
| `src/server/routes/api.ts` | 3 new events in displayableEvents |

---

## Pattern Taxonomy — Breadth vs Depth Axis

```
DEPTH AXIS (meta-pattern cascade — P143–P151):
  P143 circadian-signal-lock
  P144 dimensional-saturation
  P145 quantum-identity-crystallization
  P146 signal-coherence-cascade
  P147 quantum-presence-field
  P148 identity-momentum-lock
  P149 quantum-presence-crystallization
  P150 total-field-coherence  ← CEILING
  P151 recovery-intelligence-arc

BREADTH AXIS (added v114):
  P152 signal-breadth-peak        ← 8+ sources in 24h
  P153 reflection-triad           ← journal + memory + log in 24h
  P154 weekly-breadth-anchor      ← 6+ sources in 7d
```

Both axes are orthogonal. A person maximizing depth (P150 total-field-coherence) may or may not also be a Full-Spectrum Operator. The system now measures both dimensions independently.

---

## System Counters (v114 final)

```
PATTERNS   : 154 (P1–P154)
ARCHETYPES : 52  (Arch1–Arch52)
JOBS       : 49  (J1–J49)
DEP NODES  : 193+
HANDLERS   : 154+
FM VERSION : v114
DAY        : 1157+
```

---

```
AUTHORIZED BY: S-2 // VADIK MARMELADOV
ASSEMBLY: 2026-10-31 · QIE v114 · LOT-SR-20261031-01
```
