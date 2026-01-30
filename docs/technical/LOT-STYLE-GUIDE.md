# LOT Design System & Style Guide

**Version**: 1.0 (January 2026)
**Status**: Stable Reference
**Last Updated**: January 2026

This document defines the LOT (Library of Time) design philosophy, visual language, interaction patterns, and technical conventions established through iterative development and real-world usage.

---

## 🎨 Visual Design Language

### Typography
- **Primary Font**: System default (Arial-based monospace aesthetic)
- **Font Sizes**:
  - Default: System base (16px equivalent)
  - Small: `text-[14px]` (only for secondary metadata)
  - Large: `text-[20px]` (for metrics and stats)
- **Line Height**: System default for readability
- **Font Weight**: Regular weight throughout (no bold unless system-defined)

### Opacity Hierarchy
- **Primary content**: `opacity-90` (main text, actions, questions)
- **Secondary content**: `opacity-60` (metadata, timestamps, helper text)
- **Tertiary content**: `opacity-40` (placeholders, disabled states)
- **Interactive elements**: Full opacity on hover/active
- **Full visibility**: No opacity when clarity is critical (e.g., questions, CTAs)

### Spacing System
- **Standard spacing**: `mb-16` (primary gap between elements)
- **Condensed spacing**: `mb-12` (when elements stack naturally)
- **Inline spacing**: `gap-8` (between buttons, chips, inline elements)
- **Section spacing**: `gap-y-24` (between major sections)

### Color Philosophy
- **Minimalist approach**: No decorative colors
- **User-defined themes**: Custom theme support via stores
- **System colors only**: Leverage platform defaults
- **No emojis**: Unless explicitly requested by user
- **Periods over symbols**: "Done." instead of "Done ✓"

---

## 🔄 Interaction Patterns

### Clickable Label Cycling
**Core Pattern**: Click widget label to cycle through views

```tsx
const [view, setView] = useState<ViewType>('default')

const cycleView = () => {
  setView(prev => {
    switch (prev) {
      case 'view1': return 'view2'
      case 'view2': return 'view3'
      case 'view3': return 'view1'
      default: return 'view1'
    }
  })
}

<Block label="Widget:" blockView onLabelClick={cycleView}>
  {/* Content based on view */}
</Block>
```

**Examples**:
- Mood: `Mood:` → `History:` → `Patterns:`
- Self-care: `Self-care:` → `Why This:` → `Practice:`
- Memory: `Memory:` → `Reflection:` → `Insights:`

### Fade-Out Animations
**Pattern**: Show completion state, then gracefully exit

```tsx
const [isFading, setIsFading] = useState(false)
const [isVisible, setIsVisible] = useState(true)

// Trigger on completion
setTimeout(() => setIsFading(true), 3000)      // Start fade
setTimeout(() => setIsVisible(false), 4400)    // Hide (3000 + 1400)

<div className={cn(
  'transition-opacity duration-[1400ms]',
  isFading ? 'opacity-0' : 'opacity-100'
)}>
  {/* Content */}
</div>
```

**Timing**: 3s visible + 1.4s fade = 4.4s total

### Button Groups
**Standard Layout**:
```tsx
<div className="flex gap-8">
  <Button onClick={primaryAction}>Primary</Button>
  <Button onClick={secondaryAction}>Secondary</Button>
  <Button onClick={tertiaryAction}>Tertiary</Button>
</div>
```

**Rules**:
- Equal transparency (no `opacity-60` on individual buttons)
- 2-3 buttons maximum per group
- Action verbs: "Start", "Done", "Skip", "Stop"
- No icons, text only

---

## 🧠 Context-Aware Widget Philosophy

### Smart Timing
Widgets appear based on multiple contextual factors:

**Time-based**:
```tsx
const hour = new Date().getHours()
const isMorning = hour >= 6 && hour < 12
const isEvening = hour >= 17 && hour < 22
const isMidDay = hour >= 12 && hour < 17
```

