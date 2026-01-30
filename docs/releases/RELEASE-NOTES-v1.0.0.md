# LOT Systems v1.0.0 - December 2025 Release

## 🎉 Release Overview

This is a major release introducing the **Public Profile System**, **Astrology Widget**, and numerous UI/UX improvements. The release includes 96 commits with comprehensive features, bug fixes, and optimizations.

---

## 🌟 Major Features

### 1. Public Profile System

A complete public profile system allowing users to share their LOT System with the world while maintaining full privacy control.

**Key Features:**
- **Custom URLs**: Create memorable profile URLs like `lot-systems.com/u/vadik`
- **Privacy Controls**: Granular control over what information is displayed
  - Name (always visible)
  - Location (city and country)
  - Current date
  - Team tags with color coding
  - Local time in user's timezone
  - Real-time weather conditions
  - Ambient sound status
  - Memory story (optional)
- **Consistent Design**: Matches System tab typography and spacing exactly
- **PWA-Safe**: No interference with main app functionality
- **Clean Navigation**: Minimal footer with "LOT" return link

**Technical Implementation:**
- Custom URL lookup with collision-safe priority system
- Type-safe `PublicProfile` API with full TypeScript support
- Separate public profile entry point
- Cache-busting CSS versioning (`?v=20241210-001`)
- Block component consistency across app and profile

**Files Added/Modified:**
- `src/client/components/PublicProfile.tsx` - Main component
- `src/client/entries/public-profile.tsx` - Entry point
- `src/server/routes/public-api.ts` - API endpoint
- `src/shared/types/index.ts` - Type definitions
- `templates/generic-spa.ejs` - HTML template

---

### 2. Astrology Widget

A culturally rich astrology widget displaying Western zodiac, Japanese hourly zodiac, Rokuyo, and moon phase.

**Components:**

1. **Western Zodiac** - Current astrological sign based on date
   - 12 signs: Capricorn, Aquarius, Pisces, Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius
   - Accurate date range calculations

2. **Hourly Japanese Zodiac** - Traditional timekeeping system
   - 12 animals in 2-hour periods throughout the day
   - Rat (11 PM-1 AM), Ox (1-3 AM), Tiger (3-5 AM), Rabbit (5-7 AM), Dragon (7-9 AM), Snake (9-11 AM), Horse (11 AM-1 PM), Goat (1-3 PM), Monkey (3-5 PM), Rooster (5-7 PM), Dog (7-9 PM), Pig (9-11 PM)
   - Changes every 2 hours for dynamic context

3. **Rokuyo (六曜)** - Japanese six-day fortune cycle
   - Sensho (先勝) - Morning is better
   - Tomobiki (友引) - Good day (avoid funerals)
   - Senpu (先負) - Afternoon is better
   - Butsumetsu (仏滅) - Inauspicious day
   - Taian (大安) - Very auspicious day
   - Shakku (赤口) - Caution needed
   - Still used on modern Japanese calendars

4. **Moon Phase** - Accurate lunar cycle calculations
   - 8 phases: New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent
   - Based on 29.53-day lunar cycle
   - Includes illumination percentage

**Display Format:**
```
Astrology: Capricorn • Dragon • Taian • Waning Crescent
```

**Files Added:**
- `src/shared/utils/astrology.ts` - All astrology calculations
- Modified: `src/client/components/System.tsx` - Widget integration
- Modified: `src/shared/utils/index.ts` - Export astrology functions

---

### 3. UI/UX Improvements

**Typography:**
- Switched from Inter to Arial for consistency across all platforms
- Ensures uniform appearance on all devices and browsers

**Time Formatting:**
- Removed leading zeros from single-digit hours
- `4:06 PM PST` instead of `04:06 PM PST`
- More natural, readable format

**Log Autosave Animation:**
- Simplified from gentle + fast blink to fast blink only
- Reduced duration from 2.5s to 0.5s
- Keeps satisfying visual feedback before log push
- Timeline: Type → Wait 8s → Fast blink 0.5s → Wait 2s → Push

**Mobile Fixes:**
- Fixed Institute link arrow rendering as emoji on mobile
- Fixed Astrology widget text wrapping alignment
- Proper inline-block display for wrapped content
- Consistent left margin alignment

---

## 🔧 Technical Improvements

### Performance
- Optimized log autosave with 8-second debounce
- Memoized astrology calculations
- Reduced animation durations for snappier UX
- Eliminated unnecessary re-renders in Logs component

### Code Quality
- Full TypeScript type safety for public profiles
- Proper error handling and logging
- Separation of concerns (main app vs public profiles)
- Clean component architecture

### PWA & Caching
- Cache-busting CSS versioning
- Seamless switching between app and profiles
- No interference with installed PWA
- Proper service worker handling

