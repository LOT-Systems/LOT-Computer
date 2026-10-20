# Session compression protocol (point 8)

At the end of each session, append ≤ 15 lines to `docs/hardware/STATE.md`:
`DECISIONS · OPEN QUESTIONS · NEXT 3 ACTIONS · RISKS CHANGED · NUMBERS CHANGED`.
Each new session starts by reading STATE.md only (not the full docs). Full report goes to `docs/LOT-SR-<date>-HW<nn>.md`.
