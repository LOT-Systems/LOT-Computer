# QI·46 — Engine Node Map

The engine lives here. It is grown, not installed.
Spec (first node): `docs/corporate/LOT_QI46_ENGINE.md`

```
qi46/
├── calibration/
│   └── vector.json          Calibration Vector — the 7 output registers
│                            GRACE · POETRY · LOVE · HUGS · BEING_THERE · BEING_COOL · MALE
├── corpus/
│   ├── stats.json           Last assembly run: inventory, tags, gate result
│   └── build/               Generated JSONL (gitignored, reproducible)
│       └── review-sample-100.jsonl   committed — 100 soul-first pairs for review
scripts/qi46/
└── assemble-corpus.mjs      Phase 0: inventory → tag → COSMO® screen → JSONL → gate
```

Run: `yarn qi46:corpus` (or `node scripts/qi46/assemble-corpus.mjs`)

## Calibration loop

```
human signal  ──►  Calibration Loop (consented streams only)
                       │
                       ▼
               register selection  (1 primary + ≤1 secondary, BEING_THERE always on)
                       │
                       ▼
               QI·46 inference  ──►  COSMO® node (child-safe · stress-safe · honest)
                       │                         │
                       ▼                         ▼
               humanoid output             audit record
               (persona: MALE, default)
```

## Hard rules

- No subscriber data in this repo. Ever. Personal streams are consent-gated DB pulls.
- Consent is per-stream, revocable, and separate for arc memory vs. weight training.
- Crisis signals bypass every register and route to human help.
- The engine offers care. It does not claim to be human or to love as a human does.