### Accessibility
- Consistent Arial typography
- Proper text wrapping on mobile
- High contrast maintained
- Touch-friendly interface

---

## 📋 Complete Commit Log

### Public Profile System (18 commits)
- Fix custom URL lookup priority for public profiles
- Initialize theme CSS custom properties on page load
- Make all public profile text consistent Arial style
- Add cache-busting version to CSS to fix PWA caching issue
- Fix Institute link arrow rendering on mobile
- Restructure public profile layout with date and team tags
- Match public profile tags styling to System tab
- Match public profile spacing and margins to System tab
- Move navigation to footer with LOT link and return symbol
- Use HTML entity for return arrow to prevent emoji rendering
- Remove arrow from LOT button in footer
- Add comprehensive Public Profile System documentation for v1.0
- Plus 6 more commits for route handling and debugging

### Astrology Widget (5 commits)
- Add Astrology widget to System with Japanese zodiac and moon phase
- Add hourly zodiac and Rokuyo to Astrology widget
- Fix Astrology widget text wrapping alignment on mobile (2 commits)
- Use inline-block for Astrology widget to fix text wrapping

### Log System Improvements (40+ commits)
- Add autosave with visual feedback and timestamps
- Simplify log autosave blink animation to fast blink only
- Fix frozen Loading state issues
- Make blink animation more gentle with satisfying fast ending
- Fix log push happening while typing
- Fix app freeze when editing past logs
- Improve blink visibility
- Add 2-second delay and blink animation before log push
- Push down log entries immediately after save
- Fix numerous autosave edge cases
- Optimize performance and prevent data loss
- Save on tab switch and unmount
- Fix mobile keyboard Done button issues
- Eliminate unnecessary callback recreations

### Typography & Formatting (10+ commits)
- Switch site font from Inter to Arial
- Add Inter font to generic-spa template
- Format time without leading zero for single digit hours
- Match placeholder opacity to past logs
- Fix mobile tap/scroll causing entry deletion

### Settings & UI Polish (10+ commits)
- Enable Public Profile settings in UI
- Clean up settings UI: remove redundant toggle
- Fix mobile Post button
- Gray-out profile UI elements
- Match custom URL font style
- Remove autosave for primary log on specific platforms
- Optimize Settings component performance

---

## 🚀 Deployment Notes

### Database Changes
- No schema changes required
- Uses existing user metadata for custom URLs and privacy settings

### Environment Variables
- No new environment variables needed

### Build & Deploy
```bash
# Standard deployment process
yarn build
# Deploy to DigitalOcean App Platform
```

### Cache Invalidation
- CSS version bump: `?v=20241210-001`
- Users may need to refresh once for new styles

---

## ✅ Testing Checklist

- [x] Public profiles load with custom URLs
- [x] Public profiles load with UUID URLs
- [x] Privacy controls work correctly
- [x] PWA continues to work alongside public profiles
- [x] Cache-busting prevents style conflicts
- [x] Astrology widget displays all components
- [x] Hourly zodiac updates every 2 hours
- [x] Rokuyo cycles through 6-day period
- [x] Moon phase accurately calculated
- [x] Text wrapping works correctly on mobile
- [x] Log autosave animation works smoothly
- [x] Time format displays without leading zeros
- [x] Arial font loads correctly
- [x] Mobile navigation works properly
- [x] All arrows display as HTML entities (not emoji)

---

## 📚 Documentation Updates

- **README.md**: Added comprehensive Public Profile System section
  - Overview and key features
  - Technical implementation details
  - TypeScript type definitions
  - User experience examples
  - Privacy-by-default approach
  - Cache management strategy

---

## 🔒 Security & Privacy

- No sensitive data exposed in public profiles
- User controls all visibility settings
- Privacy-by-default approach
- No email addresses or authentication details shared
- Custom URLs are optional
- Users can delete profiles completely

---

## 🎯 Breaking Changes

**None** - This release is fully backward compatible.

All new features are additive and don't affect existing functionality.

---

## 📊 Metrics

- **Total Commits**: 96
- **Files Created**: 3
- **Files Modified**: 15+
- **Lines Added**: ~2,000
- **Lines Removed**: ~500
- **Components Added**: 2 (PublicProfile, Astrology)
- **Utilities Added**: 6 (astrology functions)

---

## 🙏 Acknowledgments

This release represents a comprehensive upgrade to LOT Systems with a focus on:
- User privacy and control
- Cultural richness (Japanese astrology systems)
- Mobile-first design
- Performance optimization
- Visual polish

Thank you for building LOT Systems! 🌱

---

**Release Date**: December 11, 2025
**Version**: 1.0.0
**Branch**: `claude/December_2025_upgrades-01Q6WkhzSXdikZWEaD9Zpwqg`
**Ready for**: Merge to master
