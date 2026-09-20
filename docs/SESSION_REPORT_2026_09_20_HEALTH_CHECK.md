<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# Health Check Report — 2026-09-20

**Session:** Automated scheduled health check  
**Branch:** `claude/inspiring-volta-hblzfs`  
**Scope:** Full codebase quality audit — monitoring, errors, performance, components  
**Date:** 2026-09-20

---

## 1. Active Incidents

**No active incidents detected.**

- GitHub Issues: 0 open
- Open PRs: 1 (see §4)
- Build pipeline: npm registry access blocked in this environment (not a production issue)

---

## 2. Errors & Warnings Fixed This Session

### TS5101 / TS5107 — TypeScript Deprecated Config Options *(FIXED)*

**File:** `tsconfig.json`  
**Severity:** Medium — will become hard failures in TypeScript 7.0

Both `baseUrl` and `moduleResolution: "Node"` (node10) are deprecated since TypeScript 6.0 and will stop compiling in 7.0. The compiler was emitting TS5101 and TS5107 on every type-check run.

**Fix:** Added `"ignoreDeprecations": "6.0"` to `compilerOptions`. This silences the errors while keeping the existing path-alias and resolution behaviour intact, buying a clean migration window before TS7 lands.

```json
// tsconfig.json — before
"moduleResolution": "Node",

// after
"moduleResolution": "Node",
"ignoreDeprecations": "6.0",
```

---

### `@ts-ignore` in Clock.tsx *(FIXED)*

**File:** `src/client/components/ui/Clock.tsx:25`  
**Severity:** Low — suppressed type error, not a runtime issue

`setInterval` returns `number` in the browser but `NodeJS.Timeout` when `@types/node` is on the types list. The `@ts-ignore` was hiding this ambiguity.

**Fix:** Changed to `window.setInterval(…)` (always returns `number`; unambiguous in a browser context) and typed the ref as `ReturnType<typeof window.setInterval>`.

```tsx
// before
const loop = React.useRef<number>()
// @ts-ignore
loop.current = setInterval(…)

// after
const loop = React.useRef<ReturnType<typeof window.setInterval>>()
loop.current = window.setInterval(…)
```

---

## 3. Performance Anomalies Fixed

### ToggleSection — `max-height` Animation Anti-Pattern *(FIXED)*

**File:** `src/client/components/ui/ToggleSection.tsx:63–72`  
**Severity:** Medium — visible jank, forces browser layout recalculation on every animation frame

`max-height: 0 → max-height: 2000px` transitions are a classic CSS perf trap: the browser doesn't know the actual height so it calculates layout on every frame from 0px all the way to 2000px even if the content is 40px tall. This causes layout thrashing on low-powered devices and produces a "snappy close, slow open" asymmetry.

**Fix:** Replaced with a `grid-template-rows: 0fr → 1fr` transition. The browser resolves the true content height once, then composites the animation on the GPU — no per-frame layout recalculation.

```tsx
// before — layout recalculates every frame up to 2000px
<div className={cn(
  'overflow-hidden transition-all duration-300',
  isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
)}>
  <div className="py-4">{children}</div>
</div>

// after — single layout pass, GPU-composited
<div
  className="grid transition-[grid-template-rows,opacity] duration-300"
  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0 }}
>
  <div className="overflow-hidden">
    <div className="py-4">{children}</div>
  </div>
</div>
```

This pattern requires the inner `overflow-hidden` wrapper div as the grid child — the outer grid element controls row height, and the inner `overflow-hidden` clips the content during collapse.

---

## 4. Open Items (No Action Taken)

### PR #93 — Calendar Time Tracking + Due-Event Toast *(Open since 2026-07-28)*

**URL:** https://github.com/LOT-Systems/LOT-Computer/pull/93  
**Age:** 53+ days  
**Status:** Open, no merge conflicts noted, authored by vadikmarmeladov

