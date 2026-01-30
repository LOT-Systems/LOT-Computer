# Comprehensive Memory Engine Testing Plan

## System Overview

**Components to Test:**
1. Memory Widget (questions, answers, error handling)
2. Quantum Intent Engine (signal recording, pattern recognition)
3. Badge System (Aquatic Evolution)
4. Memory API (question generation, quantum state integration)
5. Widget Integration (Planner, Mood, Intentions, etc.)

---

## Test 1: Memory Widget Core Functionality

### What to Test:
- [ ] Question loading and display
- [ ] Answer submission
- [ ] Response display and auto-hide
- [ ] Badge unlock notifications
- [ ] Error state and retry button
- [ ] Quantum state integration
- [ ] Reflection prompt display
- [ ] Cache management

### Tests to Run:

**1.1 Question Display**
- File: `src/client/components/MemoryWidget.tsx`
- Check: Question loads, displays reflection prompt, shows options
- Expected: Smooth fade-in, correct quantum-aware prompt

**1.2 Answer Submission**
- File: `src/client/components/MemoryWidget.tsx:79-103`
- Check: Clicking option saves answer, records signal
- Expected: Answer saves, response shows, auto-hides after 5-7s

**1.3 Badge Unlock Notification**
- File: `src/client/components/MemoryWidget.tsx:122-144`
- Check: Badge unlocks show before questions
- Expected: "First drops form. ∘" displays, auto-hides after 5s

**1.4 Error Handling**
- File: `src/client/components/MemoryWidget.tsx:239-283`
- Check: Error state shows, retry clears cache
- Expected: "Memory temporarily unavailable" + "Try again" button

**1.5 Quantum State**
- File: `src/client/components/MemoryWidget.tsx:172-187`
- Check: getUserState() called, safe fallback
- Expected: No crashes if quantum state fails

### Issues Found:
- [ ] None yet

---

## Test 2: Quantum Intent Engine

### What to Test:
- [ ] Signal recording from all widgets
- [ ] Pattern recognition (7 patterns)
- [ ] User state calculation
- [ ] localStorage persistence
- [ ] Analysis cooldown (5 min)

### Tests to Run:

**2.1 Signal Recording**
- Files to check:
  - `src/client/components/PlannerWidget.tsx` (line 45)
  - `src/client/components/MemoryWidget.tsx` (line 85)
  - `src/client/stores/intentionEngine.ts:87-119`
- Check: Signals recorded from Planner, Memory
- Expected: Signals saved to localStorage, limited to 7 days

**2.2 Pattern Recognition**
- File: `src/client/stores/intentionEngine.ts:124-261`
- Patterns to verify:
  1. anxiety-pattern (2+ anxious moods)
  2. lack-of-structure (tired + no planning)
  3. seeking-direction (no intention for 7 days)
  4. flow-potential (energized + planning)
  5. evening-overwhelm (evening + overwhelmed)
  6. surface-awareness (3+ moods, no journal)
  7. morning-clarity (morning + calm)
- Expected: Patterns detected correctly, confidence scores accurate

**2.3 User State Calculation**
- File: `src/client/stores/intentionEngine.ts:266-326`
- Check: Energy, clarity, alignment, needsSupport calculated
- Expected: States derived from recent signals (24h window)

**2.4 Memory API Integration**
- File: `src/server/routes/api.ts:1591-1596`
- Check: Quantum state passed as query params (qe, qc, qa, qn)
- Expected: buildPrompt receives quantum state

**2.5 Prompt Context**
- File: `src/server/utils/memory.ts:224-250`
- Check: Quantum state influences question generation
- Expected: Different prompts for depleted vs high energy

### Issues Found:
- [ ] None yet

---

## Test 3: Badge System (Aquatic Evolution)

### What to Test:
- [ ] Badge calculation (streak-based)
- [ ] Badge awarding logic
- [ ] Level symbol display in profile
- [ ] Unlock notifications in Memory widget
- [ ] localStorage persistence

### Tests to Run:

**3.1 Streak Calculation**
- File: `src/server/routes/api.ts:2172-2195`
- Check: Consecutive days counted correctly
- Expected: Streak resets if day missed, allows yesterday

**3.2 Badge Awarding**
- File: `src/client/utils/badges.ts:197-223`
- Check: Badges awarded at 7, 30, 100 days
- Expected: Only milestone badges checked, no duplicates

**3.3 Level Symbol**
- File: `src/client/utils/badges.ts:171-176`
- Check: getLevelSymbol(streak) returns ∘ ≈ ≋
- Expected: Correct symbol for each tier

**3.4 Profile Display**
- File: `src/client/components/PublicProfile.tsx:355-361`
- Check: Level field shows if streak >= 7
- Expected: "Level: ∘" displays correctly

**3.5 Trait Capitalization**
- File: `src/client/utils/badges.ts:188-191`
- Check: joinWithDots capitalizes each word
- Expected: "mindful" → "Mindful", joined with " · "

**3.6 Public API**
- File: `src/server/routes/public-api.ts:786-822`
- Check: Streak calculated and included in response
- Expected: psychologicalProfile.streak present

### Issues Found:
- [ ] None yet

---

## Test 4: Memory API Question Generation

