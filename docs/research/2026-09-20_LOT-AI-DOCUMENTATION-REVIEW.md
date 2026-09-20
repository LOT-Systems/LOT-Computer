<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT® AI Documentation & Brand Review — 2026-09-20

**Class:** RESTRICTED // S-2 EYES
**S-2:** VADIK MARMELADOV
**Cadence:** Daily scheduled review
**Status:** ⚠️ PARTIAL — external sources unreachable from this environment

---

## 0. Bottom line

This session's network egress policy **blocks** `lot-systems.com`, `brand.lot-systems.com`,
and `institute.lot-systems.com` outright (proxy returns `403` — "policy denial", not a
timeout or DNS failure). `WebFetch` against all three failed with `EGRESS_BLOCKED`. This
is a recurring, structural blocker for this task, not a one-off outage — every future daily
run in an environment with the same network policy will hit the same wall unless the
policy is changed. See §4 for the fix.

Because direct fetch was unavailable, this report instead:
1. Documents the exact blocker (§1) so it can be fixed at the source.
2. Surfaces what little is publicly indexed about the three properties via web search,
   which does not require fetching the blocked domains directly (§2).
3. Cross-references the puzzle terms (Coffee → Widget → Subscription → Design System →
   Style → Community, Robot Persons™) against what already lives in this repository,
   which is the more authoritative and complete source for LOT internals anyway (§3).
4. Flags what needs a human check the next time the sites are reachable (§5).

---

## 1. External source access — blocked

| Source | URL | Result |
|---|---|---|
| Corporate site | `https://lot-systems.com/about` | `EGRESS_BLOCKED` |
| Institute (first node) | `https://institute.lot-systems.com` | `EGRESS_BLOCKED` |
| Brand system | `https://brand.lot-systems.com` | `EGRESS_BLOCKED` |

Proxy diagnostic (`/__agentproxy/status`) confirms this is a policy-level CONNECT
rejection, not a transient network issue:

```
"recentRelayFailures": [{
  "kind": "connect_rejected",
  "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)",
  "host": "lot-systems.com:443"
}]
```

**Nothing to fix on the LOT side** — the sites are live and indexed by search engines
(see §2). The block is on this Claude Code environment's outbound network policy, which
does not currently allowlist the `lot-systems.com` apex or its subdomains.

---

## 2. What's publicly visible (via search index, not direct fetch)

Search snippets (not full page content — direct fetch was blocked) surfaced:

- **lot-systems.com** — described externally as a subscription service distributing
  "digital and physical necessities, basic wardrobes, organic self-care products, home
  and kids essentials." Mentions **Founding Supporter** benefits: LOT Systems Dashboard
  access, a magazine subscription, surprise product subscriptions, community-event
  access, and exclusive AI features. This lines up with `docs/corporate/LOT_FMCG_SUBSCRIPTION_PLAN_2027.md`
  in this repo (Basic Essentials FMCG subscription, $399/mo / $4,788/yr).
- **brand.lot-systems.com** — indexed under the title "**Usership** — LOT Systems,"
  suggesting the brand site frames the offering around a "Usership" model rather than
  plain "Subscription." Worth confirming against internal terminology (repo currently
  says "Subscription" / "FMCG Subscription" throughout) — possible brand-language drift
  between the live site and the repo's docs.
- **institute.lot-systems.com** — indexed as "**LOT Institute**," referencing
  "**LOT® Institute, Inc**" and "**LOT® QI46™**." QI46 matches this repo's Quantum Intent
  Engine work (`docs/corporate/LOT_QI46_ENGINE.md`, the QIE v100–v113 assembly logs in
  `docs/assembly/`). No paper titles or abstracts were indexed, so no content-level
  update can be confirmed today.

No mention of "**LOT® Robot Persons™**" or the literal "Coffee → Widget → Subscription →
Design System → Style → Community" flow turned up in the public index. Both remain
unconfirmed against the live site pending direct access (§5).

---

## 3. Cross-reference against the repository (authoritative internal state)

Since the live brand/institute sites were unreachable, here's where each stage of the
named flow currently stands **inside this repo**, as the closest available substitute:

| Flow stage | Repo evidence | Notes |
|---|---|---|
| **Coffee** | *(no match found)* | No file, commit, or doc in this repo mentions "Coffee" as a product stage. Likely a brand-site-only concept, or the first unsolved piece of the puzzle. |
| **Widget** | `docs/technical/WIDGETS.md` | Full reference for every dashboard widget: Core, Biofield & Evolution, Community, Quantum Intention Engine, System & Metrics, Utility, Stats Dashboard, Conditional/Subscriber, Investor/Demo widgets. |
| **Subscription** | `docs/corporate/LOT_FMCG_SUBSCRIPTION_PLAN_2027.md` | Basic Essentials FMCG subscription plan (physical-first pivot, $399/mo). Public search suggests the live brand site now calls this "**Usership**" — potential naming divergence to reconcile. |
| **Design System** | `docs/technical/LOT-STYLE-GUIDE.md` (v1.0, Jan 2026) | "LOT (Library of Time) design philosophy, visual language, interaction patterns." Also `docs/corporate/LOT_BENCHMARK_COLOR_SYSTEM.md`. |
| **Style** | Same style guide + `docs/badges/` codices | Style guide covers typography/visual language; badge codices (32 versions) carry a lot of the visual/gamification style layer. |
| **Community** | `docs/technical/WIDGETS.md` → "Community Widgets" section | No standalone community doc found; community surface currently lives inside the widget layer. |

**Robot Persons™** — not found verbatim anywhere in the repo. The closest internal
concept is `docs/corporate/LOT_ROBOTICS_COSMO.md` ("COSMO® Robotics & Ethical AI
Integration," May 25 2026), whose core thesis is a robot carrying "the accumulated
patterns, values, and intentions of a good human being" — this may be the internal
name for what the brand site calls "Robot Persons™," or the two may be genuinely
distinct concepts that haven't been reconciled in writing yet. Flagging rather than
guessing (§5).

**Recent internal activity** (from repo history, for currency): most recent merged work
is `#96` (quantum-engine-widgets branch), badge codex v32, QIE v113, and LOT-WIKI v87
(2026-08-05) — all pre-dating today by about six weeks, so nothing newer has landed in
the repo itself since early August.

---

## 4. Recommended fix

To let this daily task actually do what it's scheduled to do, allowlist these hosts in
the environment's network egress policy (or run this specific scheduled task from an
environment whose policy already allows them):

- `lot-systems.com` (+ `www`)
- `brand.lot-systems.com`
- `institute.lot-systems.com`

Until that's done, this daily job can only produce the repo-cross-reference in §3, not
a true diff against the live brand/institute content.

---

## 5. Open items needing a human (or a network-unblocked run)

1. Confirm whether "Usership" (seen in the brand-site search snippet) is a live rename
   of "Subscription" — if so, the repo's `LOT_FMCG_SUBSCRIPTION_PLAN_2027.md` and related
   docs are using outdated terminology.
2. Confirm what "LOT® Robot Persons™" actually refers to, and whether it maps 1:1 to
   `LOT_ROBOTICS_COSMO.md`'s COSMO® concept or is something separate.
3. Confirm what "Coffee" refers to as a flow stage — no internal trace found.
4. Once `institute.lot-systems.com` is reachable, pull actual paper titles/abstracts —
   today's run could only confirm the "QI46" reference already tracked internally.

---

_Compiled by the daily LOT AI documentation review task. No changes made to code or
existing docs — this is a standalone review artifact._
