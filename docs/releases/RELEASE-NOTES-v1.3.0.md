<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT COMPUTER — RELEASE NOTES v1.3.0
## 28 May 2026

---

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   LOT SYSTEMS CORPORATION                                     ║
║   RELEASE v1.3.0 — FIELD GRADE                                ║
║                                                               ║
║   474 COMMITS · 66,661 LoC · 207 SOURCE FILES                ║
║   38 WIDGETS · 62 QIE PATTERNS · 50 LOG EVENTS                ║
║   ALL SYSTEMS GREEN                                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## WHAT CHANGED

This release hardens the living system. Three critical bugs eliminated. Two new subsystems deployed. Navigation rebuilt from the ground up. The product is now field-grade.

---

## CRITICAL FIXES

### Theme Reset on Tab Switch — ELIMINATED

The system was resetting custom themes to black then white every time a user switched to the Log tab. Root cause: log trigger detection was scanning the entire log text on mount, firing `/prayer` and `/night` triggers that set the theme to dark, which disabled `isCustomThemeEnabled`, which let `useSun` auto-switch to light.

```
FIX: lastTriggerScanRef initialized to log.text (not empty string)
FIX: prayer/night triggers now check isCustomThemeEnabled before firing
```

Files: `src/client/components/Logs.tsx`

### /synth Command Not Firing — ELIMINATED

Same root cause as above. The mount-fire bug toggled synth on mount from existing `/synth` text. When the user then typed `/synth`, delta detection saw it was already present and did nothing.

```
FIX: Same ref initialization — triggers only fire on genuinely new text
```

### Slow Tab Switching — ELIMINATED

Nav buttons were `<a href>` elements. Even with `preventDefault`, the browser was initiating navigation before JavaScript could stop it.

```
FIX: All nav items are now pure <button> elements
FIX: goTo() calls openPage() directly — zero debounce, zero href
FIX: 0 anchor tags in nav (verified)
```

Files: `src/client/components/ui/Layout.tsx`

---

## NEW: ARCHITECT WIDGET

Executive self-assembly telemetry for paid users. Shows the full state of the Self-Assembly engine in one view.

```
SECTIONS:
  LOT Self-Assembly brand header
  System phase + overall assembly percentage
  Module count (online/total) + signal counts (24h, 7d)
  Phase distribution (integrated/assembled/forming/awakening/dormant)
  Module telemetry — expandable rows with density, coherence, signal age
  Signal source breakdown (7d)
  Assembly narrative
  Transmission Run (live assembly log)
```

Stabilized by removing `useStore(intentionEngine)` subscription — reads via `.get()` in memoized computations keyed to `assembly.lastComputed`. No render cascades.

Files: `src/client/components/ArchitectWidget.tsx` (295 lines, new)

---

## NEW: MEDICAL RECORDS

The Memory engine now collects health information. Medical questions appear organically in the existing prompt rotation. Answers are detected server-side and logged as `medical_record` events with distinct rendering.

```
QUESTIONS:     15 (blood type, allergies, medications, conditions, vision,
               dental, heart rate, skin type, pain, vaccinations, hearing)
DETECTION:     28 keywords, server-side string match on question text
LOG EVENT:     medical_record (distinct from answer)
LOG RENDER:    MED: (question) + REC: (answer)
AI PROMPT:     Medical topic added to all exploration lists
BACKUP POOL:   44 total (29 self-care + 15 medical)
```

No health APIs. No insurance forms. No data brokers. You answer a question. LOT remembers.

Files: `constants.ts`, `question-generator.ts`, `api.ts`, `Logs.tsx`

---

## NAV: COMING SOON TABS

Basics, Self-care, Kids, Home — four tabs that aren't wired yet. They were previously rendered identically to active tabs, just disabled. Now they are visually grayed out.

```
STYLING:  opacity-30 + pointer-events-none
RESULT:   Clear visual separation between live and coming-soon
```

