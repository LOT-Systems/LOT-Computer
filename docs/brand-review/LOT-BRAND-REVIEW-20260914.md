<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® AI — Daily Brand & Documentation Review
**Date**: 2026-09-14
**Scope**: lot-systems.com/about · institute.lot-systems.com · brand.lot-systems.com · in-repo brand materials

---

## 0. Access status (read first)

Direct fetch of all three requested domains was **blocked at the network layer** in this
session, before any page content could be retrieved:

| URL | Result |
|---|---|
| `https://lot-systems.com/about` | `EGRESS_BLOCKED` — gateway returned 403 to CONNECT (policy denial) |
| `https://institute.lot-systems.com` | `EGRESS_BLOCKED` — same policy denial |
| `https://brand.lot-systems.com` | `EGRESS_BLOCKED` — same policy denial |

This is a sandbox network-egress restriction on the execution environment, not a site outage.
Web search (which does not go through the same egress path) was used as a fallback, but these
domains are thinly indexed, so search snippets could not substitute for the real pages. Everything
below marked **[web-search]** is an unverified snippet; everything marked **[repo]** is read
directly from this repository and is authoritative for today's entry.

**Action needed from S-2**: if this daily task is meant to browse the live sites, `lot-systems.com`,
`institute.lot-systems.com`, and `brand.lot-systems.com` need to be added to this environment's
egress allowlist (see `/root/.ccr/README.md`), or the source PDFs/pages should be dropped into the
repo (as `docs/corporate/*.pdf` already does for `CQGS-WHITE-PAPER.pdf`) so this review can read
them locally.

---

## 1. What search surfaced **[web-search, unverified]**

- `brand.lot-systems.com` has a public page titled **"Usership - LOT Systems"** referencing
  founding-supporter benefits: Dashboard access, LOT Magazine subscription, surprise product
  subscriptions, in-person community events, "exclusive AI features," and recognition in a LOT
  database — plus mentions of a crowdfunding-style campaign with in-store credit, convertible
  stock, community pre-liquidation pricing, and eventual public stock. This is broadly consistent
  with the four-tier pricing ladder already documented in-repo (§2 below), but the stock/equity
  language does **not** appear in the in-repo brief and could not be confirmed — flagging rather
  than reporting it as fact.
- `institute.lot-systems.com` resolves (titled "LOT Institute") but search metadata dates its last
  update to **1 Aug 2025** — over a year stale relative to today — and no new paper or resource
  titles surfaced. No evidence of a recent update here.
- No indexed content at all for "LOT Robot Persons," or for a literal "Coffee → Widget →
  Subscription → Design System → Style → Community" page/flow on either domain.

## 2. Current state per in-repo brand materials **[repo]**

Source: `docs/corporate/LOT-AI-PRODUCT-BRIEF.md` (v1.0, June 2026) and
`docs/technical/LOT-STYLE-GUIDE.md` (v1.0, stable, last updated January 2026) — the closest
in-repo equivalents to the external brand/AI docs. No changes detected since these were last
touched; nothing in today's (blocked) external check contradicts them.

- **Core mechanic**: `LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN` — the Quantum Intent Engine
  (QIE) surfaces one earned question at a time, publicly branded as **LOT® AI**.
- **Story-Report**: weekly first-person narrative, exported via `/api/story/*` to three declared
  recipients — **LOT® Humanoid Robot**, **LOT® Vehicle**, **LOT® Dashboard**. This is the closest
  documented concept to "LOT® Robot Persons™" — the robot is a *consumer* of the Story-Report, not
  described in-repo as an independent "Robot Persons" product line under that name.
- **Pricing tiers**: R&D ($15/mo) · Usership ($99/mo) · Legacy ($3,564/3yr) · Admin ($11,000/9yr).
- **Design principles**: no unprompted notifications, one question at a time, behavioral over
  declarative, context private by default, silent server-side improvement.
- **LOT-STYLE-GUIDE.md**: monospace system-font aesthetic, opacity hierarchy (90/60/40), fixed
  spacing scale, no decorative color, no emoji, periods over checkmarks/symbols.

## 3. The Coffee → Widget → Subscription → Design System → Style → Community puzzle

Could not find this exact flow named on either domain (search) or in the repo (grepped `docs/`
and `src/` for "Coffee," "Widget," "Subscription," "Design System," "Style," "Robot Person" in
combination). The closest literal repo evidence:

- **Coffee** — not a pipeline stage in-repo; appears only as a badge/easter-egg trigger word
  ("Fuel Protocol ■·■" — `src/client/components/About.tsx`), i.e. a *logged ritual*, matching the
  product brief's self-care logging model (tea/coffee, morning/evening, Week 1 "surface" signal).
- **Widget** — real, plural, and central: `src/client/stores/plannerWidget.ts`,
  `recipeWidget.ts`, `rewardWidgets.ts` — the UI surfaces that receive a LOT® AI question.
- **Subscription** — the four-tier ladder above (R&D/Usership/Legacy/Admin).
- **Design System / Style** — `docs/technical/LOT-STYLE-GUIDE.md`, this repo's COSMO-adjacent
  style reference.
- **Community** — `src/client/utils/communityPulse.ts` and the "Community Sync" signal described
  in the product brief (§ LOT® Quantum Systems).

Read together, this reads as the intended operator funnel — a logged ritual (Coffee) surfaces
through a **Widget**, which upsells into a **Subscription**, governed by the **Design
System**/**Style**, and surfaced socially through **Community** — but this is my inference from
scattered in-repo pieces, not a confirmed flow from the brand site. Flagging for S-2 to confirm
or correct; happy to fetch the actual page verbatim once the egress block is lifted.

## 4. Flags for current projects/integrations

- **No breaking or urgent brand changes detected** — nothing in today's check contradicts
  `docs/corporate/LOT-AI-PRODUCT-BRIEF.md` or `docs/technical/LOT-STYLE-GUIDE.md`, so no code
  changes are recommended from this cycle.
- **Unverified**: the equity/convertible-stock language surfaced by search under "Usership" is
  not reflected anywhere in-repo. If real, it's a legal/IR detail worth confirming out-of-band
  rather than acting on a search snippet.
- **Environment gap**: this daily review cannot do its job (reading the live sites) until the
  three domains are reachable from this sandbox or their source docs are mirrored into the repo.
  Recommend fixing this before relying on tomorrow's run for anything time-sensitive.

---
*Compiled by an automated daily review session. External site content could not be verified this
cycle — see §0. Everything under [repo] was read directly from this repository at HEAD.*