### What to Test:
- [ ] Default questions (non-Usership)
- [ ] AI questions (Usership)
- [ ] Quantum state context
- [ ] Intelligent pacing
- [ ] Cooldown (2 questions/day max)
- [ ] Emergency fallback

### Tests to Run:

**4.1 Pacing Logic**
- File: `src/server/routes/api.ts:1430-1446`
- Check: calculateIntelligentPacing called
- Expected: promptQuotaToday and shouldShowPrompt calculated

**4.2 Cooldown Check**
- File: `src/server/routes/api.ts:1472-1490`
- Check: Max 1 question per period (morning/evening)
- Expected: Returns null if already answered in period

**4.3 Default Questions**
- File: `src/server/routes/api.ts:1630-1700`
- Check: Untouched questions selected, seeded randomization
- Expected: Different question each time, repeats after all used

**4.4 AI Question Generation**
- File: `src/server/routes/api.ts:1576-1625`
- Check: buildPrompt called with quantum state
- Expected: Context-aware questions for Usership users

**4.5 Emergency Fallback**
- File: `src/server/routes/api.ts:1702-1722`
- Check: Returns fallback question instead of 500 error
- Expected: "What matters most to you today?" on error

### Issues Found:
- [ ] None yet

---

## Test 5: Widget Integration

### What to Test:
- [ ] Planner → Intent Engine signals
- [ ] Memory → Intent Engine signals
- [ ] Badge check triggers
- [ ] Cache invalidation

### Tests to Run:

**5.1 Planner Signal Recording**
- File: `src/client/components/PlannerWidget.tsx:43-52`
- Check: recordSignal called on plan_set
- Expected: Signal includes intent, today, how, feeling values

**5.2 Memory Signal Recording**
- File: `src/client/components/MemoryWidget.tsx:84-93`
- Check: recordSignal called on answer
- Expected: Signal includes questionId, option, question, hour

**5.3 Badge Check Timing**
- File: `src/client/components/MemoryWidget.tsx:106-108`
- Check: checkAndAwardBadges called on mount
- Expected: API called, new badges detected

**5.4 Cache Management**
- File: `src/client/queries.ts:173-185`
- Check: staleTime: Infinity, cacheTime: 24h, retry: false
- Expected: Question cached for day, no auto-retries

### Issues Found:
- [ ] None yet

---

## Test 6: Error Handling & Edge Cases

### What to Test:
- [ ] Network errors
- [ ] API timeouts
- [ ] Invalid quantum state
- [ ] Missing user data
- [ ] Concurrent requests

### Tests to Run:

**6.1 Network Failure**
- Check: What happens if /api/memory fails?
- Expected: Error state shows, retry button works

**6.2 Invalid Quantum State**
- File: `src/client/queries.ts:152-165`
- Check: Try-catch around quantum state import
- Expected: Graceful degradation, "Quantum state unavailable" warning

**6.3 Missing Streak Data**
- File: `src/client/components/PublicProfile.tsx:356`
- Check: Level field only shows if streak >= 7
- Expected: No error if streak undefined, field hidden

**6.4 Badge Queue Issues**
- File: `src/client/utils/badges.ts:153-165`
- Check: getNextBadgeUnlock handles empty queue
- Expected: Returns null, no crash

**6.5 localStorage Errors**
- Files: badges.ts, intentionEngine.ts
- Check: Try-catch around localStorage operations
- Expected: No crashes in private browsing/quota exceeded

### Issues Found:
- [ ] None yet

---

## Test 7: Performance & Optimization

### What to Test:
- [ ] Signal retention (7 days)
- [ ] Analysis cooldown (5 min)
- [ ] Cache efficiency
- [ ] Query deduplication

### Tests to Run:

**7.1 Signal Cleanup**
- File: `src/client/stores/intentionEngine.ts:68-77`
- Check: Old signals (>7 days) removed on load
- Expected: localStorage doesn't grow indefinitely

**7.2 Analysis Cooldown**
- File: `src/client/stores/intentionEngine.ts:129-131`
- Check: analyzeIntentions skips if < 5 min since last
- Expected: Reduces CPU usage, returns cached patterns

**7.3 Query Caching**
- File: `src/client/queries.ts:146-186`
- Check: React Query caches with proper keys
- Expected: No duplicate API calls for same date

### Issues Found:
- [ ] None yet

---

## Critical Issues to Fix

### Priority 1: Must Fix Before Deploy
- [ ] TBD after testing

### Priority 2: Should Fix Soon
- [ ] TBD after testing

### Priority 3: Nice to Have
- [ ] TBD after testing

---

## Testing Checklist

### Manual Testing
- [ ] Answer 3 Memory questions in a row
- [ ] Trigger badge unlock (simulate 7-day streak)
- [ ] Test error state + retry button
- [ ] Check quantum state in different moods
- [ ] View Public Profile with Level field

### Code Review
- [ ] All try-catch blocks present
- [ ] localStorage access wrapped
- [ ] TypeScript types correct
- [ ] No console.errors in production paths

### Integration Testing
- [ ] Memory Widget → Intent Engine → Badge System flow
- [ ] Planner → Intent Engine → Memory API flow
- [ ] Public Profile displays all data correctly

---

## Next Steps

1. Execute each test systematically
2. Document issues found
3. Prioritize fixes
4. Implement fixes
5. Retest
6. Sign off on bulletproofing

**Status:** Ready to begin testing
