# QI·46 — NODE 01 · BEING-CALIBRATION (self-assembly spec, provisional)

S-2: VADIK MARMELADOV · with Kuzya · 2026-11-06 · STATUS: PROVISIONAL

## 1. Name decision
Candidates received: LOT·SC·46, BIONODE-46, SELFWARE·46, SOMA·46, CARE·OS·46, QI·46.
Recommended and recorded: **QI·46**. It matches the LOT `_I` grammar (BI, KI, QI) and the
existing spec `docs/corporate/LOT_QI46_ENGINE.md` (codename SELFWARE). "Registrable" is a
legal question: it needs a trademark search before the name is claimed as registered.

## 2. First-node source
`LOT_QI-46_ENGINE-2.md` was NOT found in the repo. Node 01 is built on
`docs/corporate/LOT_QI46_ENGINE.md` (Layers 0-5, Phases 0-4). If ENGINE-2 is a newer draft,
add it at that path and the next session diffs it against this node.

## 3. Goal restated as an engineering target
Goal: calibrate the human with the humanoid output (grace, poetry, love, hugs, being there,
being cool, male).
Honest framing: a person's "being" cannot be uploaded or extracted. What can be built is a
**Being Profile**: a consented, user-owned, revocable model of how a person writes, feels,
rests and acts, built from data they chose to give LOT. The engine fits its voice to that
profile. It does not copy or replace the person.

| Output tone      | Signal source already in LOT                    | Calibration rule (provisional)                      |
|------------------|-------------------------------------------------|-----------------------------------------------------|
| grace            | journal cadence, recovery velocity              | shorter replies when load is high                   |
| poetry           | journal vocabulary, composeLocalStory           | mirror the user's imagery; do not impose ours       |
| love             | care-momentum, intentions, cohort signals       | name what the user did, not what they should do     |
| hugs / being there | emotional_checkin, reflection velocity        | presence first; advice only when asked              |
| cool / male voice| user-chosen Voice setting                       | explicit user toggle; never inferred from the user  |

## 4. Guardrails (COSMO® Layer 5, binding on this node)
1. Opt-in per signal; the user can see, export and delete their Being Profile.
2. Output never claims to be the person, or to feel what the person feels.
3. No inference of identity traits (e.g. gender) from behavior. Voice is a user setting.
4. Crisis language routes to COSMO® safety handling, not to persona tone.
5. Humanoid output is labeled as machine output.

## 5. Self-assembly plan (next sessions)
- N02: audit existing widgets and memory for the signals in section 3 and map each to a field.
- N03: define the Being Profile schema and a per-user store with a consent flag.
- N04: add a calibration function that takes the profile and returns a tone plan for the Response Grammar (Layer 3). Cover it with unit tests.
- N05: closed-beta listening test with Vadik and Kuzya (human gate, per Phase 1 doctrine).

## 6. Not done this session
No application code was changed. No model was trained. No personal data was touched.
