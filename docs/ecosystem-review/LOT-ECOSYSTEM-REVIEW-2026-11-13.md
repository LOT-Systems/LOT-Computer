# LOT® AI — Daily Ecosystem Review · 2026-11-13

> LOT® AI · Self-care, delivered.™
> Scheduled routine run · branch `claude/practical-galileo-anl7n9`

---

## 0. Source status

| Source | Status | Note |
|---|---|---|
| https://institute.lot-systems.com (first node) | **BLOCKED** | Egress proxy refused the connection (`connect_rejected` / DNS not resolved) |
| https://lot-systems.com/about | **BLOCKED** | Same |
| https://brand.lot-systems.com | **BLOCKED** | Same |
| GitHub `LOT-Systems/LOT-Computer` (master, PRs, branches) | OK | Reviewed |
| Local repo `docs/` + `src/` | OK | Reviewed |

**Action required:** add `lot-systems.com`, `institute.lot-systems.com` and `brand.lot-systems.com`
to this environment's allowed network domains
(see https://code.claude.com/docs/en/claude-code-on-the-web). Until then, this review covers the
repository only. Nothing below is drawn from the websites.

---

## 1. Repository state

- `master` HEAD: `98971f2` — Merge PR #96 (2026-08-05). **No commits on master for 100 days.**
- Last documented state on master: FM v113 · LOT-WIKI-v87 · 151 patterns · 51 archetypes · 48 jobs · 190+ dep nodes · Badge Codex v32 code (812 badges in `badges.ts`).

### Open pull requests

| PR | Title | Last update | Notes |
|---|---|---|---|
| #97 | [LOT-ASSEMBLY] 2026-10-24 — LOT-WIKI-v88 · Badge Codex v32 · THE HERO'S JOURNEY | 2026-10-24 | Unmerged for 20 days. Adds LOT-WIKI-v88, session report, assembly log; edits `About.tsx` and `SystemProgressWidget.tsx` |
| #93 | feat(calendar): time tracking + military-grade due-event toast | 2026-08-05 | Stale ~100 days. Head commit is docs-only verification note |

---

## 2. Key updates — LOT® AI ecosystem (from PR #97, pending)

- **LOT-WIKI-v88** (2,269 lines, base v87 2,176 lines) — syncs Badge Codex v32.
- **Badge Codex v32 — THE HERO'S JOURNEY:** 781 → 812 badges (+31). Campbell monomyth as self-care vocabulary.
  - Word Turn v22: call_heard / threshold_crossed / mentor_arrived / ordeal_survived / elixir_found / shadow_met / innermost_cave / shapeshifter / herald_call / trickster_mode / ally_gained / return_road
  - Calendar EE v20: campbell_birthday (Mar 26) · hobbit_day (Sep 22) · odyssey_day (Dec 21)
  - Behavioral v19 · Achievement RPG v20 · Mastery Tier v22 (TWENTY_TWO_REGISTERS [COSMIC]) · Secret Boss v19 (tolkien_ring / odysseus_bow / gilgamesh_word)
- **Gap closed (already on master since 2026-08-05):** v20/v21 badge award logic backfilled in TypeScript — 93 previously unreachable badges are live.
- **QIE / Field Manual:** no engineering since P151 (v113). FM remains v113. "Next" pointer: LOT-WIKI-v89 → FM v114+.
- Counters per v88: 22 Word Turn engines · 264 word turns · 27 secret boss triggers · Day 1153+ · COSMO® 845 days.

No changes found to a "LOT® AI programming language" as such — the repo does not define one by that name. The closest artefacts are the QIE pattern/archetype system and the Word Turn lexicon engines.

---

## 3. Design System · COSMO® Style · brand

- brand.lot-systems.com could not be reached (see §0) — **not reviewed today**.
- In-repo: `brand.lot-systems.com` is referenced in the README/header blocks (438 files); no brand-standard source files changed since 2026-08-05.
- Last Design-System-related doc: `docs/corporate/LOT_DESIGN_LAB_SUMMER_2026.md` (4D UI commission proposal, 2026-06-06). No updates.
- COSMO® robotics doc `docs/corporate/LOT_ROBOTICS_COSMO.md` last changed 2026-06-29. No updates.

---

## 4. The flow puzzle — Coffee → Widget → Subscription → Design System → Style → Community

Mapped against what exists in the code (an interpretation, not an official spec):

| Step | Where it lives in the repo | Status |
|---|---|---|
| **Coffee** | Onboarding question options `['Tea','Coffee','Water','Light breakfast']` (`src/server/routes/api.ts:2334`); "Fuel Protocol ■·■" word-turn badge; Week-1 memory "Tea vs coffee" surface preference (`About.tsx:1174`) | Unchanged |
| **Widget** | System-tab widget stack (`docs/benchmark/LOT-SYSTEM-OUTLINE.md`) | Unchanged on master; PR #97 edits `SystemProgressWidget.tsx` (session report + Usership Transmission) |
| **Subscription** | `SubscribeWidget` — subscription prompt in System tab | Unchanged |
| **Design System** | brand.lot-systems.com (external) | Not reachable today |
| **Style** | COSMO® Style (external brand site) | Not reachable today |
| **Community** | `CollectiveConsciousness`, `WellnessPulse`, `CohortConnectWidget`, Sync tab (SSE feed + DMs) | Unchanged |

**Puzzle read:** a daily ritual (coffee — the first logged signal of the day) becomes a widget signal,
the widget surface converts to a subscription, subscribers receive the design system,
the design system expresses itself as COSMO® style, and style is what the community shares.
It reads as the funnel from a single self-care act to membership. No step changed in the repo this period.

### LOT® Robot Persons™

- No reference to "Robot Persons" anywhere in the repository.
- Nearest existing capability: **Robot Node — 6th ecosystem device** (connect/disconnect control in System tab,
  included in `ecosystem_full_coherence`; assembly v43, 2026-05-26) and the COSMO® robotics vision
  (behavioral-signature transfer to companion robots). No changes since June.

---

## 5. Flags — affects current projects / integrations

1. **⚠ Website sources blocked.** The first node and both brand sites can't be reached from this routine. Allow the domains or the review stays repo-only.
2. **⚠ PR #97 secret-boss counter drops 74 → 27** in `About.tsx`. The session report says secret boss triggers went 24 → 27, so the old "74" was likely wrong — but check it before merging so the public Field Manual count is correct.
3. **PR #97 is unmerged** — master's `About.tsx` still says 750 badges / 20 engines, while `badges.ts` on master already ships 812. The public count lags the code until #97 merges.
4. **PR #93 (calendar time tracking) has been stale for ~100 days** — merge, rebase or close.
5. **Engineering pause:** no QIE patterns beyond P151 and no commits to master since 2026-08-05.

---

*Next review: 2026-11-14.*
