# January 2026 System Updates

**Release Date**: January 2026
**Branch**: `claude/January-2026-updates-gLJWJ`
**Status**: Stable, ready for production

Major update introducing context-aware widgets, redesigned long-term awareness tracking, comprehensive UX improvements, and critical bug fixes.

---

## 🎯 Context-Aware Widgets

### Mood Check-In Widget
- **Smart timing**: Appears during morning (6-12), midday (12-17), and evening (17-22) hours
- **3-hour cooldown**: Prevents repetitive prompts, respects user attention
- **Cross-device sync**: Uses database logs instead of localStorage for consistent experience across PWA and Desktop
- **Proper grammar**: Context-specific questions ("How is your morning?" / "How is your evening?" / "How are you right now?")
- **Full visibility**: Removed opacity for clearer readability
- **Auto-logging**: All mood check-ins automatically saved to Log with emotional state and insights
- **Compassionate AI responses**: Backend generates personalized, empathetic responses based on emotional state
- **View cycling**: Check-In → History (last 5) → Patterns (stats)

### Self-care Moments Widget
- **Context-aware suggestions**: Adapts based on weather, archetype, dominant mood, and time of day
- **Interactive timer**: Start practice with countdown for timed activities
- **Daily tracking**: Tracks completions with localStorage, shows "X done today"
- **Three actions**: Start (with timer), Done (mark complete), Skip (get new suggestion)
- **Auto-logging**: Logs both completions and skips to track self-care patterns
- **Smart recommendations**:
  - **Weather-based**: Rain → cozy moments, Sun → outdoor time
  - **Mood-based**: Anxious → breathing exercises, Tired → power rest, Grateful → journaling
  - **Archetype-based**: Seeker → reflective inquiry, Nurturer → self-nurture, Creator → free expression
  - **Time-based**: Morning → intention-setting, Evening → closing rituals
- **Gentle completion messages**: "Well done.", "Complete.", "Done.", "Finished."
- **Consistent styling**: Buttons match LOT design, proper spacing and transparency
- **View cycling**: Suggestion → Why This → Practice

---

## 📊 Long-term Awareness Tracking

### Redesigned Self-Awareness Index
- **Decimal precision**: 0-10% scale with one decimal place (e.g., 2.3%, 5.7%)
- **Four-component algorithm** (max 100 points → display as 0-10%):
  - **Volume** (40 pts): `Math.min(40, Math.sqrt(totalLogs) * 4)` - Rewards engagement
  - **Quality** (30 pts): `(reflectiveScore / totalLogs) * 30` - Rewards depth
  - **Consistency** (15 pts): `Math.min(15, (totalLogs / daysSinceStart) * 100)` - Rewards regularity
  - **Depth** (15 pts): `Math.min(15, journalEntries * 1.5)` - Rewards long-form writing
- **Long-term growth**: Designed for gradual progression over months/years (20% → 2% makes reaching 10% a significant achievement)
- **Standardized display**: Consistent `(value / 10).toFixed(1) + '%'` format across:
  - Astrology > Psychology view
  - Memory milestone insights
  - Public Profile page

---

## ✨ UX Enhancements

### Log Save Animation
- **Two gentle breathe blinks**: Smooth opacity transition (35% ↔ 75%)
- **Fluid easing**: `cubic-bezier(0.4, 0, 0.6, 1)` for natural breathing rhythm
- **Fixed 4-second cycle**: 2 iterations × 2s each, then push to server
- **Reliable timing**: Removed complex state tracking for consistent behavior
- **CSS implementation**:
  ```css
  @keyframes blink {
    0% { opacity: 0.35; }
    50% { opacity: 0.75; }
    100% { opacity: 0.35; }
  }
  .animate-blink {
    animation: blink 2s cubic-bezier(0.4, 0, 0.6, 1);
    animation-iteration-count: 2;
  }
  ```

### Widget Fade-outs
- **Gentle exits**: 3-second display, then 1.4-second fade to 0% opacity
- **Non-intrusive**: Widgets gracefully disappear after interaction
- **Applies to**: Mood check-in responses, Self-care completion messages