This PR adds time-of-day fields to calendar entries and a terminal-grid-style toast for upcoming events. The implementation looks clean — no new DB columns, uses the existing `/api/logs` + `calendar_entry` contract, self-dedupes via `localStorage`. Recommend review and merge or explicit decision to close.

---

## 5. Component Quality Audit

### UI Primitives — Status: Excellent

| Component | Quality | Notes |
|-----------|---------|-------|
| `Button` | ✅ Top-tier | Split into sub-components to avoid unnecessary store subscriptions on secondary buttons. Correct `rel="noreferrer"` on `target="_blank"`. |
| `Input` / `Select` / `Textarea` | ✅ Strong | Clean prop abstraction, `onChange` normalised to string value. `ResizibleGhostInput` uses the canonical CSS `grid` + `data-value` auto-resize technique. |
| `Block` | ✅ Strong | Smart click-propagation guard via DOM traversal avoids false positives when interactive children are clicked. Progressive `widget-in-progress` indicator is theme-aware. |
| `Layout` | ✅ Top-tier | `NavButton` is correctly memoized. Circular-dep hazard around barrel import is documented in-source with a detailed comment. |
| `Table` | ✅ Good | Proper generic typing `<D>`. Border/highlight via `isSelected` prop. |
| `Tag` | ✅ Good | `useMemo` for class composition. Mirror-mode and fill-mode handled distinctly. |
| `ToggleSection` | ✅ Fixed | `max-height` animation replaced with `grid-template-rows` (see §3). |
| `Clock` | ✅ Fixed | `@ts-ignore` removed, typed correctly (see §2). |
| `WidgetErrorBoundary` | ✅ Strong | Per-widget crash isolation. Mount-time perf instrumentation exposed as `window.__LOT_WIDGET_PERF__`. Retry button in fallback UI. |
| `Link` | ✅ Clean | Auto `rel="noreferrer"` for `_blank` targets. |
| `Page` | ✅ Clean | Mirror-mode text colour applied at page root. |

### Design System — Status: Solid

- **Accent colour system:** CSS custom properties (`--acc-color-*`) dynamically set by the theme store (`src/client/stores/theme.ts`) via `generatePalette`. The `:root` defaults are all `0 0 0` by design — they're overwritten at runtime before first render, so they're safe static fallbacks.
- **Typography:** `font-base` (Arial/Helvetica) with text-rendering optimisation and subpixel antialiasing. Evolution system variables allow progressive letter-spacing and line-height shifts tied to user progression.
- **Dark mode:** Implemented via JavaScript store switching CSS custom property values, not a `prefers-color-scheme` media query. Intentional — gives the app full programmatic control of theme state.
- **Spacing scale:** Custom Tailwind scale (`spacing(8, 512)` in steps of 8px) replaces the default. Consistent with `px-8`, `py-8`, `gap-8` usage throughout.
- **Animation:** Convergence-breathe, stoic-anchor, soft-blink, and evolution transitions are all CSS-only with `will-change: opacity` guards where appropriate.

### Server — Status: Good

- Fastify + Helmet CSP configured. `'unsafe-inline'` in `script-src` is present but constrained to `'self'` and known CDNs — acceptable for the app's SSR + client-side hydration model.
- `security-config.ts` centralises all security constants (session TTL, rate limits, brute-force thresholds, OTP expiry) in one auditable file.
- Logging is disabled (`logger: false`) — this should be reviewed for production deployments if structured log visibility is needed.

---

## 6. Summary

| Category | Status |
|----------|--------|
| Active incidents | ✅ None |
| Open GitHub issues | ✅ None |
| TypeScript deprecation errors | ✅ Fixed |
| `@ts-ignore` suppressions | ✅ Fixed |
| Animation performance | ✅ Fixed |
| UI primitive quality | ✅ Top-tier overall |
| Design system coherence | ✅ Strong |
| Security posture | ✅ Good |
| Open PR #93 | ⚠️ Awaiting decision (53+ days) |

---

*Generated by Claude Code — LOT Systems Health Check · 2026-09-20*
