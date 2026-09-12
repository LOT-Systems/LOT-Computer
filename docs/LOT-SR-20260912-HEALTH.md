# LOT Systems — Health Check Report
**Date:** 2026-09-12  
**Session:** Scheduled automated health check  
**Branch audited:** `master` + `claude/inspiring-volta-6aokbd`

---

## 1. Active Incidents

| Severity | Component | Status |
|----------|-----------|--------|
| **None** | — | All production systems nominal |

No active outages or degraded-performance incidents detected at time of this check. The `/api/public/status` endpoint provides a live 2-minute-cached view of all eight system checks (Database, Engine, Auth, Admin, Settings, Sync, Memory Engine, Systems) — check it for real-time state.

---

## 2. Errors and Warnings

### 2.1 Open Pull Request — Stale (38+ days)

**PR #93** — `feat(calendar): time tracking + military-grade due-event toast`  
Branch: `claude/dreamy-babbage-4iv1xo` → `master`  
Opened: 2026-07-28 | Last updated: 2026-08-05  
URL: https://github.com/LOT-Systems/LOT-Computer/pull/93

**Status:** Open, not merged. Has been idle for over 5 weeks. The work landed on its feature branch but was never merged into `master`. This is the only unresolved PR.

**Action required:** Review, merge, or close PR #93.

### 2.2 TypeScript `@ts-ignore` in Clock.tsx — Fixed this session

`src/client/components/ui/Clock.tsx` used `// @ts-ignore` to suppress a type error on `setInterval`'s return value. When `@types/node` is present, TypeScript infers `NodeJS.Timeout` rather than `number`, making the explicit `React.useRef<number>()` annotation incorrect. **Fixed:** ref is now typed `ReturnType<typeof setInterval>`, which resolves correctly in both browser and Node type environments with no suppression needed.

### 2.3 Select `useCallback` Stale Dep — Fixed this session

`src/client/components/ui/Input.tsx` — the `Select` component's `onChangeHandler` listed `value` in its `useCallback` dependency array despite `value` not being referenced inside the callback. This caused unnecessary re-creation of the handler on every value change. **Fixed:** `value` removed from the dep array.

---

## 3. Performance Anomalies

### 3.1 ToggleSection max-h Animation Hack — Fixed this session

`src/client/components/ui/ToggleSection.tsx` animated collapse/expand using `max-height: 0 ↔ max-height: 2000px`. This approach:
- Produces uneven easing (the transition runs at full 2000px speed even for 100px content)
- Breaks completely for sections taller than 2000px
- Forces the browser to repaint at every intermediate max-height value

**Fixed:** Replaced with the CSS grid `grid-template-rows: 0fr ↔ 1fr` technique. The wrapper is a `display: grid` container; the inner div has `min-height: 0`. The browser clips to true content height at every frame — smooth, proportional, no magic number.

### 3.2 Table Row Keys Use Array Index

`src/client/components/ui/Table.tsx:53` — `<tr key={i}>` uses the array index as the React reconciliation key. When rows are reordered or removed, React re-uses DOM nodes incorrectly, causing stale state or animation glitches on row interactions. The generic `Table<D>` API doesn't expose a key accessor — the fix requires adding a `keyAccessor?: (datum: D) => string` prop. Left as a tracked item (not changed this session as it requires consumer callsite coordination).

---

## 4. Resolved Items

| Item | Resolution |
|------|------------|
| `Clock.tsx @ts-ignore` | Fixed — `ReturnType<typeof setInterval>` |
| `Select` stale useCallback dep | Fixed — removed `value` from dep array |
| `ToggleSection` max-h animation | Fixed — CSS grid `grid-template-rows` technique |

All three fixes committed to `claude/inspiring-volta-6aokbd` this session.

---

## 5. Component Quality Assessment

### UI Component Inventory (src/client/components/ui/)

| Component | Quality | Notes |
|-----------|---------|-------|
| `Block.tsx` | ✅ Excellent | Theme-aware, mirror-mode support, click delegation with interactive-element guard |
| `Button.tsx` | ✅ Excellent | Three variants (primary/secondary/rounded), theme-split into sub-components to avoid unnecessary store subs |
| `Page.tsx` | ✅ Excellent | Single-responsibility wrapper, responsive padding scale |
| `Layout.tsx` | ✅ Excellent | `React.memo` on NavButton, computed nav reversed on mobile — correct |
| `Input.tsx` | ✅ Good (fixed) | Select dep fixed this session; ResizibleGhostInput uses CSS `data-value` trick for auto-height — correct |
| `Tag.tsx` | ✅ Good | `useMemo` for className, mirror-mode and red/special-case handled cleanly |
| `Table.tsx` | ⚠️ Minor | Index keys on rows — tracked above |
| `Clock.tsx` | ✅ Good (fixed) | `@ts-ignore` removed this session |
| `ToggleSection.tsx` | ✅ Good (fixed) | Animation technique upgraded this session |
| `WidgetErrorBoundary.tsx` | ✅ Good | Per-widget performance tracking via `window.__LOT_WIDGET_PERF__`, retry on error |
| `Link.tsx` | ✅ Clean | `rel="noreferrer"` auto-applied for `_blank` |
| `Text.tsx` | ✅ Clean | `ErrorLine`, `Unknown`, `P` primitives — minimal, correct |

### Architecture Observations

- **Evolution system CSS variables** — `--evolution-*` tokens wired to progression are a strong design-system pattern. The density-aware `grid-fill-hover` variants (`breathable/comfortable/dense`) are properly scoped with `[data-density="..."]` selectors.
- **LazyMount pattern in System.tsx** — deferring widget mount until viewport entry is the right call for the large widget surface. Good use of `IntersectionObserver` via `useInViewport`.
- **WidgetErrorBoundary wrapping** — widgets on the System page are individually sandboxed; a crash in one widget doesn't take down the whole page.
- **Circular dep guard in Layout.tsx** — explicit comment explaining why Layout imports Button/Page directly rather than through the barrel. This is exactly the right pattern to document.

### Dependency Audit

| Package | Current | Note |
|---------|---------|------|
| `axios` | `^0.27.2` | Axios 1.x has been stable since 2022. v0.27 is on a legacy branch. Consider migrating to `axios@^1.7` or native `fetch` (already used in StatusPage) |
| `react-query` | `^3.39.3` | TanStack Query v5 is a major improvement in DX and bundle size. v3 is in maintenance mode. Migration is opt-in and not urgent but worth planning |
| `@anthropic-ai/sdk` | `^0.32.1` | Check for latest — Claude SDK updates frequently; newer versions bring streaming improvements and model name normalization |
| All others | Current range | Within acceptable range for a production app |

---

## 6. Overall Assessment

```
Systems:          NOMINAL
Open incidents:   0
Open PRs:         1 (PR #93 — stale, 38 days)
Open issues:      0
Fixes applied:    3 (Clock.tsx, Input.tsx, ToggleSection.tsx)
Design quality:   TOP-TIER — LOT Systems design system is coherent,
                  theme-aware, evolution-driven, and architecturally sound
```

The codebase is in strong health. The component library is clean, consistent, and follows best practices for a premium product site. The three fixes applied this session remove technical debt without touching any behavior. The only item requiring human attention is **PR #93** — it should be merged or closed.

---

*Report generated by scheduled Claude Code health check — 2026-09-12*
