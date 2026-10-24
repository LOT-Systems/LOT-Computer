<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT COMPUTER — SESSION S-2 REPORT
## Eating Disorder Healing Protocol + Medical Cohort Integration
## 30 May 2026

---

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   LOT SYSTEMS CORPORATION                                     ║
║   SESSION S-2 — FIELD REPORT                                  ║
║                                                               ║
║   PTSD-COMORBID EATING DISORDER HEALING                       ║
║   MEDICAL RECORDS → PAID COHORT QUALIFICATION                ║
║                                                               ║
║   11 FILES · 176 LINES · 6 SYSTEMS TOUCHED · BUILD GREEN     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## CLINICAL FOUNDATION

PTSD and eating disorders share a documented comorbidity rate of approximately 50%. The mechanisms are well-understood:

```
PTSD CLUSTER               → EATING DISORDER MANIFESTATION
─────────────────────────────────────────────────────────────
Hyperarousal                → Restriction as control mechanism
Avoidance                   → Food avoidance, meal skipping
Negative self-concept       → Body dissatisfaction, body shame
Affect dysregulation        → Binge eating as emotional regulation
Re-experiencing             → Food-related triggers, meal anxiety
Interpersonal difficulty    → Eating alone, hiding food behaviors
```

The VA recognizes eating disorders as trauma-related conditions. DSM-5 includes ARFID (Avoidant/Restrictive Food Intake Disorder). The ICD-11 C-PTSD framework maps directly to disordered eating patterns.

LOT detects these patterns through the language the person already uses. No diagnostic questions. No clinical labels. The system notices and adjusts.

---

## WHAT WAS BUILT

### 1. Eating Disorder Profile (types.ts)

New `EatingDisorderProfile` interface added to `TraumaIndicatorProfile`:

```
DIMENSION              RANGE    WHAT IT DETECTS
──────────────────────────────────────────────────
restriction            0-100    Meal skipping, calorie fear, food rules
bingeing               0-100    Loss of control, emotional eating, secret eating
purging                0-100    Compensatory behavior, excessive exercise
bodyDissatisfaction    0-100    Negative body image, mirror avoidance, weight fixation
foodAnxiety            0-100    Meal-time stress, safe foods, fear of gaining
recoverySignals        0-100    Nourishment language, intuitive eating, body acceptance
```

### 2. Detection Layer (trait-extraction.ts)

Six new keyword arrays added to `detectTraumaIndicators()`:

```
ARRAY                    KEYWORDS   EXAMPLES
──────────────────────────────────────────────────────────────
restrictionKeywords      20         skip meals, calories, afraid to eat, food rules
bingeingKeywords         18         can't stop eating, emotional eating, eat my feelings
purgingKeywords          12         purge, compensate, over-exercise, punish for eating
bodyDissatisfactionKw    18         hate my body, body dysmorphia, comparing my body
foodAnxietyKeywords      14         anxious about food, safe foods, obsess about food
nutritionRecoveryKw      16         nourish, intuitive eating, body acceptance, fuel
```

New trauma source added: `'eating disorder'` with 8 keywords (anorexia, bulimia, binge eating, purging, etc.)

New recovery indicator added: `'nutrition recovery'` with 7 keywords.

Composite score weights updated: clusters 50% + C-PTSD 30% + eating disorder 20%.

### 3. Eating Recovery Questions (constants.ts)

8 new backup questions added, based on EDE-Q (Eating Disorder Examination Questionnaire) adapted for non-diagnostic behavioral observation:

```
CATEGORY               QUESTIONS   EXAMPLES
──────────────────────────────────────────────────────────────
Relationship with food  3          How would you describe your relationship with food?
                                   How regular are your meals on a typical day?
                                   When you sit down to eat, how do you usually feel?

Body relationship       2          How do you feel about your body most days?
                                   How often do you check your weight or body?

Nourishment/recovery    3          Do you feel you nourish your body enough?
                                   What does "eating well" mean to you?
                                   How has your appetite been recently?
```

### 4. AI Prompt Integration (question-generator.ts)

When eating/nutrition distress is detected (any ED dimension ≥ 17):