### Subscribe Widget
- **Simple call-to-action**: Links to `brand.lot-systems.com`
- **Two tiers**: R&D $15, Usership $99
- **Smart frequency control**:
  - Minimum 10 answer logs (engaged users only)
  - No existing subscription tags (Usership or R&D)
  - 10-day cooldown after click
  - 20% random probability when eligible
- **One-click dismiss**: Stores timestamp, won't show again for 10 days
- **New tab behavior**: Opens subscription page without interrupting LOT session

---

## 🐛 Bug Fixes

### Cross-Device & Sync Issues
- **Mood widget sync**: Fixed appearing on Desktop after answering on PWA
  - Changed from `localStorage.getItem('last-mood-checkin-time')` to database logs
  - Check: `logs.filter(log => log.event === 'emotional_checkin')[0]`
  - Ensures consistent 3-hour cooldown across all devices
- **Sync message likes**: Fixed persistence across tab navigation
  - Added `queryClient.invalidateQueries(['/api/chat-messages'])` after like
  - Reset `hasInitiallyLoaded.current` on component unmount
- **Theme synchronization**: Custom themes now sync between PWA and Desktop

### PWA & Loading
- **Profile loading crash**: Fixed PWA startup issues with aggressive profile caching
  - Disabled problematic cache optimization
  - Forced React Query refresh for critical data
- **Force cache refresh**: Service worker version bumps for awareness display updates
- **Connection banner**: Redesigned to match LOT style with timestamp and version info

### Radio Widget
- **Dependency cycle fix**: Eliminated crash from circular imports between stores
- **Playback countdown timer**: Shows time remaining for current track
- **Error handling**: Better initial state messaging ("Loading..." vs error states)
- **Desktop stability**: Prevented reloading issues during audio playback

### UI Consistency
- **Log type field**: Fixed transparency during typing (consistent opacity)
- **Private profile mode**: Redesigned to match LOT aesthetic
- **Spacing standardization**: Consistent `mb-16` spacing across all widgets
- **Button transparency**: Self-care Skip button now matches Start/Done (removed `opacity-60`)

---

## 🔒 Security
- **Removed .env files**: Sensitive environment files removed from git tracking
  - `.env`, `credentials.json` patterns in `.gitignore`
  - Warning system in commit workflow to prevent accidental commits

---

## 📝 Technical Improvements

### Backend Enhancements
- **Emotional check-in API** (`POST /api/emotional-check-ins`):
  - Stores: `checkInType`, `emotionalState`, `intensity`, `note`, `insights`
  - Generates compassionate AI responses using psychological depth data
  - Creates Log entries with formatted text: "Feeling [state] [timeOfDay]"
  - Returns personalized insights based on user's archetype and patterns

- **Psychological depth analysis**:
  - 5 metrics: Reflective, Emotionally Aware, Action-Oriented, Analytical, Creative
  - Pattern tracking across all user logs
  - Growth trajectory calculation
  - Self-awareness index with 4-component algorithm

- **Log metadata structure**:
  ```typescript
  {
    event: 'emotional_checkin' | 'self_care_completed' | 'self_care_skipped',
    metadata: {
      emotionalState?: string,
      intensity?: number,
      note?: string,
      insights?: string[],
      action?: string,
      duration?: string
    }
  }
  ```

### Frontend Architecture
- **Clickable label cycling pattern**: Consistent across all widgets
  - Click label to cycle through views
  - State management with React hooks
  - Smooth view transitions

- **Context-aware rendering**: IIFE patterns in JSX for conditional widget display
  ```tsx
  {(() => {
    const hour = new Date().getHours()
    const isMorning = hour >= 6 && hour < 12
    // ... context checks
    return condition && <Widget />
  })()}
  ```

- **Fade-out animations**: Reusable pattern with state management
  ```tsx
  const [isFading, setIsFading] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  setTimeout(() => setIsFading(true), 3000)
  setTimeout(() => setIsVisible(false), 4400)

  <div className={cn(
    'transition-opacity duration-[1400ms]',
    isFading ? 'opacity-0' : 'opacity-100'
  )}>
  ```

