```
╔══════════════════════════════════════════════════════════════════════╗
║                  LOT SYSTEMS — TERMINAL SESSION REPORT               ║
╠══════════════════════════════════════════════════════════════════════╣
║  ID       : LOT-SR-20261113-EMAIL                                    ║
║  DATE     : 2026-11-13                                               ║
║  CLASS    : ENGINEERING                                              ║
║  MODULE   : LOT® EMAIL v1 (simplest)                                 ║
║  S-2      : VADIK MARMELADOV                                         ║
╚══════════════════════════════════════════════════════════════════════╝
```

## INTAKE

```
INPUT    : Scheduled routine — "Design, develop, and deploy the simplest LOT® Email
           system in LOT® style. Compose in Log with '/email to Hitomi.' New messages
           appear in Sync. Incorporate with LOT Chat (Sync) and Cohort Dating through
           LOT Community. Push a full .MD report after each session."
CLASS    : ENGINEERING
BRANCH   : claude/determined-turing-pe5gwz (from master 98971f2)
ROUTE    : src/ (feature) + docs/ (this report)
```

## DESIGN — ONE STORE, THREE SURFACES

```
                 ┌───────────────────── direct_messages (existing table) ─────────────────────┐
                 │                                                                             │
 LOG ──"/email to Hitomi"──▶ EMAIL: block ──Send──▶ POST /api/lot-email ──▶ row + SSE event   │
                                                                   │                           │
 SYNC ◀── MAIL [n NEW]: block ◀── GET /api/lot-email/inbox ◀───────┘ (live via direct_message)│
   │                                                                                           │
   └── click row ──▶ /dm/:userId  (existing DirectMessageThread — replies)                    │
                                                                                               │
 COMMUNITY / COHORT CONNECT ──"Email"──▶ Sync opens pre-addressed composer ───────────────────┘
```

| Decision | Why |
|---|---|
| Reuse `direct_messages` — no new table, no migration | Simplest. Email, DM thread and Cohort outreach read one source of truth; zero DB risk on deploy. |
| No SMTP / Resend | LOT® Email is member-to-member inside LOT. External mail can be layered on later. |
| Explicit **Send** button in Log | Log autosaves while typing; sending on keystroke would fire half-written mail. |
| Recipient resolved by name server-side | Typing "Hitomi" is the whole UX. Ambiguity → 409 with candidates → pick button. |
| "NEW" via per-viewer `lotEmailLastSeenAt` (persistent atom) | No `readAt` column needed for v1. |

## COMMAND GRAMMAR (Log)

```
/email to Hitomi                     → composer opens, body = following lines
Good morning. Tea at 8?

/email to Hitomi Tanaka: Tea at 8?   → full name + inline body (":" or "—" separator)
/email to hitomi see you soon        → case-insensitive, inline body
/email to Hito …                     → first-name prefix fallback (≥3 chars) if no exact match
```

After send, the command + body are replaced in the log with a trace line:
`✉ Sent to Hitomi Tanaka: Good morning. Tea at 8?` — the Log stays a journal.
`/system` help now lists `/email to Name`.

## CHANGES

| File | Change |
|---|---|
| `src/server/routes/api.ts` | `GET /lot-email/inbox`, `POST /lot-email` (name or `receiverId`, 404/409/403 paths, suspended users excluded, 2000-char cap, `direct_message_sent` log with `kind: lot_email`). **SSE fix:** `/sync` now forwards `direct_message` events — previously DMs were emitted but never delivered live. Delivery is private: only sender + receiver connections receive the event. |
| `src/client/utils/lotEmail.ts` (new) | Pure parser `parseLotEmail` + `stampLotEmailSent`. |
| `src/client/components/LotEmail.tsx` (new) | `LotEmailCompose` (Log `EMAIL:` block), `LotEmailInbox` (Sync `MAIL:` block, `COHORT` tag on senders who are cohort matches, quick composer), `lotEmailComposeTo` atom. |
| `src/client/components/Logs.tsx` | Composer under the primary Log editor; `/system` help line. |
| `src/client/components/Sync.tsx` | `MAIL:` block above LOT Chat. |
| `src/client/components/CohortConnectWidget.tsx` | "Send message" → **Email**: pre-addresses the Sync composer to that cohort member (signal `cohort_message_initiated` kept). |
| `src/client/queries.ts` | `useLotEmailInbox`, `useSendLotEmail`, types. |

## CHECKS

```
CHECK A  tsc server (tsconfig.server.json)   : PASS — 0 errors (baseline 0)
CHECK B  tsc client (tsconfig.json)          : PASS — 0 new errors; all remaining errors
                                               pre-existing (Logs.tsx 101/105/3795/3862,
                                               Sync.tsx implicit-any in chat listeners)
CHECK C  yarn build (client + server)        : PASS — "Client build completed", ESM fixed
CHECK D  parser unit run (tsx, 6 cases)      : PASS — single/full name, inline/multiline
                                               body, no false match on "/emailto"
```

## DEPLOY STATUS

```
PUSHED   : origin/claude/determined-turing-pe5gwz
PROD     : NOT YET LIVE — production ships from master. This branch needs a PR + merge
           (not opened automatically; routine has no approval to merge).
DB       : no migration required.
```

## OPEN ITEMS / NEXT

1. Not exercised against a live DB/browser in this session — smoke-test on staging:
   Log `/email to <real member>` → Send → recipient sees `MAIL [1 NEW]:` in Sync live.
2. "Cohort Dating": there is no dating module in the repo yet; v1 integrates through the
   existing Cohort Connect widget (Community). A dedicated dating surface would plug into
   `lotEmailComposeTo` the same way.
3. v2 candidates: `readAt` column for true unread state, Sync tab badge, optional external
   delivery (Resend) for members who are offline.

## LEXICON

- **LOT® Email** — member-to-member message composed in Log, read in Sync, stored as a DM.
- **MAIL:** — Sync inbox block. **EMAIL:** — Log composer block.
