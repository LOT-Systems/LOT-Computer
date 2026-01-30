# Interface Evolution System

## Overview

The LOT Interface Evolution System creates a **subtle, progressive refinement** of the user interface based on spiritual, psychological, and behavioral achievements. As users deepen their practice, the interface evolves to match their maturity level, unlocking features and refining aesthetics in response to their journey.

## Philosophy

The system honors the principle that **form follows progression**. Rather than overwhelming new users with features, the interface starts minimal and grows more sophisticated as users demonstrate readiness through:

- **Exploration** - Taking first steps (emotional check-ins, memory questions, community engagement)
- **Consistency** - Building behavioral stamina through streaks and regular practice
- **Depth** - Accumulating knowledge and self-understanding
- **Connection** - Engaging with community and others
- **Intimacy** - Vulnerability in romantic/intimate reflections
- **Care** - Self-compassion practices
- **Courage** - Truth-telling and honesty

## Architecture

### Core Components

1. **Evolution State Calculator** (`src/client/utils/interfaceEvolution.ts`)
   - Calculates 7-dimensional progression metrics (0-1 normalized)
   - Derives overall maturity, visual refinement, feature unlock level
   - Maps badge tier and theme to aesthetic preferences

2. **Evolution Store** (`src/client/stores/evolution.ts`)
   - Reactive nanostores for evolution state
   - Computed stores for visual effects and feature unlocks
   - Applies CSS custom properties dynamically

3. **Evolution Sync Hook** (`src/client/hooks/useEvolutionSync.ts`)
   - Syncs evolution state with narrative achievements
   - Detects milestones and stores for notification
   - Updates on achievement unlocks, level progression, badge tier changes

4. **Theme Evolution** (`src/client/utils/themeEvolution.ts`)
   - Badge-specific aesthetics (Water vs Architecture metaphors)
   - Water: Fluid, organic, flowing patterns and animations
   - Architecture: Geometric, structured, precise layouts

### Visual Effects

The system controls subtle visual parameters:

- **Opacity** - Base and accent opacity increases with refinement (0.85 → 1.0)
- **Grid patterns** - Grid size and opacity evolve with theme complexity
- **Typography** - Letter-spacing and line-height refine over time
- **Animations** - Speed and intensity adapt to user's evolution
- **Glow effects** - Subtle text glow appears at high achievement levels
- **Background patterns** - Theme-specific patterns emerge at badge milestones

### Feature Unlocks

Features gate based on achievement categories:

**Widgets:**
- Advanced Memory → Unlocks at Depth: Deep Diver achievement
- Planner Templates → Unlocks at Consistency: Week Warrior+
- Rich Community → Unlocks at Connection: Bridge Builder
- Mood Patterns → Unlocks at Care 50% or Level 20
- Intention History → Unlocks at Level 15

**Customization:**
- Custom Themes → Level 5
- Badge Selection → Any badge earned
- Widget Arrange → Level 10
- Export Data → Level 25

**Advanced:**
- Narrative Reflection → Depth 66% + Level 30
- Pattern Insights → Consistency 66% (Moon Cycle+)
- Social Mentions → Connection 100% (full connection path)
- Private Spaces → Intimacy 50% or Courage 100%

## Badge Theme Aesthetics

### Water Theme (∘ → ≈ → ≋)

**Droplet → Wave → Current**

Visual characteristics:
- More fluid animations (higher flow intensity)
- Organic curves (higher border radius)
- Radial gradient backgrounds
- Softer edges
- Wave-based animations

Philosophy: Emphasizes organic flow, adaptability, and natural progression.

### Architecture Theme (├─ → ╞═╡ → ║·║)

**Foundation → Structure → Architecture**

Visual characteristics:
- Geometric precision (stricter grid alignment)
- Structural depth (layering, elevation)
- Linear gradient backgrounds
- Sharper edges
- Structured pulse animations

Philosophy: Emphasizes intentional building, stability, and deliberate construction.

## CSS Custom Properties

The system injects these CSS variables dynamically:

```css
/* Evolution variables */
--evolution-base-opacity: 0.85-1.0;
--evolution-accent-opacity: 0.7-1.0;
--evolution-grid-opacity: 0.15-0.5;
--evolution-letter-spacing: -0.02em to 0.01em;
--evolution-line-height: 1.4-1.6;
--evolution-grid-size: 4-6px;
--evolution-glow-intensity: 0-0.3;
--evolution-transition-speed: 150-400ms;

/* Theme variables */
--theme-flow-intensity: 0-1;
--theme-organic-curve: 0-8px;
--theme-wave-frequency: 2-6s;
--theme-geometric-precision: 0-1;
--theme-structural-depth: 0-4px;
--theme-pattern-scale: 0.5-2;
--evolution-background-pattern: gradient/pattern;
```

## Using Evolution State in Components

### Reading Evolution State

```tsx
import { useStore } from '@nanostores/react';
import { $evolutionState, $featureUnlocks } from '#client/stores/evolution';

function MyComponent() {
  const evolutionState = useStore($evolutionState);
  const featureUnlocks = useStore($featureUnlocks);

  if (!evolutionState) return null;

  return (
    <div>
      <p>Overall Maturity: {Math.round(evolutionState.overallMaturity * 100)}%</p>
      {featureUnlocks.advancedMemory && <AdvancedMemoryFeature />}
    </div>
  );
}
```

### Applying Evolution CSS Classes

```tsx
// Use evolved-text for adaptive typography
<div className="evolved-text">Text that refines over time</div>

// Use evolved-opacity for progressive clarity
<div className="evolved-opacity">Element that becomes clearer</div>

// Use evolved-glow for achievement polish
<div className="evolved-glow">Text with subtle glow at high levels</div>

// Use theme-evolved-border for badge-themed borders
<div className="theme-evolved-border">Theme-adaptive borders</div>

// Use water-flow-animate or structure-pulse-animate for theme animations
<div className={badgeTheme === 'water' ? 'water-flow-animate' : 'structure-pulse-animate'}>
  Animated based on badge theme
</div>
```

### Conditional Feature Rendering

```tsx
import { isFeatureUnlocked } from '#client/stores/evolution';

function ConditionalFeature() {
  if (!isFeatureUnlocked('advancedMemory')) {
    return <LockedMessage />;
  }

  return <AdvancedMemoryWidget />;
}
```

## Milestones and Notifications

The system tracks evolution milestones and displays subtle notifications when users cross thresholds:

- Badge tier advancements (Tier 1 → 2 → 3)
- Story chapter progressions (Awakening → Exploration → Integration → Mastery)
- Overall maturity milestones (25%, 50%, 75%, 95%)

Milestones are stored in `localStorage` as `evolution_milestones` (max 10 most recent) and displayed via `EvolutionMilestoneToast` component.

## Debugging

Access evolution debug tools in browser console:

```javascript
// Get current evolution state
window.__evolutionDebug.getState()

// Get visual effects
window.__evolutionDebug.getEffects()

// Get feature unlocks
window.__evolutionDebug.getUnlocks()

// Get evolution summary
window.__evolutionDebug.getSummary()
```

## Design Principles

1. **Subtlety First** - Changes should feel natural, not jarring
2. **Progressive Enhancement** - Start minimal, earn complexity
3. **User Agency** - Evolution respects user choices (theme, badge metaphor)
4. **Meaningful Gates** - Features unlock when users demonstrate readiness
5. **Aesthetic Coherence** - Visual changes align with spiritual/psychological state
6. **Performance** - All transitions are CSS-based and performant

## Future Extensions

Potential areas for expansion:

- **Seasonal Evolution** - Interface adapts to user's seasonal patterns
- **Emotional Palette** - Colors shift based on predominant emotional states
- **Rhythm-Based Effects** - Animation speeds sync with user's natural rhythm
- **Collaborative Evolution** - Team badges influence shared interface elements
- **Memory-Based Personalization** - Interface learns from memory question patterns

---

*The interface evolves with you, honoring your journey from first breath to mastery.*