```
INJECTED GUIDANCE:
- Ask about nourishment, meal routines, body kindness
- NEVER about weight, calories, or appearance
- Frame food as fuel and care, not control
- If nutrition recovery detected: acknowledge gently
```

Topic diversity tracking: added `nutrition` topic to prevent repetitive food questions.

### 5. Signal Routing (Self-Assembly + QIE)

```
NEW SIGNALS                    → MODULE
──────────────────────────────────────────
'eating_recovery_answer'       → resilience
'nutrition_signal'             → resilience

SOURCE TYPE                    → MODULES FED
──────────────────────────────────────────
'medical'                      → resilience, memory (existing)
'resilience'                   → resilience, biofield (existing)
```

IntentionSignal source type expanded: added `'medical'` and `'resilience'` to the union type.

### 6. Chakra Engine Integration (chakraErgonomics.ts)

```
CHAKRA          WHAT CHANGED
──────────────────────────────────────────────────────────────
Solar Plexus    Eating recovery signals boost charge (+5 per signal, max +15)
(Manipura)      Nourishment = core energy. The body's fire center.

Root            Medical + resilience signals add grounding (+3 per signal, max +12)
(Muladhara)     Body awareness = grounding. Knowing your blood type is stability.
```

### 7. Medical Cohort Qualification (cohort-determination.ts)

New functions for paid cohort assessment:

```
assessMedicalProfile(logs)
  → Scans medical_record events
  → Detects: blood type, allergies, medications, chronic conditions
  → Returns MedicalProfile with boolean flags + answer count

qualifiesForPaidCohort(medicalProfile, answerCount)
  → Requires: 10+ total answers AND (3+ medical answers OR 2+ medical data points)
  → Users who share medical data qualify for personalized paid-tier experiences
```

### 8. Client-Side Detection (MemoryWidget.tsx)

Medical keyword detection expanded:
```
+ appetite, digestion, food sensitivity, eating habits
```

Trauma-informed keyword detection expanded:
```
+ relationship with food, regular are your meals, sit down to eat,
  feel about your body, check your weight, nourish your body,
  eating well, appetite been recently
```

### 9. Server-Side Detection (api.ts)

MEDICAL_KEYWORDS array expanded with eating/nutrition terms:
```
+ appetite, digestion, digestive, nutrition, eating habits, food sensitivity
```

---

## SIGNAL FLOW — EATING DISORDER PATH

```
1. USER ANSWERS EATING RECOVERY QUESTION
   "How would you describe your relationship with food?"
   → Answer: "Complicated — I think about it a lot"
   
2. CLIENT-SIDE (MemoryWidget.tsx)
   → isTraumaInformed = true (matches "relationship with food")
   → recordSignal('resilience', 'trauma_informed_answer', {...})
   
3. QIE → SELF-ASSEMBLY
   → SOURCE_MAP: 'resilience' → [resilience, biofield]
   → Resilience Protocol module advances
   → Biofield Engine receives signal
   
4. CHAKRA ENGINE
   → Solar Plexus gains +5 charge (nourishment signal)
   → Root gains +3 charge (body awareness)
   
5. SERVER-SIDE (next question generation)
   → detectTraumaIndicators() runs
   → Eating disorder profile computed (restriction, bingeing, etc.)
   → If ED dimensions ≥ 17: eating/nutrition distress flagged
   → AI prompt receives: "ask about nourishment, body kindness — NEVER about weight"
   
6. NEXT QUESTION
   → AI generates food-as-care question, not food-as-control
   → "Do you feel you nourish your body enough each day?"
```

---

## BACKUP QUESTION POOL — UPDATED

```
Self-care:           29 questions
Medical:             15 questions
Trauma-informed:     18 questions
Eating recovery:      8 questions
────────────────────────────────
Total:               70 questions
```

---

## FILE MAP

