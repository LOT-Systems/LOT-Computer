================================================================================
LOT SYSTEMS / SELF-ASSEMBLY LOG
DOCUMENT: LOT-ASSEMBLY-v49
TITLE:    Heavy Widget Lazy-Mount · Game Loop Viewport Gate
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
PHASE:    v49
DATE:     2026-06-04
TIME:     SESSION-2
BUILD:    GREEN (11.44s)
COMMIT:   0fdf1d8
================================================================================

--------------------------------------------------------------------------------
00 // SOURCES SCANNED
--------------------------------------------------------------------------------
  USERSHIP_TRANSMISSION (2026-06-03)   — explicit next: heavy widget lazy-mount
  docs/assembly/2026-06-04_LOT-assembly-v48.md  — Field Manual sync, no code delta
  docs/benchmark/LOT-LEXICON.md        — RENDER-ISOLATION token (rev B)
  src/client/components/SystemProgressWidget.tsx — SESSION_REPORTS, ASSEMBLY_TRANSMISSIONS
  src/client/components/MicroGameWidget.tsx      — game loop structure (150ms tick)
  src/client/components/QuantumEngineWidgets.tsx — store subscriptions: intentionEngine, selfAssembly
  src/client/components/System.tsx               — render sites (lines 469, 927, 962)

--------------------------------------------------------------------------------
01 // FEEDBACK SIGNAL EXTRACTED
--------------------------------------------------------------------------------
  Verbatim from USERSHIP_TRANSMISSION 2026-06-03:
  "Next: heavy widget lazy-mount. MicroGameWidget runs a 150ms game loop.
  QuantumEngineWidgets carries the most dependency weight."

  Prior transmission context (render isolation series):
    SR-20260602-01 — router subscription isolated from App
    SR-20260603-01 — Block/Sync/nav subscriptions narrowed
    SR-20260603-02 — Button.tsx split by kind, secondary variant subscribes to nothing
  This session: SR-20260604-01 — loop gate + lazy mount (natural next step in series)

--------------------------------------------------------------------------------
02 // DELTA ANALYSIS
--------------------------------------------------------------------------------
  PRIORITY 1 (explicit):
    - MicroGameWidget: setInterval(tick, 150ms) fires every 150ms regardless of
      whether the widget is visible on screen. No gate existed.
    - QuantumEngineWidgets: useStore(intentionEngine) + useStore(selfAssembly) +
      useEnergy() query all subscribe on mount, before widget enters viewport.
      This fires on every QIE signal (high frequency) even when user is looking
      at the top of the System tab.

  PRIORITY 2 (behavioral gap): deferred — no user navigation signal toward this
  PRIORITY 3 (systemic): deferred — other heavy widgets may benefit in later run

--------------------------------------------------------------------------------
03 // WHAT WAS BUILT
--------------------------------------------------------------------------------
  FILE                                         ACTION
  ------------------------------------------   --------------------------------
  src/client/hooks/useInViewport.ts            CREATED
    - useInViewport(): one-shot — returns true after first intersection, stays true.
      rootMargin 200px for pre-mount before visible edge.
    - useActiveViewport(): continuous — mirrors current intersection state.
      Used to pause/resume loops. threshold 0.1.
    Both functions: IntersectionObserver fallback to true when API unavailable
    (SSR-safe, old browser-safe).

  src/client/components/MicroGameWidget.tsx    MODIFIED
    - Import: useActiveViewport from #client/hooks/useInViewport
    - Added: containerRef (HTMLDivElement) on Block's inner div
    - Added: inViewport = useActiveViewport(containerRef)
    - Game loop useEffect: guard `if (!inViewport) return` before setInterval setup
    - Dependency array: [gameId, inViewport]
    - Effect: when widget scrolls out of view → IntersectionObserver fires →
      inViewport = false → useEffect cleanup runs → clearInterval() stops loop.
      When widget scrolls back in → inViewport = true → useEffect re-runs → loop restarts.
    - Game state (tetrisRef, invadersRef, snakeRef) is preserved across pause/resume.

  src/client/components/System.tsx             MODIFIED
    - Import: useInViewport from #client/hooks/useInViewport
    - Added: LazyMount component (11 lines) — renders null until element enters
      viewport, then mounts children and never unmounts them.
    - QuantumEngineWidgets (line ~972): wrapped with <LazyMount>.
      Before: useStore(intentionEngine) subscribes on app load, fires on every
      QIE signal regardless of scroll position.
      After: subscriptions only start when user scrolls near QuantumEngineWidgets.
      Once mounted, stays mounted (no thrash on scroll).

--------------------------------------------------------------------------------
04 // TEST RESULTS
--------------------------------------------------------------------------------
  yarn install           PASS
  client:css:build       PASS
  client:js:build        PASS
  server:build (tsc)     PASS
  BUILD:                 GREEN (11.44s)

  Regression checks (manual trace):
  - MicroGameWidget visible: renders at lines 469 (col 1) and 927 (col 3 CQGS block)
    Both use existing WidgetErrorBoundary wrapper — no structural change
  - containerRef attached to the same inner div where canvas lives — observer target correct
  - useActiveViewport returns false until observer fires — loop starts on first viewport entry
  - LazyMount wrapper: renders <div ref> with null children until intersection
    WidgetErrorBoundary around LazyMount still catches any errors in QuantumEngineWidgets
  - No TypeScript errors (server:build + client:js:build both PASS)

--------------------------------------------------------------------------------
05 // DEPLOY
--------------------------------------------------------------------------------
  Branch:   claude/quantum-engine-widgets-RgFfC
  Commit:   0fdf1d8
  Message:  [LOT-ASSEMBLY] 2026-06-04 — Lazy-mount QuantumEngineWidgets + viewport-gate MicroGame loop
  Status:   PUSHED

--------------------------------------------------------------------------------
06 // DEFERRED
--------------------------------------------------------------------------------
  - Other heavy widgets (PatternRecognitionWidget, UserMetricsWidget) may benefit
    from LazyMount — deferred to Priority 3 in next run. No user signal yet.
  - MicroCalculatorWidget and MicroImageWidget: smaller footprint, defer.
  - QuantumStateWidget: subscribed to intentionEngine — candidate for lazy-mount
    but positioned lower in widget stack; lower urgency.

--------------------------------------------------------------------------------
07 // NEXT SESSION RECOMMENDATION
--------------------------------------------------------------------------------
  Apply LazyMount to QuantumStateWidget + PatternRecognitionWidget (next two
  heaviest intentionEngine subscribers below the fold) — completes the
  viewport-isolation layer across the CQGS Biofield Engine block.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-ASSEMBLY-v49
================================================================================