Files: `src/client/components/ui/Layout.tsx`

---

## SELF-ASSEMBLY ENGINE STATUS

```
MODULES:           17
PHASES:            5 (dormant → awakening → forming → assembled → integrated)
STORE:             selfAssembly.ts — stable, localStorage-persisted
ARCHITECT WIDGET:  ONLINE — real-time telemetry
TRANSMISSION RUN:  Visible in Architect widget
LOG EVENT:         self_assembly — rendered in Log view
```

---

## QUANTUM INTENT ENGINE STATUS

```
PATTERNS:          62 unique patterns
SIGNAL EVENT:      quantum_intent_signal
STORE:             intentionEngine.ts — stable (.get() reads only)
TOPIC TRACKING:    11 topics including medical
```

---

## LOG SYSTEM STATUS

```
EVENT TYPES:       50 distinct events rendered
CONTAINERS:        MEM:/OUT: (memory)
                   MED:/REC: (medical record)
                   COMM: (chat)
TRIGGERS:          15 types, 6 wired to live actions
MOUNT-FIRE:        Fixed — ref initialized to existing text
THEME GUARD:       prayer/night check isCustomThemeEnabled
```

---

## COMPLETE COMMIT LOG

```
 1. Add Architect widget — executive self-assembly telemetry
 2. Add LOT Self-Assembly brand header to Architect widget
 3. Align Architect widget fonts and spacing with SystemProgressWidget
 4. Stabilize ArchitectWidget — stop render cascade from intentionEngine
 5. Stop log triggers from firing on mount + eliminate <a> tags from nav
 6. LOT Computer v1.3.0 — Military-Grade Production Benchmark
 7. Add Assembly Transmission Run to Architect widget
 8. Add Medical Record to Memory question engine
 9. Add LOT Medical Records field specification
10. Gray out coming-soon nav tabs (Basics, Self-care, Kids, Home)
```

---

## FILE MAP

```
NEW FILES:
  src/client/components/ArchitectWidget.tsx        295 lines
  docs/corporate/LOT_PRODUCT_BENCHMARK.md          450 lines
  docs/corporate/LOT_Medical_Records.md            193 lines

MODIFIED:
  src/client/components/Logs.tsx                   Trigger fix + medical_record render
  src/client/components/ui/Layout.tsx              Pure button nav + coming-soon styling
  src/client/components/System.tsx                 Architect widget integration
  src/client/components/SystemProgressWidget.tsx   Transmission export
  src/client/stores/intentionEngine.ts             Pattern updates
  src/client/stores/router.ts                      Clean goTo()
  src/server/routes/api.ts                         Medical keyword detection
  src/server/utils/memory/constants.ts             Medical questions + keywords
  src/server/utils/memory/question-generator.ts    Medical topic integration
  package.json                                     1.2.0 → 1.3.0
```

---

## METRICS

```
VERSION:           1.3.0 (from 1.2.0)
COMMITS THIS CYCLE:10
TOTAL COMMITS:     474
SOURCE FILES:      207
LINES OF CODE:     66,661
WIDGETS:           38
QIE PATTERNS:      62
LOG EVENTS:        50
DOCS:              121
BRANDED FILES:     200/207 (96.6%)
BUGS ELIMINATED:   3 critical (theme reset, /synth, slow tabs)
NEW SUBSYSTEMS:    2 (Architect widget, Medical Records)
BUILD:             PASSING
SECURITY:          CLEAN
```

---

## BREAKING CHANGES

None. Fully backward compatible.

---

## DEPLOYMENT

Standard process. No schema changes. No new environment variables.

```
yarn build
# Deploy via DigitalOcean App Platform (master branch trigger)
```

---

```
LOT SYSTEMS CORPORATION
v1.3.0 — FIELD GRADE — ALL SYSTEMS GREEN
28 May 2026
Made in the USA
```
