# LOT® AI Documentation & Brand Review — 2026-10-23

*LOT® AI — Self-care, delivered.™*
Scheduled daily review. Status: **PARTIAL — external sources unreachable.**

## 1. Source access

| Source | Result |
|---|---|
| institute.lot-systems.com | DNS failure (`ENOTFOUND`) |
| lot-systems.com/about | DNS failure (`ENOTFOUND`) |
| brand.lot-systems.com | DNS failure (`ENOTFOUND`) |
| Direct curl via agent proxy | `403` on CONNECT (domain not on the egress allowlist) |
| Repository (`LOT-Systems/LOT-Computer`) | Read OK |

Nothing from the live site, Institute, or brand portal could be reviewed. Items 2–5 of the task below are therefore based on the repository only.
**Action for owner:** add `*.lot-systems.com` to the environment's network allowlist, or provide the content in-repo.

## 2. Repository state

- Latest `origin/master` commit: **2026-08-05** (`98971f2`, merge of PR #96). No commits in the ~11 weeks since.
- Latest docs: `LOT-SR-20260805-01` (Badges v32 "The Hero's Journey", 719→812 badges), `LOT-WIKI-v87`, QIE v113 / FM v113.
- Notable prior finding (LOT-SR-20260805-01): v20/v21 badge award logic had been documented but never implemented in `badges.ts`, so those badges were unreachable until v32. Worth auditing other documented-but-unimplemented features.
- The 2026-08 cadence of near-daily session reports stopped after 08-05; unclear whether work moved elsewhere (other branches/repos) or paused.

## 3. LOT® AI language / ecosystem updates

No new language specs, papers or releases found in the repo beyond the above. Cannot verify Institute papers.

## 4. Coffee → Widget → Subscription → Design System → Style → Community flow; Robot Persons™

- No changes detected in the repo to the flow. README still frames LOT as a subscription service plus the Memory Engine.
- "Robot Person(s)" appears only in `docs/assembly/2026-08-05_LOT-assembly_wiki-v87.md`, `LOT-GENESIS-v1.md` and `LOT-LEDGER.md`. No capability changes recorded.
- Puzzle: not solvable from available material. The ordering (Coffee first, Community last) suggests a loop in which Community feeds back to Coffee; confirmation needs the Institute/about pages.

## 5. Flags for current projects / integrations

1. External sources blocked → brand/Institute changes since August are unknown; risk of drift between the app and COSMO® style / design system.
2. Repo inactivity since 2026-08-05 (see §2).
3. Possible unimplemented-documented features (see §2).

## Next run
Re-attempt fetches; if still blocked, only report on new repo commits.
