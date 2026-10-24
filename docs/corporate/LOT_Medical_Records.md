<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT MEDICAL RECORDS

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   LOT SYSTEMS CORPORATION                                     ║
║   MEDICAL RECORDS — FIELD SPECIFICATION                       ║
║                                                               ║
║   v1.3.0 · 28 MAY 2026                                       ║
║   CLASSIFICATION: FIELD-GRADE · TRANSPARENT · OPEN            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## WHY

You carry your body every day. LOT should know what it carries.

Blood type. Allergies. Pain. Vision. The things a field medic asks before anything else. The things your system should already know about you — not because it surveils you, but because you told it, once, calmly, on your own terms.

No hospital portal. No insurance form. No data broker.

You answer a question. LOT remembers.

---

## THE FIELD

LOT was built for people who have been through things. Veterans. Survivors. Parents running on no sleep. People whose nervous systems don't always cooperate. People who forget to eat, forget their meds, forget they have a body at all.

The Medical Records system exists because:

- A person in crisis should not have to remember their blood type
- A person with PTSD should not have to fill out another form
- A person rebuilding their life deserves a system that holds what they can't

This is not a health app. This is a field record.

---

## HOW IT WORKS

```
QUESTION ──► ANSWER ──► DETECTION ──► RECORD
```

1. A medical question appears in the Memory prompt — same calm interface, same pace, same tone
2. You answer it. One tap. No forms. No next page. No submit button
3. The system detects the medical nature of the question (28 keywords, server-side)
4. Your answer is stored as a `medical_record` — separate from regular memory, labeled differently in your log

That's it.

---

## WHAT WE ASK

15 questions. Each one direct. Each one with a "Not sure" or equivalent escape.

```
 1. What is your blood type?
 2. Do you have any known food allergies?
 3. Do you take any daily medications or supplements?
 4. Do you have any chronic health conditions?
 5. How would you describe your vision?
 6. When was your last general health checkup?
 7. Do you have any seasonal allergies?
 8. What is your typical resting heart rate range?
 9. Do you have any dental concerns?
10. How would you describe your skin type?
11. Do you experience any recurring pain?
12. Are you up to date on vaccinations?
13. Do you have any drug allergies?
14. What is your dominant hand?
15. How would you rate your hearing?
```

No question requires a specific answer. Every question allows uncertainty. The system does not judge. It records.

---

## DETECTION

The system does not ask you to categorize your own answers. It reads the question text and decides:

```
28 KEYWORDS — SERVER-SIDE SCAN

blood type · allergy · allergies · allergic · medication · medications
supplement · supplements · chronic · prescription · vision · eyesight
glasses · contacts · checkup · heart rate · blood pressure · dental
skin type · vaccination · vaccine · drug allergy · hearing
dominant hand · health condition · recurring pain · resting heart · bpm
```

If any keyword is present in the question → event logged as `medical_record`.
Otherwise → event logged as `answer`.

No ambiguity. No user burden. No toggles.

---

## YOUR LOG

Medical records appear in your Log with distinct labels:

```
MED:  What is your blood type?
REC:  O+
```

Regular memory entries remain unchanged:

```
MEM:  What's your go-to morning beverage?
OUT:  Coffee
```

The distinction is visual and structural. Your medical history is not mixed into your lifestyle preferences. It stands apart. It is a record.

---

## AI INTEGRATION

The AI prompt builder includes medical topics in its question generation. When the system generates a new question, it may choose to ask about your health — the same way it asks about your morning routine or your sleep.

Medical answers feed back into your Memory Story. The AI knows your blood type the same way it knows you prefer tea in the morning. This means:

- Follow-up questions can reference your medical answers
- The system builds a complete picture — body and mind
- No medical data is siloed away from your narrative

Your story includes your body. As it should.

---

## WHAT WE DON'T DO

- We don't diagnose
- We don't prescribe
- We don't share your medical data with anyone
- We don't connect to health APIs, insurance systems, or hospital portals
- We don't sell your data
- We don't aggregate medical data across users
- We don't require you to answer anything

Your medical record lives in the same database as your other answers, protected by the same infrastructure, visible only to you.

---

## FILE MAP

```
constants.ts ──── 15 backup medical questions
                   28 detection keywords

question-generator.ts ──── medical topic in AI prompt
                            medical topic diversity tracking
                            medical_record in log formatting
                            merged backup rotation (29 self-care + 15 medical)

api.ts ──── keyword detection at /memory/answer endpoint
             medical_record event creation

Logs.tsx ──── MED: / REC: rendering
```

---

## THE STANDARD

LOT does not hide how it works. Every keyword is listed above. Every question is printed in full. The detection logic is a string match — no ML, no black box, no probability threshold.

If you read this document, you know exactly what the system does with your medical information. That is the standard. That is LOT.

---

```
LOT SYSTEMS CORPORATION
Medical Records — Field Specification
v1.3.0 · 28 May 2026
Made in the USA
```