**Cooldown Periods**:
- Mood widget: 3 hours minimum
- Self-care: Daily completion tracking
- Subscribe: 10 days after click
- Memory: Context-dependent (varied)

**Cross-Device Sync**:
```tsx
// ❌ Don't use localStorage for cooldowns
const lastTime = localStorage.getItem('last-action')

// ✅ Use database logs
const lastAction = logs.filter(log => log.event === 'action')[0]
const cooldownPassed = !lastAction ||
  (Date.now() - new Date(lastAction.createdAt).getTime()) >= cooldownMs
```

### Conditional Rendering
**IIFE Pattern** for inline conditional logic:

```tsx
{(() => {
  const hour = new Date().getHours()
  const isMorning = hour >= 6 && hour < 12

  const lastCheckIn = logs.filter(log => log.event === 'emotional_checkin')[0]
  const threeHoursPassed = !lastCheckIn ||
    (Date.now() - new Date(lastCheckIn.createdAt).getTime()) >= (3 * 60 * 60 * 1000)

  if (!threeHoursPassed) return null

  return isMorning && <MoodWidget />
})()}
```

### Multi-Factor Context
Widgets adapt based on:
1. **Time of day**: Morning, afternoon, evening
2. **Weather**: Rain, sun, temperature
3. **Mood history**: Recent emotional check-ins
4. **User archetype**: Seeker, Nurturer, Creator
5. **Engagement level**: Answer count, journal entries
6. **Subscription status**: Tags for Usership/R&D

---

## 💬 Content & Tone Guidelines

### Voice Principles
- **Concise**: Short, direct sentences
- **Objective**: Technical accuracy over validation
- **Non-pushy**: Suggestions, not commands
- **Respectful**: Assumes user agency
- **No superlatives**: Avoid "amazing", "incredible", etc.

### Grammar Patterns

**Questions**:
```
✅ How is your morning?
❌ How are you morning?

✅ How is your evening?
❌ How are you this evening?
```

**Completion Messages**:
```
✅ Well done.
✅ Complete.
✅ Done.
✅ Finished.

❌ Well done ✓
❌ Awesome! 🎉
❌ You're amazing!
```

**Action Labels**:
```
✅ Step outside and get sunlight (5 mins)
❌ Step outside for 5 minutes of sunlight

✅ Reflective inquiry practice (5 mins)
❌ Spend 5 minutes in reflective inquiry
```

**Format**: `[Action verb] [object] ([duration])`

### Duration Format
- Consistent abbreviations: "min" or "mins"
- Always in parentheses after action
- Examples: `(1 min)`, `(2 mins)`, `(5 mins)`, `(10 mins)`

---

## 🏗️ Technical Architecture

### State Management

**Local Component State** (React hooks):
```tsx
const [view, setView] = useState<ViewType>('default')
const [isVisible, setIsVisible] = useState(true)
const [isFading, setIsFading] = useState(false)
```

**Global Reactive State** (Nanostores):
```tsx
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'

const weather = useStore(stores.weather)
const me = useStore(stores.me)
```

**Server State** (React Query):
```tsx
const { data: profile } = useProfile()
const { data: logs = [] } = useLogs()
const { mutate: createLog } = useCreateLog()
```

### Data Persistence

**Client-side** (localStorage):
- Use ONLY for UI preferences
- Examples: Daily completion counts, widget dismissals
- Always check date/timestamp for staleness

**Server-side** (Database):
- Use for ALL cross-device data
- Examples: Logs, check-ins, profile data
- Enables sync across PWA and Desktop

### Logging Pattern

**Auto-logging** for user actions:
```tsx
const { mutate: createLog } = useCreateLog()

// On completion
createLog({
  text: `Self-care completed: ${action}`,
  event: 'self_care_completed',
  metadata: { action, duration }
})

// On skip
createLog({
  text: `Self-care skipped: ${action}`,
  event: 'self_care_skipped'
})
```

**Log entry format**:
```tsx
{
  text: "Human-readable description",
  event: 'event_type',
  metadata: {
    // Structured data for filtering/analysis
  }
}
```

