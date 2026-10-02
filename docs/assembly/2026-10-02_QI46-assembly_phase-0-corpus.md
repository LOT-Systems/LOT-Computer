# QI·46 Assembly Log — Phase 0 — Corpus Assembly
Date: 2026-10-02
Session: LOT-SR-20261002-01 (scheduled run, unattended)
Author: Vadik

## Sources read
Spec node: `docs/corporate/LOT_QI46_ENGINE.md` (5115 words). The brief named it `LOT_QI-46_ENGINE-2.md`; no such file exists. This is the only QI·46 spec in the repo and was treated as the first node.

Spec sources (`/corpus/*`) mapped to what exists in the repo today. `/corpus/` itself does not exist yet.

```
SPEC SOURCE             REPO CANDIDATE            FILES   WORDS
platform  (journal)     — none in git (Postgres)  n/a     n/a
institute (white pp.)   docs/corporate            26      47564
brand     (voice)       docs/wiki                 33      267866
bioelectric             docs/corporate (CQGS/QC)  incl.   incl.
consumables             — none in git             n/a     n/a
cosmo     (events)      — none in git             n/a     n/a
assembly history        docs/assembly             98      101645
build history           docs/benchmark            79      56179
technical               docs/technical            30      55051
```

Subscriber journal, consumable and COSMO® event data live in the database, not in git. Phase 0 cannot touch them from a repo session, by design (privacy).

## Tagging summary
Not started. 0 documents tagged. `cosmo_cleared` is unset on all documents. Nothing is cleared for training.

## Corpus statistics
Training pairs: 0 (gate requires > 10,000). The repo text above is roughly 0.5M words of prose, not pairs. Pair extraction needs a reviewed converter. Pair counts and token estimates here would be invented, so none are given.

## Vadik review notes
None this session. No human present. The 100-example corpus sample review is outstanding.

## Gate result
HOLD — Checkpoint 0 unmet: tagging, COSMO® clearance, pair count, JSONL validation and Vadik review all outstanding. Only the first box (source inventory) is partially met: repo-side sources catalogued, database-side sources not.

## PROVISIONAL — "upload a being" / humanoid calibration (HELD for S-2)
The brief asks to extract the engine from people's soul and emotions and calibrate human to humanoid output (grace, poetry, love, hugs, being there, being cool, male). Honest scope:
- A person's being cannot be uploaded. What can exist is a consented Calibration Loop profile (Layer 1) plus a Response Grammar register (Layer 3). That is a model of the person's signals, not the person.
- Proposed next node, not built: a `register` tag set (grace · poetry · love · presence · cool · masculine-voice) added to the Phase 0 tagging schema. Each tag is applied per training example, with `cosmo_cleared` required.
- Needs S-2 decisions before any build: explicit per-person consent and deletion rights; whether "male" is a voice register or a profile attribute; whether personal emotional data may enter training at all.

## Next session
Phase 0 Step 0.2 begins with a reviewed tagger over `docs/` and agreement on the `register` tags, after S-2 answers the consent questions above.
