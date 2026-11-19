# SESSION REPORT — LOT® EMAIL v1
## Date: 2026-11-19 · Branch: claude/determined-turing-xeu3gd
### Session Type: Feature Build — the simplest LOT® Email (Log → Sync)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                        ║
║  LOT® EMAIL v1 · COMPOSE IN LOG · RECEIVE IN SYNC                ║
║  November 19, 2026                                               ║
║  Authorized: S-2 // scheduled routine                            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. SESSION TASK

Design, develop and deploy the simplest LOT® Email in LOT® style.
Compose in Log with `/email to Hitomi`. New messages appear in Sync.
Incorporate with LOT Chat (Sync) and Cohort Dating through LOT Community.

## 2. DESIGN — SIMPLEST POSSIBLE

| Decision | Choice | Why |
|---|---|---|
| Storage | Reuse `direct_messages` table | Zero migrations, zero deploy risk. A LOT Email *is* a member-to-member message. |
| Compose surface | Log (primary entry) | Writing is already where the operator lives. |
| Delivery surface | Sync → `MAIL` block above chat | One inbox, next to the community chat. |
| Thread view | Existing `/dm/:userId` route, relabelled `LOT® Email · Name` | No new screens. |
| Addressing | By first name (+ optional last-initial) | `/email to Hitomi`, `/email to Hitomi K.` |
| Unread state | Per-device `localStorage` last-seen timestamp | No schema change; tags newer mail `NEW`. |

## 3. GRAMMAR

```
/email to Hitomi: See you at the meditation hall at 7.

/email to Hitomi
Multi-line body
goes on the following lines.

/email to Hitomi K.: disambiguate by last initial
```

- Text written **before** the command stays a private log entry — never mailed.
- `Ctrl+Enter` (or the `Send` button in the `EMAIL:` block) transmits.
- On delivery, the command is replaced in the log with a receipt:
  `✉ SENT TO HITOMI K. · 09:05` followed by the body — the log keeps the record.
- `/system` help lists `/email to`.

## 4. RECIPIENT RESOLUTION (server)

1. Case-insensitive exact first-name match (`ILIKE`, wildcards escaped).
2. Optional last-name prefix narrows the set.
3. Multiple matches → prior correspondents win.
4. Still ambiguous → `409` with up to 10 candidates (`Name L. · City`); Log shows them as buttons.
5. None → `NO MEMBER NAMED HITOMI`.
Only first name + last initial + city are exposed — never email addresses.

## 5. INTEGRATIONS

| System | Integration |
|---|---|
| **Sync (LOT Chat)** | `SyncMail` inbox renders at top of Sync: `✉ From · preview · NEW · COHORT · time`. Click opens the thread. Visible even to members without chat-tier access (mail is private, not chat). Live refresh on incoming SSE. |
| **Cohort Dating** | `CohortConnectWidget` "Send message" → renamed **Email**, now opens the LOT Email thread with that match (previously dumped the user on the Sync chat with no recipient). |
| **LOT Community** | Inbox rows from cohort matches carry a `COHORT` tag (read from cached `/api/cohorts`, never triggers the heavy analysis). |
| **Log events** | Each send writes `lot_email_sent` log event (metadata: message id, receiver id). |

## 6. BUG FIXED EN ROUTE

**Real-time DMs were never delivered.** The SSE fan-out in `GET /api/sync` had no
`direct_message` case, so `DirectMessageThread`'s live listener never fired — replies only
appeared after reload. Added a case that writes the event **only to sender and receiver**
(privacy-scoped, unlike `chat_message` broadcasts).

## 7. FILES

| File | Change |
|---|---|
| `src/server/routes/api.ts` | SSE `direct_message` case; `GET /api/email/resolve`, `POST /api/email`, `GET /api/email/inbox` |
| `src/client/utils/lotEmail.ts` | NEW — pure parser `parseEmailCommand`, `stampEmailSent` |
| `src/client/components/SyncMail.tsx` | NEW — Sync inbox |
| `src/client/components/Sync.tsx` | Mounts `SyncMail` (both chat and gated views) |
| `src/client/components/Logs.tsx` | `EMAIL:` compose block, Ctrl+Enter send, receipt stamping, `/system` entry |
| `src/client/queries.ts` | `useEmailInbox`, `useSendEmail` |
| `src/client/components/CohortConnectWidget.tsx` | Cohort "Email" → LOT Email thread |
| `src/client/components/DirectMessageThread.tsx` | Header `LOT® Email · Name` |

## 8. VERIFICATION

```
yarn build                       ✓ client + server green
tsc (server)                     ✓ 0 errors
tsc (client)                     ✓ 0 new errors (104 pre-existing, was 106)
parser cases                     ✓ 8/8
  "/email to Hitomi: hello there"         → to Hitomi · body "hello there"
  "notes\n/email to Hitomi\nl1\nl2"       → to Hitomi · body "l1\nl2" · notes kept private
  "/email to Hitomi hi!"                  → to Hitomi · body "hi!"
  "/email to Hitomi K.: dinner?"          → to "Hitomi K" · body "dinner?"
  "/email to " / "just a log" / "a/email to x" → null
```
Not exercised: live end-to-end send against a database (no DB in the build container).

## 9. DEPLOY STATUS

App Platform (`app.yaml`) deploys from **master**. This session pushed to
`claude/determined-turing-xeu3gd`. **Merge to master to go live** — no migration, no env vars required.

## 10. NEXT (v2 candidates)

- Server-side read receipts (`readAt` column) replacing per-device last-seen.
- `/email reply` from Log to the most recent sender.
- Optional outbound delivery to real inbox (Resend is already wired in `src/server/utils/email.ts`) — opt-in per member.
- `/community` route referenced by Cohort widget does not exist yet.

---
*LOT® Email v1 — write in Log, read in Sync.*