---

## 📐 Component Architecture

### Widget Structure Template

```tsx
import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useProfile, useCreateLog } from '#client/queries'

type WidgetView = 'view1' | 'view2' | 'view3'

export function WidgetName() {
  const [view, setView] = React.useState<WidgetView>('view1')
  const [isVisible, setIsVisible] = React.useState(true)
  const [isFading, setIsFading] = React.useState(false)

  const { data: profile } = useProfile()
  const { mutate: createLog } = useCreateLog()

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'view1': return 'view2'
        case 'view2': return 'view3'
        case 'view3': return 'view1'
        default: return 'view1'
      }
    })
  }

  const handleAction = () => {
    createLog({ text: 'Action completed' })

    setTimeout(() => setIsFading(true), 3000)
    setTimeout(() => setIsVisible(false), 4400)
  }

  if (!isVisible) return null

  const label = view === 'view1' ? 'Label 1:' : 'Label 2:'

  return (
    <div className={cn(
      'transition-opacity duration-[1400ms]',
      isFading ? 'opacity-0' : 'opacity-100'
    )}>
      <Block label={label} blockView onLabelClick={cycleView}>
        <div className="inline-block">
          {/* Content based on view */}
        </div>
      </Block>
    </div>
  )
}
```

### CSS Animation Conventions

**Blink/Breathe Effect**:
```css
@keyframes blink {
  0% { opacity: 0.35; }
  50% { opacity: 0.75; }
  100% { opacity: 0.35; }
}

.animate-blink {
  animation: blink 2s cubic-bezier(0.4, 0, 0.6, 1);
  animation-iteration-count: 2;
  animation-fill-mode: forwards;
}
```

**Fade-Out**:
```tsx
className="transition-opacity duration-[1400ms]"
```

---

## 🎯 Widget Design Checklist

When creating a new widget, ensure:

### Structure
- [ ] Uses `Block` component with `blockView` prop
- [ ] Implements clickable label cycling (2-3 views minimum)
- [ ] Has proper TypeScript types for view states
- [ ] Wraps content in `inline-block` for proper layout

### Behavior
- [ ] Auto-logs significant user actions
- [ ] Uses database logs for cross-device state (not localStorage)
- [ ] Implements cooldown logic if shown multiple times
- [ ] Fades out gracefully after completion (3s + 1.4s)
- [ ] Conditional rendering based on context (time, mood, etc.)

### Style
- [ ] Primary text: `opacity-90`
- [ ] Secondary text: `opacity-60`
- [ ] Spacing: `mb-16` for main elements, `mb-12` for stacked
- [ ] Buttons: `gap-8`, no individual opacity overrides
- [ ] No emojis or decorative symbols
- [ ] Periods instead of checkmarks in completion messages

### Content
- [ ] Concise, direct language
- [ ] Action verbs for buttons
- [ ] Duration format: `([X] min[s])`
- [ ] Grammar: Context-appropriate questions
- [ ] No superlatives or excessive validation

---

## 📊 Metrics & Growth Philosophy

### Long-term Tracking
LOT favors **gradual, meaningful progression** over quick wins:

**Awareness Index**:
- Scale: 0-10% (displayed with one decimal: 2.3%)
- Backend calculation: 0-100 points, divided by 10 for display
- Four components: Volume (40), Quality (30), Consistency (15), Depth (15)
- Growth rate: Months to years for significant increases

**Display Pattern**:
```tsx
const awarenessPercentage = (profile.selfAwarenessLevel / 10).toFixed(1)
// Example: 23 → "2.3%"
```

### Completion Tracking
- **Daily limits**: Prevent burnout (e.g., self-care widget)
- **Streaks**: Not emphasized (reduces pressure)
- **Milestones**: Subtle, every 20 answers
- **No gamification**: No points, badges, or leaderboards

---

## 🔐 Privacy & Data Patterns

### Client-side Only
- Theme preferences
- UI state (collapsed sections, etc.)
- Temporary dismissals (same session)

