# 11 · Session Compression Protocol

Requirement #8, "compress the information in each session", is applied at two levels.

## A. Program sessions (Claude Code runs)

Every session ends with:
1. A full Markdown session report in `docs/hardware/LOT-SR-YYYYMMDD-HW-NN.md`, pushed to GitHub.
2. A **COMPRESSED STATE** block of 15 lines or fewer, written into `hardware/lot-tile/README.md` (replacing the old one) and repeated at the end of the report.
3. The next session reads **only** the README compressed state plus the decisions log before starting. Full documents are opened only when that session needs them.

**Format:**

```
PROGRAM   name · size · run size · vendor
STAGE     current stage + date → next stage
CORE/SENSE/CAMERA/POWER/LINK   one line each: chosen part numbers
COPY      the COPY path in one line
BUDGET    unit cost range · NRE range
DECIDE    open decisions (IDs)
RISKS     top risks (IDs)
```

Rules: no prose, one line per fact, IDs instead of descriptions (D1, R2 …), and deleted facts are removed rather than struck through.

## B. Device sessions (each wake → sync)

| Layer | Technique |
|---|---|
| Encoding | CBOR, integer keys |
| Content | Notifications ≤ 96 bytes; the server shortens with AI ("Coffee time!" rather than a paragraph) |
| Telemetry | Delta + threshold, hourly roll-up on the server |
| Transport | One batched request per wake; TLS session resumption |
| Server log | Raw telemetry rolled up hourly; COPY events are never rolled up, because they are the user's own words |
