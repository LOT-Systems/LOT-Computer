<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® Brand & Documentation Review — 2026-09-25

**Scope:** Scheduled daily review of LOT® AI papers/resources, the LOT® Design System, COSMO® Style guidelines, and brand standards, per standing task instructions.
**Status:** ⚠️ Partial — external sources unreachable from this session (see below).

---

## 1. External Source Access — BLOCKED

This session's outbound network goes through a policy-enforcing egress proxy. All three requested domains were denied at the proxy, not by the origin server:

| URL | Result |
|---|---|
| `https://institute.lot-systems.com` | `EGRESS_BLOCKED` — domain not permitted by network egress policy |
| `https://lot-systems.com/about` | `EGRESS_BLOCKED` — domain not permitted by network egress policy |
| `https://brand.lot-systems.com` | `EGRESS_BLOCKED` — domain not permitted by network egress policy |

Per this environment's proxy guidance, an org-policy denial (403/blocked) is not something to retry or route around — it needs to be reported rather than worked around. A general web search (not a direct fetch) turned up only that these are the correct canonical URLs for LOT Institute / LOT Systems; no page content was retrievable through search, since these are not third-party-indexed with full text.

**Action needed from the account owner:** if this scheduled task should be able to read `lot-systems.com`, `institute.lot-systems.com`, and `brand.lot-systems.com`, those domains need to be added to this environment's egress allowlist (session network policy, configured when the environment/session was created). Until then, this recurring task cannot verify anything published only on those sites — it can only review what's already checked into this repository.

## 2. Repository-Internal Review (what *is* accessible)

The repository's own documentation is current through **2026-08-05** (LOT-WIKI-v87, Field Manual v113). Only 3 commits have landed since then, none touching brand/design-system docs:
- `91e3648` BENCHMARK: ENGINEERING — v32 Hero's Journey Codex (+93 badges, 719→812)
- `8ac3690` [LOT-ASSEMBLY] 2026-08-05 — LOT-WIKI-v87 · FM v113 sync · QIE v113 + Badge v31
- `98971f2` Merge PR #96 (quantum-engine-widgets)

No changes to `docs/technical/LOT-STYLE-GUIDE.md` (still v1.0, January 2026, "Stable Reference") or `docs/corporate/` brand docs since the last review. Key facts on file, for reference:

- **LOT** = *Layers of Time*, a personal behavioral operating system (not a habit tracker), operated by **S-2** (Vadim Marmeladov, CEO). Ethics gate: **COSMO Gate**, named for Kuzya Cosmo Marmeladov (COSMO® founded 1 July 2024; Year 3 of operation as of the last wiki sync).
- Stack: TypeScript · Node.js · React · Prisma · PostgreSQL · esbuild/Tailwind, deployed on Digital Ocean, domain `lot-systems.com`.
- Visual design language (per `LOT-STYLE-GUIDE.md`): system-default monospace-aesthetic typography, no decorative colors, a strict opacity hierarchy (90/60/40%), no emojis unless requested, "Done." over "Done ✓", and a "click label to cycle view" interaction pattern used across widgets.
- As of FM v113: 148+ QIE patterns, 51 behavioral archetypes, 48 background jobs, 812 badges (Hero's Journey Codex, v32), 187+ dependency nodes.

## 3. "Coffee → Widget → Subscription → Design System → Style → Community" flow

Could not confirm or deny against the live site (blocked, see §1). A repo-only search finds no single document naming this exact funnel. The closest matches in-repo are independent pieces, not a stated flow:
- `SubscribeWidget` — "Subscription capture" / "Subscription prompt" (`docs/corporate/LOT_USA_IPO.md`, `docs/benchmark/LOT-SYSTEM-OUTLINE.md`)
- The LOT Design System and COSMO Style guide as separate, already-documented layers (`docs/technical/LOT-STYLE-GUIDE.md`)
- A "Community" surface (chat infrastructure, hardened per FM v92–93 notes in LOT-WIKI-v87)

No "Coffee" step appears anywhere in the codebase or docs under that name. Flagging this as unresolved rather than guessing — it likely describes a funnel on the marketing site itself, which this session cannot currently reach.

## 4. LOT® Robot Persons™

No mentions of "Robot Persons" found anywhere in the repository (code, docs, or commit history). This appears to be brand/product vocabulary that exists only on the external site, which is currently unreachable from this session. Cannot report on capabilities or changes.

## 5. Flags for the account owner

1. **Egress allowlist gap** — `lot-systems.com`, `institute.lot-systems.com`, `brand.lot-systems.com` are all blocked for this session's scheduled runs. This routine cannot do its job (checking the live site/brand docs) until that's fixed.
2. Nothing in the repository itself changed in a way that affects current projects or integrations since the last sync (2026-08-05) — the 3 new commits are engineering/badge work, not brand or design-system changes.
3. Recommend re-running this review once egress is opened, so it can actually diff against `lot-systems.com/about` and `brand.lot-systems.com` content.

---

*Generated by an automated daily LOT® brand/documentation review session.*
