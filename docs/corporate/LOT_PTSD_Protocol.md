<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT COMPUTER — PTSD/C-PTSD PROTOCOL
## Trauma-Informed Memory Engine · Field Specification
## 29 May 2026

---

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   LOT SYSTEMS CORPORATION                                     ║
║   PTSD / C-PTSD PROTOCOL — FIELD GRADE                        ║
║                                                               ║
║   v1.3.0 · 29 MAY 2026                                       ║
║   CLASSIFICATION: FIELD-GRADE · TRAUMA-INFORMED               ║
║   NOT A DIAGNOSTIC TOOL · NOT A REPLACEMENT FOR TREATMENT     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## WHY THIS EXISTS

PTSD is not a military condition. It is a human condition.

A child who watched their parent leave. A person who lost their job and couldn't pay rent. A spouse who survived a divorce they didn't choose. A worker who was laid off the week their kid was born. A refugee who crossed a border with nothing.

The VA estimates that 6 out of every 100 people will experience PTSD at some point in their lives. The ACE study found that nearly two-thirds of adults have at least one adverse childhood experience. Most will never be screened. Most will never be asked.

LOT asks. Gently. Over time. Through the questions it already asks.

---

## WHAT THIS IS NOT

```
NOT a diagnostic tool
NOT a replacement for therapy or medication
NOT a clinical assessment
NOT a screening instrument with cutoff scores
NOT a way to label people
```

This is a behavioral observation system that detects language patterns over time and adjusts its approach to be more supportive when those patterns emerge.

---

## CLINICAL FOUNDATION

### PCL-5 (PTSD Checklist for DSM-5)

The gold standard. 20 items across 4 symptom clusters. Developed by the National Center for PTSD (Weathers et al., 2013). Used in VA settings, civilian mental health, and research worldwide. Public domain.

LOT maps its detection to the same 4 clusters:

```
CLUSTER B — Re-experiencing (Intrusion)
  Intrusive memories, nightmares, flashbacks, distress at reminders
  
CLUSTER C — Avoidance
  Avoiding thoughts, feelings, reminders, places, people
  
CLUSTER D — Negative Alterations in Cognition and Mood
  Negative self-concept, emotional numbing, detachment, loss of interest,
  persistent guilt, shame, blame
  
CLUSTER E — Hyperarousal
  Sleep disruption, hypervigilance, exaggerated startle, irritability,
  difficulty concentrating, reckless behavior
```

### ICD-11 Complex PTSD (C-PTSD)

The ICD-11 added C-PTSD as a distinct diagnosis. It requires full PTSD criteria PLUS three additional domains of disturbance in self-organization:

```
1. AFFECT DYSREGULATION
   Difficulty controlling emotions. Explosive outbursts or complete
   emotional shutdown. Dissociation. Mood swings beyond normal range.

2. NEGATIVE SELF-CONCEPT
   Persistent feelings of worthlessness, shame, guilt, being "damaged"
   or "broken." Feeling fundamentally different from other people.

3. INTERPERSONAL DIFFICULTIES
   Inability to trust. Pushing people away. Difficulty maintaining
   relationships. Fear of closeness. Pattern of isolation.
```

C-PTSD typically results from prolonged, chronic exposure: childhood abuse/neglect, domestic violence, captivity, displacement. But the ICD-11 criteria do not require repeated trauma — a single event with sufficient impact qualifies.

### ACE (Adverse Childhood Experiences)

The ACE questionnaire identifies 10 types of childhood adversity:

```
ABUSE:               Emotional, Physical, Sexual
NEGLECT:             Emotional, Physical
HOUSEHOLD DYSFUNCTION: Domestic violence, Substance abuse,
                       Mental illness, Parental separation/divorce,
                       Incarcerated household member
```

Higher ACE scores predict increased risk for: mental health disorders, substance use, chronic physical health conditions, and premature mortality. LOT does not calculate ACE scores — it detects linguistic markers that may indicate ACE-related experiences.

### VA Behavioral Markers

From VA Whole Health Library and PTSD research:

```
DAILY LIFE IMPACT:
  - Hypervigilance causing exhaustion, inability to concentrate
  - Avoidance restricting daily activities and social functioning
  - Emotional numbing making intimate relationships difficult
  - Sleep disruption leading to chronic fatigue
  - Irritability and anger damaging work and personal relationships
```

---

## EVERY-PERSON TRAUMA SOURCES

LOT detects language patterns that may indicate exposure to:

| Source | Examples |
|--------|----------|
| Childhood adversity | Abuse, neglect, foster care, orphanage |
| Abandonment | Parent leaving, being given up, rejection |
| Divorce or separation | Custody battles, family dissolution |
| Job loss or financial crisis | Firing, layoff, bankruptcy, homelessness |
| Grief or loss | Death of loved one, terminal diagnosis |
| Domestic violence | Physical abuse, control, entrapment |
| Accident or injury | Car crash, workplace accident, surgery |
| Military or combat | Deployment, firefight, service-related |
| Sexual trauma | Assault, violation, coercion |
| Displacement | Refugee status, forced migration, uprooting |

Detection requires 2+ keyword matches per source category — single mentions are not flagged.

---

## HOW IT WORKS

### Detection Layer

The `detectTraumaIndicators()` function analyzes all available user text:
- Memory answers (questions + selected options)
- Medical record answers
- Journal entries (notes longer than 20 characters)
- Emotional check-in moods and states

It does NOT prompt for trauma. It observes what the user has already shared.

### Seven Indicator Dimensions

```
PCL-5 CLUSTERS (60% of composite score):
  1. Hyperarousal         0-100
  2. Avoidance            0-100
  3. Negative Alterations 0-100
  4. Re-experiencing      0-100

C-PTSD INDICATORS (40% of composite score):
  5. Affect Dysregulation      0-100
  6. Negative Self-Concept     0-100
  7. Interpersonal Difficulty  0-100
```

### Risk Levels

```
NONE:      score < 15  — No significant indicators detected
LOW:       score 15-34 — Some patterns present, may be subclinical
MODERATE:  score 35-59 — Multiple cluster indicators detected
ELEVATED:  score 60+   — Significant pattern across multiple clusters
```

### Trajectory Detection

The system tracks emotional check-in patterns over time to determine whether the user's trajectory is:

```
UNKNOWN:    Not enough data
EMERGING:   Indicators newly appearing
STABLE:     Indicators present but not changing
IMPROVING:  Negative mood patterns decreasing
DECLINING:  Negative mood patterns increasing
```

### Recovery Indicators

Positive signals that counterbalance risk:

```
therapy engagement       — mentions therapy, counseling, treatment
self-awareness growing   — realizes, understands, healing, progress
social reconnection      — opened up, support group, trusted someone
routine stabilization    — structure, consistent, safe space, grounded
emotional regulation     — breathing, meditation, grounding, coping
meaning-making          — purpose, growth, stronger, survived, resilient
```

---

## QUESTION PROTOCOL

### 18 Trauma-Informed Backup Questions

Organized by PCL-5 cluster. All questions observe present-day functioning — they never ask about the past directly.

**Hyperarousal (4 questions):**
- Sleep quality
- Startle response
- Physical tension without cause
- Ability to relax

**Avoidance (3 questions):**
- Places/situations avoided
- Response to difficult memories
- Social withdrawal patterns

**Negative Alterations (3 questions):**
- Self-regard
- Emotional numbing frequency
- Capacity for joy

**Re-experiencing (2 questions):**
- Unwanted memory frequency
- Disturbing dreams

**C-PTSD Domains (3 questions):**
- Emotional regulation capacity
- Trust with new people
- Pushing people away in close relationships

**Recovery & Coping (3 questions):**
- Support network
- What helps during hard times
- Self-assessed recovery capacity

### AI Prompt Modification

When trauma indicators are detected (risk level > none), the AI prompt builder injects trauma-informed guidance:

```
RULES FOR TRAUMA-INFORMED QUESTIONS:
  1. NEVER ask directly about traumatic events
  2. NEVER probe for details of what happened
  3. Ask about PRESENT-DAY functioning only
  4. Use "How do you..." not "Why do you..."
  5. Honor avoidance — respect every boundary
  6. Prioritize: safety, stability, routines, connections, small wins
  7. Frame recovery as natural and gradual
  8. Match question to detected cluster:
     - Hyperarousal → rest, calm, grounding
     - Avoidance → gentle engagement, safe activities
     - Negative self → strengths, values, competence
     - Interpersonal → safe connections, healthy boundaries

TONE: Calm. Steady. Non-judgmental. Like a field medic.
```

---

## BACKUP QUESTION POOL

Total backup questions in rotation when AI engines fail:

```
Self-care:         29 questions
Medical:           15 questions
Trauma-informed:   18 questions
────────────────────────────
Total:             62 questions
```

---

## FILE MAP

```
src/server/utils/memory/types.ts
  └─ TraumaIndicatorProfile          Type definition (7 dimensions + metadata)

src/server/utils/memory/trait-extraction.ts
  └─ detectTraumaIndicators()        Core detection function
     ├─ PCL-5 cluster keyword matching (4 clusters × ~16 keywords each)
     ├─ C-PTSD indicator matching (3 domains × ~18 keywords each)
     ├─ Trauma source detection (10 sources × ~7 keywords each)
     ├─ Recovery indicator detection (6 categories × ~6 keywords each)
     ├─ Trajectory analysis from mood check-in history
     └─ Risk level determination

src/server/utils/memory/constants.ts
  └─ BACKUP_TRAUMA_INFORMED_QUESTIONS  18 questions by cluster

src/server/utils/memory/question-generator.ts
  ├─ traumaContext injection in buildPrompt()
  ├─ Merged backup rotation (62 questions total)
  └─ resilience topic in diversity tracking

src/server/utils/memory/index.ts
  └─ Exports: detectTraumaIndicators, TraumaIndicatorProfile,
              BACKUP_TRAUMA_INFORMED_QUESTIONS
```

---

## WHAT WE DON'T DO

```
We don't diagnose PTSD, C-PTSD, or any condition
We don't assign clinical labels to users
We don't share trauma indicators with anyone
We don't alert third parties
We don't store a "PTSD score" as a persistent user attribute
We don't ask about specific traumatic events
We don't push people to disclose
We don't claim to replace professional treatment
We don't use this data for advertising or profiling
```

The trauma profile is computed fresh each time a question is generated. It exists only during that computation. It is not stored in the database. It is not visible to the user. It is not exported to any external system.

Its only purpose is to make the next question gentler.

---

## CLINICAL REFERENCES

- **PCL-5**: Weathers, F.W., Litz, B.T., Keane, T.M., Palmieri, P.A., Marx, B.P., & Schnurr, P.P. (2013). PTSD Checklist for DSM-5. National Center for PTSD.
- **ICD-11 C-PTSD**: Cloitre, M., et al. (2013). ICD-11 proposal for Complex PTSD. European Journal of Psychotraumatology.
- **ACE Study**: Felitti, V.J., et al. (1998). Relationship of Childhood Abuse and Household Dysfunction to Many of the Leading Causes of Death in Adults. American Journal of Preventive Medicine.
- **VA Whole Health Library**: U.S. Department of Veterans Affairs. Posttraumatic Stress Disorder (PTSD) overview.
- **PTSD Trajectories**: Galatzer-Levy, I.R., et al. (2018). Quantitative approaches for estimating probable PTSD in trauma-exposed populations.

---

## THE STANDARD

LOT does not hide how it works. Every keyword is listed in the source code. Every detection threshold is documented. The algorithm is a string match — no ML black box, no hidden scoring.

If a person is carrying something heavy, the system tries to be a little gentler. That is all this does.

A person in crisis should not have to fill out a form to be treated with care.

---

```
LOT SYSTEMS CORPORATION
PTSD/C-PTSD Protocol — Field Specification
v1.3.0 · 29 May 2026
Made in the USA
```