### Server-side (Encrypted)
- All user content (answers, notes, check-ins)
- Psychological profile data
- Log entries with metadata
- Subscription/tag information

### Never Stored
- Passwords in plain text
- Third-party tokens (beyond session)
- Raw API keys in frontend code

---

## 🚀 Performance Patterns

### React Query Caching
```tsx
const { data: profile } = useProfile()  // Auto-cached
const { data: logs = [] } = useLogs()   // Defaults to empty array

// Manual invalidation when needed
const queryClient = useQueryClient()
queryClient.invalidateQueries(['/api/chat-messages'])
```

### Conditional Rendering Optimization
```tsx
// ✅ Early return for visibility
if (!isVisible) return null

// ✅ Memoize expensive calculations
const contextData = useMemo(() =>
  calculateContext(weather, mood, archetype),
  [weather, mood, archetype]
)

// ❌ Avoid re-renders from inline objects
onClick={() => { /* inline function */ }}  // Creates new function each render
```

### Lazy Loading
- Load widgets only when needed
- Defer heavy calculations to useMemo/useCallback
- Split code with dynamic imports for rarely-used features

---

## 🎨 Example: Complete Widget

**Minimal Self-care Widget** (abbreviated):

```tsx
/**
 * Self-care Moments Widget - Context-aware recommendations
 * Pattern: Suggestion → Why This → Practice
 */
export function SelfCareMoments() {
  const [view, setView] = useState<CareView>('suggestion')
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  const { data: profile } = useProfile()
  const { mutate: createLog } = useCreateLog()

  const cycleView = () => {
    setView(prev => prev === 'suggestion' ? 'why' :
                   prev === 'why' ? 'practice' : 'suggestion')
  }

  const markAsDone = () => {
    createLog({ text: `Self-care completed: ${action}` })

    setTimeout(() => setIsFading(true), 3000)
    setTimeout(() => setIsVisible(false), 4400)
  }

  if (!isVisible) return null

  const label = view === 'suggestion' ? 'Self-care:' :
                view === 'why' ? 'Why This:' : 'Practice:'

  return (
    <div className={cn(
      'transition-opacity duration-[1400ms]',
      isFading ? 'opacity-0' : 'opacity-100'
    )}>
      <Block label={label} blockView onLabelClick={cycleView}>
        {view === 'suggestion' && (
          <div className="inline-block w-full">
            <div className="opacity-90 mb-16">
              {suggestion.action} ({suggestion.duration})
            </div>
            <div className="flex gap-8">
              <Button onClick={markAsDone}>Done</Button>
              <Button onClick={refresh}>Skip</Button>
            </div>
          </div>
        )}
      </Block>
    </div>
  )
}
```

---

## 📝 Commit Message Style

### Format
```
[Action] [Component/Area]: [Brief description]

- Detailed change 1
- Detailed change 2
- Impact on user experience
```

### Examples
```
Fix Mood widget grammar, opacity, and cross-device sync

- Fix grammar: 'How is your morning?' instead of 'How are you morning?'
- Remove opacity-90 for full visibility in Mood questions
- Sync Mood widget across devices using database logs instead of localStorage
```

```
Rename Self-Care to Self-care for consistency

- Update all widget labels, comments, and documentation
- Consistent capitalization across codebase
```

---

## 🎯 Design Principles Summary

1. **Minimalist First**: Less is more. Remove before adding.
2. **Context Over Notifications**: Smart timing beats aggressive prompting.
3. **Database Over localStorage**: Cross-device sync is non-negotiable.
4. **Graceful Degradation**: Fade out, don't snap away.
5. **User Agency**: Suggest, don't command.
6. **Long-term Growth**: Months and years, not days and weeks.
7. **Technical Accuracy**: Truth over validation.
8. **Consistent Voice**: Direct, concise, respectful.

---

**This style guide is a living document. Update as new patterns emerge through real-world usage.**

---

**Version History**:
- **1.0** (January 2026): Initial stable release based on context-aware widgets implementation
