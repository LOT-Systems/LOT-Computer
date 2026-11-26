# LOT® AI — Daily Review · 2026-11-26

*Self-care, delivered.™* · Automated scheduled review · Branch `claude/practical-galileo-a31h08`

## 0. Source access

| Source | Status |
|---|---|
| https://institute.lot-systems.com (first node) | ❌ Not reachable: DNS blocked by the session network policy |
| https://lot-systems.com/about | ❌ Not reachable: same cause |
| https://brand.lot-systems.com | ❌ Not reachable: same cause |
| GitHub repo `LOT-Systems/LOT-Computer` | ✅ Reviewed (master @ `9f2b88c`) |

**Action needed:** add `lot-systems.com`, `institute.lot-systems.com` and `brand.lot-systems.com` to the allowed domains in the routine's environment network settings (https://code.claude.com/docs/en/claude-code-on-the-web). Until then, sections 2 and 4 cover only what the repository says.

## 1. Repository: latest state

- **Last commit on master:** `9f2b88c` (2026-11-17). *LOT-SR-20261117 · Badge Codex v33 THE ARCANE TERMINAL · 812→843 badges.*
- There have been **no new commits** in the 9 days since then.
- Previous milestone: PR #96 (`quantum-engine-widgets`) merged 2026-08-05, with QIE v113 / FM v113, LOT-WIKI-v87 and Badge Codex v32 (812 badges).
- The latest wiki is still `docs/wiki/LOT-WIKI-v87.md`. The v33 report calls itself "LOT-WIKI-v88", but no `LOT-WIKI-v88.md` file exists.

## 2. Key updates: LOT® AI & ecosystem

- **Badge Codex v33, "The Arcane Terminal"** (alchemy and magic vocabulary), +31 badges for a planned total of 843:
  - Calendar +3
  - Word Turns +12
  - Behavioral +3
  - Achievement RPG +6
  - Mastery +4
  - Secret Boss +3
- The **RPG/Arcade self-care direction** continues. Each codex adds 31 badges in a new themed vocabulary (Neon Arcade → Midnight Radio → Bio-Terminal → Codex Reader → Cyberspace → Hero's Journey → Arcane).
- Code headers are unchanged: LOT® founded 7 Apr 2016, COSMO® founded 1 Jul 2024.
- The repo has no new material on the **LOT® AI programming language** itself. Nothing in it uses the phrase "programming language" for LOT AI.

## 3. ⚠️ Flag: v33 is documented, but its code is not in the repo

`docs/LOT-SR-20261117-CODEX-v33.md` lists these files as modified:

| File the report lists | Repo reality |
|---|---|
| `src/client/utils/badges.ts`: 8,560 lines (+411) | **8,149 lines**. The new v33 IDs (`long_spell`, Paracelsus/Dee/Emerald Secret Bosses) are **absent** |
| `src/client/utils/easter-eggs.ts`: 2,793 lines (+76) | Not changed in `9f2b88c` |
| `docs/LOT_BADGE_CODEX_v33.pdf` (116KB) | **Missing**. The newest PDF is v32 |

Commit `9f2b88c` touches only the two `.md` files. The v33 code and PDF were probably left on branch `claude/cool-hypatia-yqy5o6` and never pushed or merged.

**Impact:** the docs say there are 843 badges, but the app ships 812. Anything that relies on v33 badges (Secret Boss unlocks, the 666-character `long_spell` easter egg) will not fire.

**Recommendation:** recover the work from `claude/cool-hypatia-yqy5o6` if it still exists, or re-implement v33 and run `lot-benchmark` before shipping.

## 4. Flow: Coffee → Widget → Subscription → Design System → Style → Community

Without the brand and institute sites, this reading is based only on what the repository shows:

1. **Coffee:** the daily ritual and entry point. Recipes live in `src/shared/constants/recipes.ts`.
2. **Widget:** the ritual appears as widgets in the System UI (QIE / quantum-engine widgets, PR #96).
3. **Subscription:** the original LOT concept. LOT-WIKI-v87 describes "a subscription service distributing digital and physical necessities…"
4. **Design System:** the LOT Design System (not reviewable today, because brand.lot-systems.com is blocked).
5. **Style:** COSMO® Style. Its 869+ days are counted from 1 Jul 2024.
6. **Community:** badges, word turns and the RPG layer turn individual care into shared progress.

Puzzle reading: one cup of coffee becomes a habit, which becomes a product, then a language, then a culture.

There are **no changes** to this flow in the repo today.

**LOT® Robot Persons™:** the repository has no references to them, so no capability changes can be confirmed. Checking needs institute or brand site access.

## 5. Flags for current projects and integrations

1. **HIGH:** the v33 code and PDF are missing from master (section 3).
2. **MEDIUM:** the routine cannot reach any lot-systems.com domain. The web part of this review is blind until the domains are allowed.
3. **LOW:** the version labels are inconsistent. The report says "WIKI-v88" but there is no wiki file for it, and the codex progression table numbers its entries v17–v23 while the codex files are v27–v33.
