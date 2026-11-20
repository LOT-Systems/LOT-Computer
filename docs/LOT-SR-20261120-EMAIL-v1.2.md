# SESSION REPORT — LOT® EMAIL v1.2
## Date: 2026-11-20 · Branch: claude/determined-turing-syfzer
### Session Type: Feature Build — consolidate v1, add Reply + private routing from Sync chat

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                        ║
║  LOT® EMAIL v1.2 · WRITE IN LOG · READ IN SYNC · REPLY ANYWHERE  ║
║  November 20, 2026                                               ║
║  Authorized: S-2 // scheduled routine                            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 0. STATUS LINE

```
BUILD ........ GREEN   (yarn build: client + server)
TSC SERVER ... 0 errors
TSC CLIENT ... 104 errors — identical to pre-existing baseline, 0 new
PARSER ....... 11/11 cases
DEPLOY ....... NOT LIVE — app.yaml deploys from master; this branch is unmerged
```

## 1. SESSION TASK

Design, develop and deploy the simplest LOT® Email in LOT® style.
Compose in Log with `/email to Hitomi`. New messages appear in Sync.
Incorporate with LOT Chat (Sync) and Cohort Dating through LOT Community.

## 2. CONTEXT — WHY THIS SESSION CONSOLIDATES INSTEAD OF RESTARTING

This routine has run daily since early November. **Each run built LOT® Email from
scratch on its own `claude/determined-turing-*` branch. None has been merged.**
Recent iterations: `czna2q` (11-09), `ej868f`, `9rmu3f`, `lotbrs`, `pe5gwz`, `nyg1it`,
`2kljb6`, `9gibo3`, `sklc9y` (11-17), `ddmlfy` (11-18), `xeu3gd` (11-19), plus older
`zl0j44` and `relaxed-hamilton-eRBVA`.

This session did not write a fresh copy. It **cherry-picked `xeu3gd` (52719768)**, the newest
iteration and the one on the same master base (9f2b88c), checked it, and added v1.2 on top.
This branch now holds everything needed for a single merge.

## 3. SYSTEM (v1 inherited + v1.2)

| Layer | Behaviour |
|---|---|
| Storage | Reuses `direct_messages`. No migration, no env vars. |
| Compose — Log | `/email to Hitomi: body` → `EMAIL:` block · `Ctrl+Enter` / `Send` · receipt `✉ SENT TO HITOMI K. · 09:05` stamped into the log. |
| **Reply — Log (v1.2)** | `/email reply: body` → goes to whoever mailed you last. The block shows `TO  LAST SENDER (REPLY)`. |
| Inbox — Sync | `MAIL · n` block above the chat: `✉ From · preview · NEW · COHORT · time`. Click → thread `LOT® Email · Name`. Members without chat access still see it. |
| **Compose — Sync chat (v1.2)** | Typing `/email to Hitomi: …` or `/email reply: …` in the public chat box **sends private mail and never posts to chat**. A hint line shows `PRIVATE MAIL TO HITOMI · NOT POSTED TO CHAT`. If several members match, buttons appear to pick one. |
| Cohort Dating | Cohort Connect **Email** button → LOT Email thread with that match. Inbox rows from cohort matches are tagged `COHORT`. |
| Real-time | SSE `direct_message` is sent only to the sender and receiver. |
| Ledger | `lot_email_sent` log event on every send. |

### Grammar

```
/email to Hitomi: See you at the meditation hall at 7.
/email to Hitomi K.: disambiguate by last initial
/email to Hitomi
multi-line body on following lines
/email reply: Thank you — yes.
```

## 4. CHANGES THIS SESSION

| File | Change |
|---|---|
| `src/client/utils/lotEmail.ts` | `/email reply` grammar → `{ reply: true }` draft |
| `src/server/routes/api.ts` | `POST /api/email` accepts `reply: true` → resolves latest sender; `404 NO MAIL TO REPLY TO` |
| `src/client/queries.ts` | `useSendEmail` payload gains `reply` |
| `src/client/components/Logs.tsx` | Reply dispatch, `TO LAST SENDER (REPLY)`, reply 404 message, `/system` help line |
| `src/client/components/Sync.tsx` | `/email` in chat box → private send, status/hint line, ambiguity buttons |
| `docs/LOT-SR-20261120-EMAIL-v1.2.md` | This report |

Inherited from `xeu3gd` (cherry-picked): `SyncMail.tsx`, `lotEmail.ts`, email routes, SSE fan-out fix,
Cohort **Email** button, DM thread header, `docs/LOT-SR-20261119-EMAIL-v1.md`.

## 5. FINDING — PRIVACY LEAK CLOSED

Before v1.2, a member used to the Log command who typed `/email to Hitomi: <private text>`
into the **Sync chat** box would have **posted it to public chat**. That input now goes
out as private mail.

## 6. VERIFICATION

```
yarn build                          ✓ green
tsc -p tsconfig.server.json         ✓ 0 errors
tsc -p tsconfig.json (client)       ✓ 104 (baseline 104, 0 new)
parser                              ✓ 11/11
  "/email to Hitomi: hello there"        → Hitomi · "hello there"
  "notes\n/email to Hitomi\nl1\nl2"      → Hitomi · "l1\nl2"
  "/email to Hitomi hi!"                 → Hitomi · "hi!"
  "/email to Hitomi K.: dinner?"         → "Hitomi K" · "dinner?"
  "/email reply: thank you"              → reply · "thank you"
  "/email reply\nsee you at 7"           → reply · "see you at 7"
  "/email reply"                         → reply · "" (Send disabled)
  "/email replyall x" · "/email to " · "just a log" · "a/email to x" → null
```
Not tested: a live send against a database. The build container has no Postgres.

## 7. DEPLOY

App Platform deploys **master**. To go live: merge `claude/determined-turing-syfzer`.
No migration, no new env vars. A PR was not opened because none was requested.

## 8. RECOMMENDATION TO S-2

1. **Merge this branch** (or tell the routine to open a PR). Until then, each daily run rebuilds the same feature.
2. Mark earlier `determined-turing-*` LOT Email branches **SUPERSEDED** and prune them.
3. v2 candidates: a server-side `readAt` column (unread state across devices) · opt-in delivery to members' real inboxes via the Resend integration already in place · a `/community` route (the Cohort widget links to it, but it doesn't exist).

---
*LOT® Email v1.2 — write in Log, read in Sync, reply anywhere.*
