<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# SESSION LEARNINGS — TAB SWITCHING FIX
## 29 May 2026

---

## ROOT CAUSE

Every tab switch was unmounting the current component and remounting the next one from scratch. The System tab alone imports 38 widgets — each one recreating DOM nodes, re-running all hooks, re-subscribing to stores, re-fetching queries. This full mount cycle was the sole cause of slow tab switching.

```
BEFORE:
  User clicks Log tab
  → System unmounts (38 widgets destroyed, all state lost)
  → Logs mounts from scratch (DOM created, hooks run, queries fired)
  → User clicks System tab
  → Logs unmounts (NoteEditor state lost, scroll position lost)
  → System mounts from scratch (38 widgets rebuilt, all queries re-fired)
  
  Cost: ~200-500ms per switch, visible blank frame, scroll reset
```

## FIX

Persistent tab mounting. Tabs mount on first visit and stay alive in the DOM. Inactive tabs are hidden with `display: none` — the browser skips all layout and paint for them. Active tab uses `display: contents` so the wrapper div doesn't affect the layout flow.

```
AFTER:
  User clicks Log tab
  → System hidden (display: none — still in DOM, state preserved)
  → Logs shown (already mounted from first visit, or mounts now)
  → User clicks System tab
  → Logs hidden (NoteEditor state preserved, scroll preserved)
  → System shown (already in DOM, instant)
  
  Cost: ~0ms per switch, no blank frame, state preserved
```

## IMPLEMENTATION

```
src/client/entries/app.tsx

1. TabPanel component — wraps each tab with display:contents/none toggle
2. visited state (Set) — tracks which tabs have been mounted
3. System starts in visited set (default tab)
4. Other tabs added to visited set on first navigation
5. DM and Status remain conditional (parameterized, rarely used)
```

## TRADEOFFS

| Benefit | Cost |
|---------|------|
| Instant tab switching after first visit | More DOM nodes in memory |
| State preserved across switches | Background store subscriptions stay active |
| Scroll position preserved | Hidden tabs still process state updates |
| No re-fetch on every switch | — |
| No mount-fire trigger bugs | — |

The memory cost is minimal — the DOM nodes already existed, they just weren't being retained. Store subscriptions were running anyway since stores are global atoms.

## KEY INSIGHT

The mount-fire trigger bug (v1.3.0 fix) and the slow tab switching share the same root cause: **unnecessary re-mounting**. The trigger bug happened because NoteEditor re-mounted and scanned all text as new. The slow switching happened because 38 widgets re-mounted every time. Persistent mounting eliminates both classes of problem at once.

## SESSION PROCESS

```
1. PRE-SESSION SYSTEM CHECK  — build + git state verified
2. SESSION                   — investigated, implemented, tested
3. POST-SESSION SYSTEM CHECK — build clean, all imports verified
4. PUSH + LEARNINGS          — committed, pushed, this document
```

---

```
LOT SYSTEMS CORPORATION
Session Learnings — Tab Switching Fix
29 May 2026
```