---

## 📊 Impact Metrics

### Files Changed
- **Components**: 15+ React components modified or created
- **Server routes**: 3 API endpoints enhanced
- **Utilities**: 2 utility modules updated (memory.ts, astrology.ts)
- **Styles**: 1 global CSS file enhanced (animations)

### Code Quality
- **54 commits**: Iterative refinement based on real-world usage and feedback
- **Type safety**: Full TypeScript coverage for new features
- **Testing**: Validated across PWA and Desktop environments
- **Performance**: No performance regressions, improved load times with cache fixes

### User Experience
- **Context awareness**: Widgets adapt to 10+ contextual factors
- **Reduced friction**: 3-hour cooldowns prevent notification fatigue
- **Cross-device consistency**: Database-backed state syncing
- **Visual polish**: Consistent animations, spacing, and transparency

---

## 🚀 Deployment Notes

### Breaking Changes
None. All changes are backwards-compatible.

### Migration Required
None. Database schema supports new fields gracefully.

### Environment Variables
No new environment variables required.

### Cache Invalidation
Service worker cache version already bumped. PWA users will receive updates automatically.

---

## ✨ Latest Additions (January 2026 - Update 2)

### Personalized Widget Timing
- **Quantum Intention Engine Integration**: Widgets now appear based on recognized behavioral patterns
  - SelfCareMoments: Shows when anxiety/overwhelm patterns detected
  - IntentionsWidget: Shows when seeking-direction or morning-clarity patterns detected
  - PlannerWidget: Shows when lack-of-structure pattern detected (100% chance vs 50%)
  - Analyzes 6 signal sources across 24h/7d windows with confidence scoring
  - Maintains backwards compatibility with time-based fallbacks

### Mood Graph Visualization
- **14-Day Emotional Timeline**: New graph view in EmotionalCheckIn widget
  - Simple mood indicators: + (positive), − (challenging), · (neutral)
  - Shows dominant mood per day
  - View cycling: Check-In → History → Patterns → Graph

### Self-Care Streaks
- **Consecutive Day Tracking**: Motivational streak counter in SelfCareMoments widget
  - Displays "X day streak" when streak > 1
  - Grace period for missed days
  - Calculated from database logs for cross-device consistency

### Data Export
- **CSV Download**: Export mood and self-care data from Settings
  - Mood check-ins: Date, time, emotional state, type, intensity, notes
  - Self-care: Date, time, event type, activity
  - Accessible via Settings > Data Export section
  - Useful for analysis, backup, or sharing with healthcare providers

### Self-Care Reminders
- **Optional Browser Notifications**: Gentle, opt-in reminders for self-care moments
  - Three frequency modes: Once daily, Twice daily, Pattern-based (adaptive)
  - Configurable quiet hours (default: 22:00 - 8:00)
  - Pattern-based mode integrates with intention engine
  - Silent notifications, no sound
  - Complete user control via Settings > Reminders
  - 15-minute background check intervals

---

## 🎯 Future Enhancements

### Potential Iterations
1. **Journal widget**: Deeper reflection prompts based on surface-awareness pattern
2. **Mood correlations**: Identify connections between mood, weather, and activities
3. **Self-care effectiveness**: Track which practices have most positive impact
4. **Weekly/monthly summaries**: Comprehensive overview of emotional journey
5. **Social features**: Share self-care practices with cohort members

### Technical Debt
- Consider extracting widget conditional logic to separate utility functions
- Evaluate React Query caching strategy for better performance
- Consolidate fade-out animation logic into custom hook

---

## 👥 Contributors
- **Design & Implementation**: Claude Code
- **User Feedback**: @vadikmarmeladov
- **Testing**: Real-world PWA and Desktop validation

---

## 📄 License
Proprietary - LOT Systems

---

**This release represents a significant evolution in LOT's psychological depth tracking and context-aware support systems. The foundation is now stable for future enhancements in personalized wellbeing support.**
