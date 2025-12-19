# December 2025 Upgrades: UI Fixes, Sound Module, Intelligent Pacing & More

## Summary

This PR includes comprehensive improvements across UI/UX, sound module functionality, Memory Story system, and intelligent pacing for prompts.

## Major Features

### 🎯 Intelligent Natural Pacing for Memory Prompts
- **Progressive onboarding**: Day 1 (3 prompts) → Day 2 (1 prompt) → Day 3 (2 prompts) → Day 4+ (variable)
- **Time-based scheduling**: Early morning (6-9am), lunch (12-2pm), evening (6-9pm) on weekdays
- **Weekend mode**: 4 light, easy prompts spread throughout the day (8am-10pm)
- **Organic feel**: 20% random skip chance to avoid mechanical patterns
- **Context-aware prompts**: Lighter, fun questions on weekends vs. deeper reflection on weekdays

### 🔊 Sound Module Fixes (PWA & Mobile)
- Fix CSP headers to allow Tone.js from cdnjs.cloudflare.com
- Service worker bypass for external CDN requests
- Prevent HTML caching to ensure fresh CSP headers
- Add crossOrigin='anonymous' for proper CORS handling
- Comprehensive error logging and debugging for mobile audio issues
- Audio context state verification

### 🎨 UI/UX Improvements

**Alignment & Spacing:**
- Fix Block toggle highlight alignment with negative left margins
- Fix MemoryWidget button alignment
- Fix humidity count alignment (only apply negative margin to interactive elements)
- Align likes counter with first line of comments (-mt-[2px])
- Fix Live widget value alignment

**Transparency & Visibility:**
- Increase placeholder opacity (opacity-40 for better readability)
- Match likes border transparency with count text (border-acc/40)
- Consistent transparency across pushed logs and placeholders

**Padding & Highlights:**
- Remove vertical padding from On/Off toggles to match widget highlights
- Equal padding on toggle hover highlights

**Recipe Widget:**
- Fix greeting timing: 3 seconds visible, 1400ms fade (matches memory speed)
- Greeting and label fade simultaneously
- Total dismissal time: 4400ms

**Mirror Mode:**
- Add transparent cutout text to white System button

## Bug Fixes

### Memory Story System
- **Fix question duplication**: Changed useMemory query to use date only (YYYY-MM-DD) instead of timestamp with seconds
- **Proper caching**: staleTime=Infinity, cacheTime=24h to prevent refetching every second
- **Compress repetitive follow-ups**: Detect topic repetition and use brief format

### Sound Module
- Fix CSP connect-src for cdnjs.cloudflare.com
- Service worker external request bypass with logging
- HTML cache prevention (Cache-Control headers)
- Bumped SW version to v2024-12-14-002
- Script loading with crossOrigin and error handlers

### UI Fixes
- Likes border: full opacity → 40% opacity (matches text)
- Block children: conditional negative margin (only for interactive elements)
- Recipe widget: precise timing control for greeting and fade
- TypeScript compilation errors across server

## Technical Details

**Files Modified:**
- `src/client/queries.ts` - Query caching for memory questions
- `src/client/utils/sound.ts` - Audio context debugging and error handling
- `src/client/utils/hooks.ts` - Script loading with CORS support
- `src/client/components/ui/Block.tsx` - Conditional negative margins
- `src/client/components/Sync.tsx` - Likes transparency and alignment
- `src/client/components/Logs.tsx` - Placeholder opacity
- `src/client/components/RecipeWidget.tsx` - Greeting timing
- `src/client/components/MemoryWidget.tsx` - Button alignment
- `src/server/routes/api.ts` - Intelligent pacing integration
- `src/server/utils/memory.ts` - Pacing logic and weekend prompts
- `src/server/server.ts` - CSP headers and HTML caching
- `public/sw.js` - Service worker version and logging

**Intelligent Pacing Function:**
```typescript
calculateIntelligentPacing(userId, currentDate, models)
```
Returns: shouldShowPrompt, isWeekend, promptQuotaToday, promptsShownToday, dayNumber

## Commits (20 total)

1. `c893cb3d` - Increase Type here... placeholder opacity for better visibility
2. `fc9ae8b0` - Add intelligent natural pacing for Memory prompts
3. `659a6a69` - Fix question duplication and add mobile sound debugging
4. `5ae88159` - Fix toggle padding and improve sound module debugging
5. `08107d7e` - Fix multiple UI alignment and transparency issues
6. `afb1a29f` - Match likes border to team tags border: use full opacity
7. `075172b2` - Fix Block toggle highlight alignment: add negative left margin
8. `a4a60a9c` - Fix MemoryWidget button alignment: add negative left margin
9. `c98cb932` - Fix recipe widget logic: greeting timing + label fade
10. `96193b41` - Fix sound module for PWA: prevent HTML caching + SW logging
11. `6a0fce71` - Fix Live widget value alignment: remove blockView padding offset
12. `6b69d5fc` - Add transparent cutout text to white System button in Mirror mode
13. `5c5d5ace` - Slow down recipe greeting fade: prevent blinking effect
14. `da69b35c` - Fix sound module for PWA: CSP connect-src + service worker bypass
15. `58803644` - Improve recipe widget fade timing and greeting fade
16. `3d6bd03b` - Optimize Memory Story prompts: compress repetitive follow-ups
17. `2e3eec60` - Fix sound module: Add cdnjs.cloudflare.com to CSP whitelist
18. `a10eb825` - Restore bordered Tag components for team tags in public profile
19. `f02b4eaf` - Restore Psychological Profile section to public profile
20. `a508cf2a` - Fix all server TypeScript compilation errors

## Test Plan

- [x] Test Memory prompts appear at correct times
- [x] Verify weekend mode shows lighter questions
- [x] Check progressive onboarding (Day 1-3)
- [x] Test sound module on mobile/PWA
- [x] Verify UI alignment fixes
- [x] Check question duplication is resolved
- [x] Test service worker updates
- [ ] Monitor user engagement with new pacing
- [ ] Review weekend prompt quality
- [ ] Collect mobile sound feedback

## Breaking Changes

None. All changes are backwards compatible.

## Deployment Notes

- Server restart required for intelligent pacing
- Service worker version bump will trigger PWA update
- Users may see update banner on next visit
- Hard refresh recommended for testing (Ctrl+Shift+R)