```
TYPE SYSTEM:
  src/server/utils/memory/types.ts
    └─ EatingDisorderProfile (6 dimensions)
    └─ TraumaIndicatorProfile.eatingDisorder (new field)

DETECTION:
  src/server/utils/memory/trait-extraction.ts
    ├─ 6 new keyword arrays (98 keywords total)
    ├─ 'eating disorder' trauma source (8 keywords)
    ├─ 'nutrition recovery' indicator (7 keywords)
    └─ Composite score: clusters 50% + C-PTSD 30% + ED 20%

QUESTIONS:
  src/server/utils/memory/constants.ts
    ├─ BACKUP_EATING_RECOVERY_QUESTIONS (8 questions)
    └─ MEDICAL_QUESTION_KEYWORDS (+6 eating/nutrition terms)

AI PROMPT:
  src/server/utils/memory/question-generator.ts
    ├─ Eating disorder context in traumaContext
    ├─ Nutrition recovery acknowledgment
    ├─ 'nutrition' topic in diversity tracking
    └─ Backup pool: 70 total (was 62)

COHORT:
  src/server/utils/memory/cohort-determination.ts
    ├─ MedicalProfile type
    ├─ assessMedicalProfile() — scan medical_record logs
    └─ qualifiesForPaidCohort() — 10+ answers + medical depth

SIGNAL ROUTING:
  src/client/stores/selfAssembly.ts
    └─ SIGNAL_MAP: eating_recovery_answer, nutrition_signal → resilience

  src/client/stores/intentionEngine.ts
    └─ IntentionSignal.source: added 'medical' | 'resilience'

  src/client/components/MemoryWidget.tsx
    └─ onAnswer: +4 medical keywords, +8 trauma-informed keywords

CHAKRA:
  src/client/stores/chakraErgonomics.ts
    ├─ Solar Plexus: eating recovery boost (+5/signal, max +15)
    └─ Root: medical/resilience grounding (+3/signal, max +12)

SERVER:
  src/server/routes/api.ts
    └─ MEDICAL_KEYWORDS: +6 eating/nutrition terms

EXPORTS:
  src/server/utils/memory/index.ts
    └─ Added: BACKUP_EATING_RECOVERY_QUESTIONS, EatingDisorderProfile,
       assessMedicalProfile, qualifiesForPaidCohort
```

---

## METRICS

```
FILES MODIFIED:            11
LINES ADDED:               176
KEYWORD ARRAYS ADDED:      6 (98 keywords)
BACKUP QUESTIONS:          62 → 70 (+8 eating recovery)
EATING DISORDER DIMENSIONS: 6
TRAUMA SOURCES:            10 → 11 (+eating disorder)
RECOVERY CATEGORIES:       6 → 7 (+nutrition recovery)
COMPOSITE SCORE WEIGHTS:   clusters 50% + C-PTSD 30% + ED 20%
CHAKRAS WIRED:             2 (Solar Plexus, Root)
COHORT FUNCTIONS ADDED:    2 (assessMedicalProfile, qualifiesForPaidCohort)
SIGNAL PATTERNS ADDED:     2 (eating_recovery_answer, nutrition_signal)
QIE SOURCE TYPES ADDED:    2 (medical, resilience)
BUILD:                     GREEN
```

---

## SESSION PROCESS

```
1. Systems health check     ✓ GREEN — clean tree, build passes
2. R&D                      ✓ 10 integration points mapped across 6 systems
3. Build                    ✓ 11 files modified, 176 lines, all systems wired
4. Systems health check     ✓ GREEN — build passes clean
5. .MD report               ✓ This document
6. Push                     → Next
```

---

## WHAT WE DON'T DO

```
We don't diagnose eating disorders
We don't label users as anorexic, bulimic, or binge eaters
We don't ask about weight, calories, or body measurements
We don't share eating patterns with anyone
We don't push recovery faster than the person moves
We don't claim to replace treatment
```

The eating disorder profile is computed fresh each time a question is generated. It is not stored. It is not visible to the user. It is not exported.

Its only purpose is to make the next question gentler — and to frame food as nourishment, not control.

---

## THE STANDARD

When a person who has been starving themselves answers a question about their relationship with food, the system does not ask about calories next. It asks about nourishment. About body kindness. About what "eating well" means to them.

The system heals the way a field medic heals: by presence, not prescription.

---

```
LOT SYSTEMS CORPORATION
Session S-2 Report
Eating Disorder Healing + Medical Cohort
v1.3.0 · 30 May 2026
Made in the USA
```
