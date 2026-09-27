<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® AI Documentation & Brand Review — 2026-09-27

**Type:** Scheduled daily review (automated)
**Status:** ⚠️ Partial — external sources unreachable from this session

---

## 1. Access Attempt

This session attempted to fetch the three sources named in the review scope:

| Source | Result |
|---|---|
| `https://lot-systems.com/about` | ❌ `EGRESS_BLOCKED` — domain blocked by this environment's network egress proxy |
| `https://brand.lot-systems.com` | ❌ `EGRESS_BLOCKED` — domain blocked by this environment's network egress proxy |
| `https://institute.lot-systems.com` | ❌ `EGRESS_BLOCKED` — domain blocked by this environment's network egress proxy |

None of the three `lot-systems.com` subdomains are reachable from this sandbox's current network policy. This is a hard blocker for reviewing the live LOT® Design System, COSMO® Style guidelines, brand standards, and any Institute papers — none of that content could be fetched today.

**Action needed from S-2:** either add `lot-systems.com`, `brand.lot-systems.com`, and `institute.lot-systems.com` to this environment's egress allowlist, or mirror the brand/institute source content into this repository so future daily reviews can read it directly. Until one of those happens, this recurring task can only review what's already checked into the repo.

---

## 2. What Was Reviewed Instead (Local Repository)

In place of the blocked live sites, this pass reviewed the repo's own product/brand documentation for anything matching the review's checklist:

- `docs/corporate/LOT-AI-PRODUCT-BRIEF.md` (v1.0, June 2026)
- `docs/corporate/LOT_ROBOTICS_COSMO.md` (May 25, 2026)
- `docs/technical/LOT_SYSTEMS_BRIEF.md` (v3.2, June 11, 2026)
- `docs/technical/LOT-STYLE-GUIDE.md` (v1.0, January 2026)
- `docs/releases/CHANGELOG-January-2026.md` and `docs/releases/RELEASE-NOTES-*.md`

No changes were made to any of these files — this is a read-only summary.

### LOT® AI programming language / ecosystem
There is no formal language, grammar, or compiler spec anywhere in the repo called "LOT." What exists is **LOT® AI as a product name** for the Quantum Intent Engine (QIE)'s public face, built around one primitive:

> `LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN`

Note: the "LOT" acronym is inconsistent across docs — `LOT-STYLE-GUIDE.md` expands it as "**Library** of Time," while `LOT_SYSTEMS_BRIEF.md` expands it as "**Layers** of Time." Worth reconciling with whatever the live brand site says is canonical.

### LOT® Robot Persons™
The exact term **"Robot Person(s)"** does not appear anywhere in this repository. The closest local concepts:
- **"LOT® Humanoid Robot"** — named in `LOT-AI-PRODUCT-BRIEF.md` as one of three recipients (with "LOT® Vehicle" and "LOT® Dashboard") of the weekly Story-Report API.
- **COSMO®** — the personal-robotics product line (`LOT_ROBOTICS_COSMO.md`), which transfers a verified owner's "behavioral fingerprint" into hardware via a "Soul Sync Protocol," gated by a Benchmark Arbitrage® tier (Purple/Black required).

If "LOT® Robot Persons™" is newer brand terminology for this same concept, it isn't reflected in the repo yet — this needs the live site to confirm.

### The Coffee → Widget → Subscription → Design System → Style → Community flow
**Unsolved.** No document in the repository links these six terms into a named pipeline. "Coffee" only appears locally as a beverage-preference survey option in the Memory Engine docs — unrelated to this flow. This puzzle can only be resolved by reading the actual brand/institute pages, which were unreachable today.

### LOT® Design System / COSMO® Style guidelines
`docs/technical/LOT-STYLE-GUIDE.md` (v1.0, Jan 2026, "Stable Reference") is the local design system doc — typography, opacity hierarchy, spacing scale, color philosophy, and interaction patterns (clickable-label cycling, fade-out timing, button-group rules). It credits Kuzya Cosmo Marmeladov (COSMO®) in its header, but there is no separate "COSMO Style" doc distinct from this one locally. If `brand.lot-systems.com` now defines COSMO® Style as its own guideline set, that content hasn't been mirrored into this repo.

### Recent release notes
`docs/releases/CHANGELOG-January-2026.md`'s latest entries (Personalized Widget Timing, Mood Graph Visualization, Self-Care Streaks, CSV Data Export) predate this review's scope and don't mention LOT® AI-as-language, Robot Persons, or the Coffee pipeline.

---

## 3. Flags for Current Projects / Integrations

- **Network policy blocks the brand/institute domains** — any future automated brand/doc review from this environment will keep failing until the egress allowlist or a local mirror is fixed. This is the main actionable item from today's run.
- **Acronym drift** ("Layers" vs. "Library" of Time) between two "Public" classified docs in the same repo — worth a single source of truth.
- Everything else in this checklist (Robot Persons naming, the six-step flow, current COSMO Style content) is unconfirmed pending live access.

---

*Next run: repeat this review; re-attempt the three URLs; if still blocked, escalate again rather than resubmitting silently.*
