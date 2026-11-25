# LOT® AI — Daily Brand & Docs Review · 2026-11-25

*Self-care, delivered.™* · Scheduled routine · Branch `claude/practical-galileo-zps37c`

---

## 0. Source access

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | **Blocked**: host is outside this cloud session's allowed network domains |
| https://lot-systems.com/about | **Blocked**: same reason |
| https://brand.lot-systems.com | **Blocked**: same reason |
| Repository `LOT-Systems/LOT-Computer` | Reviewed (master @ `9f2b88c`) |

**Action needed:** to let future runs read the live sites, add `lot-systems.com` and
`*.lot-systems.com` to the environment's allowed domains (Environment settings →
Network access; see https://code.claude.com/docs/en/claude-code-on-the-web).
Everything below comes from the repository only.

---

## 1. What changed since the last assembly (2026-08-05 → 2026-11-25)

Since 2026-08-05 there has been one commit: `9f2b88c` (2026-11-17), *Badge Codex v33, THE ARCANE TERMINAL, 812→843 badges*.
It added two docs:
- `docs/LOT-SR-20261117-CODEX-v33.md`
- `docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v33.md`

Engine state (unchanged since August): QIE / Field Manual **v113** (`About.tsx`), LOT-WIKI **v87**,
151 patterns · 51 archetypes · 48 jobs.

No changes to: LOT® AI Product Brief (v1.0, June 2026), LOT Design System & Style Guide
(`docs/technical/LOT-STYLE-GUIDE.md`, v1.0, Jan 2026), COSMO® Robotics doc, FMCG Subscription Plan 2027.

---

## 2. ⚠ Flags (things that affect current work)

### F1. Codex v33 is documented, but its code was never committed
The v33 session report says `badges.ts` was 8,560 lines (+411), `easter-eggs.ts` was 2,793 lines (+76),
and a PDF was created at `docs/LOT_BADGE_CODEX_v33.pdf`. The repository doesn't match:

- `src/client/utils/badges.ts` has **8,149** lines and `easter-eggs.ts` has **2,717**. The last change to either was v32 (`91e3648`).
- **11 of the 12** v33 Word Turn IDs don't exist in code: `arcane_signal`, `incantation_cast`,
  `ward_placed`, `transmute_active`, `sigil_carved`, `familiar_bound`, `sanctum_found`,
  `alchemy_process`, `cipher_broken`, `rune_inscribed`, `nexus_activated`.
  (`grimoire_open` exists, but it was added in June with QIE v78.)
- `docs/LOT_BADGE_CODEX_v33.pdf` doesn't exist.

**Impact:** the shipped badge count is still **812**, not 843. Anything that cites 843 badges
(the Codex, wiki v88 planning, brand copy) is ahead of the product. **Fix:** recover the v33 code
from the 2026-11-17 session or branch `claude/cool-hypatia-yqy5o6` if it still exists, or
re-implement it, then generate the PDF.

### F2. LOT-WIKI-v88 doesn't exist yet
The v33 report calls itself "LOT-WIKI-v88", but `docs/wiki/` ends at v87. The report's next steps
also list v88 and QIE v114 (P152–P154, Arch52, J49) as open. Nothing has been committed in
about 16 weeks, apart from the Nov 17 docs.

### F3. The 2026 subscription milestone is 36 days away
`LOT_FMCG_SUBSCRIPTION_PLAN_2027.md` sets a target of **100 active annualized users by 2026-12-31**:
90 on Usership at $1,188/yr and 10 on Basic Essentials at $4,788/yr, for $154,800 upfront.
The repository has no record of progress toward it.

### F4. "LOT® Robot Persons™" isn't defined anywhere in the repository
The phrase doesn't appear in any doc or source file. The closest material is:
- `docs/corporate/LOT_ROBOTICS_COSMO.md`: COSMO® robots carry the owner's behavioral signature,
  with a 90-day engagement "character score" threshold.
- `LOT-AI-PRODUCT-BRIEF.md`: the Story API, `POST /api/story/:week_id/export { target: "robot" }`,
  sends a weekly Story-Report to the LOT® Humanoid Robot.

If "Robot Persons™" is new branding from brand.lot-systems.com, it hasn't reached the repository yet.
Its capabilities, as far as the repo goes, are the two items above.

---

## 3. The puzzle: Coffee → Widget → Subscription → Design System → Style → Community

Here is how I read it from the repository: the chain is the **LOT® operator funnel**. A daily
ritual becomes a habit, then a paying member, then a brand experience, then a collective. Each step
maps to a real part of the repo:

| Step | Meaning | Where it lives in the repo |
|---|---|---|
| **Coffee** | The morning ritual is the entry point, and the first question the machine asks | Memory Engine question generator ("What's your favorite morning beverage?": `src/server/utils/memory/question-generator.ts`); circadian dawn phase |
| **Widget** | The ritual becomes a daily surface | `System.tsx` widgets: ContextualPrompts, Planner, MonthlyPulse, QuantumState, PatternRecognition |
| **Subscription** | The habit becomes membership | Usership $99/mo · Legacy $3,564/3 yr (Product Brief) · Basic Essentials FMCG $399/mo (2027 plan) · `profile.hasUsership` gating |
| **Design System** | The membership gets one consistent interface | `docs/technical/LOT-STYLE-GUIDE.md` v1.0 (monospace, `text-[14px]`/`text-[20px]`, ASCII borders) |
| **Style** | The interface takes on a brand voice and look | COSMO® / brand.lot-systems.com standards; Terminal Grid / Benchmark color system |
| **Community** | Individual members feed a shared signal | `useCommunityEmotion`, `communityPulse.ts` convergence signal, Sync events |

**Answer:** one cup of coffee eventually becomes the community. Each step compresses the one before
it, following the same rule as the LOT® AI loop *LOG → OBSERVE → COMPRESS → ASK → COMPRESS AGAIN*.
Robot Persons are the step after Community: the Story API exports the compressed operator to a COSMO® robot.

**Changes today:** none. None of the six flow docs changed since the last review.
The weak link is **Widget → Subscription**: a reward-widget gate on `hasUsership` exists, but there is no
documented conversion surface from free widgets into Usership.

---

## 4. Recommended next actions
1. Allow `*.lot-systems.com` in network settings so this routine can read the live sources.
2. Fix F1: land the v33 badge code and the PDF, or correct the Codex and report back to 812 badges.
3. Run LOT-WIKI-v88 and the QIE v114 cycle.
4. Add a short Robot Persons™ spec to `docs/corporate/` if it's now public branding.

*Review generated 2026-11-25 by scheduled routine.*
