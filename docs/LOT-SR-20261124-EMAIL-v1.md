# SESSION REPORT — LOT® EMAIL v1
## Date: 2026-11-24 · Branch: claude/determined-turing-srvwwj
### Session Type: Feature build — simplest LOT® Email (Log → Sync)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                       ║
║  LOT® EMAIL v1 · COMPOSE IN LOG · RECEIVE IN SYNC               ║
║  November 24, 2026 · Scheduled routine                          ║
║  Authorized: S-2 // VADIK MARMELADOV                            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. TASK

> Design, develop, and deploy the simplest LOT® Email system in LOT® style.
> Compose a message in Log with a command "/email to Hitomi." New messages appear in Sync.
> Incorporate with LOT Chat (Sync) and Cohort Dating through LOT Community.

## 2. DESIGN DECISION — ONE TRANSPORT, TWO SURFACES

LOT already has a `direct_messages` table and a `/dm/:userId` thread view. LOT® Email v1
**reuses it as the transport** — no new table, no migration, no outside mail server.

| Surface | Role |
|---|---|
| **Log** | Compose: `/email to Hitomi.` + body lines → `EMAIL:` block → **Send** |
| **Sync** | Receive: `EMAIL · N RECEIVED` inbox above the chat, updates live |
| **DM thread** `/dm/:userId` | Reply: click a sender in the Sync inbox |
| **Cohort Connect** (Community / dating matches) | "Send message" opens the DM thread; shows the hint `or in Log: /email to <Name>` |

An email and a DM are the same record, so a conversation started in Log, Sync,
or a cohort match is one thread.

## 3. COMMAND GRAMMAR

```
/email to Hitomi.             recipient = first word, body = next lines
/email to Hitomi see you at 7 recipient = first word, body = rest of line + next lines
/email to Hitomi K: hello     colon → multi-word recipient (first + last-name prefix)
```

- Case-insensitive, can sit anywhere in a log entry. Trailing `.,;!?` is stripped from the name.
- **Nothing sends while you type.** The `EMAIL:` block shows TO / BODY, and only the **Send** button sends.
- Body max 2000 chars (`MAX_EMAIL_LENGTH`, the same limit as DMs).
- `/system` help now lists `/email to [name]`.

## 4. RECIPIENT RESOLUTION (server)

1. `toUserId` given → direct.
2. Otherwise a case-insensitive first-name match (plus a last-name prefix if given), excluding the sender. The input is escaped before it goes into `ILIKE`.
3. One match → send. Several → prefer the one person the sender has already written to or heard from.
4. Still more than one → `409 AMBIGUOUS RECIPIENT` with candidates shown as `First L.`. The composer turns these into buttons.
5. No match → `404 RECIPIENT NOT FOUND`.

## 5. FILES

| File | Change |
|---|---|
| `src/shared/utils/email-command.ts` | **NEW** — pure parser `parseEmailCommand()`, `MAX_EMAIL_LENGTH` |
| `src/client/components/EmailComposer.tsx` | **NEW** — `EMAIL:` block under the Log editor, with Send, disambiguation, and SENT / error states |
| `src/server/routes/api.ts` | `POST /api/email`, `GET /api/email/inbox`; SSE now forwards `direct_message` **only to sender and receiver**; DM sender name shortened to `First L.` |
| `src/client/queries.ts` | `useSendEmail`, `useEmailInbox` |
| `src/client/components/Logs.tsx` | Renders `<EmailComposer>`; `/system` help line |
| `src/client/components/Sync.tsx` | `EmailInbox` (latest 7, live, click → DM thread). Shown to every user, including those without chat access |
| `src/client/components/CohortConnectWidget.tsx` | "Send message" → `/dm/:userId` (it used to only open Sync); `/email to <Name>` hint |
| `scripts/tests/test-email-command.ts` + `yarn test:email` | 9 parser cases |

## 6. FIX TO EXISTING BEHAVIOR

The SSE stream never forwarded `direct_message` events, so DM threads did **not** update
live, even though `DirectMessageThread` listened for them. Now they are forwarded, and
only to the two people in the conversation (privacy-scoped, unlike `chat_message`, which goes to everyone).

## 7. VERIFICATION

```
yarn test:email          ALL 9 PASS
yarn server:build        OK (tsc + ESM fix)
yarn client:build        OK (only the old duplicate-key warning in badges.ts)
tsc --noEmit (client)    104 errors before → 104 after · 0 new
```

**Not tested this session:** no live Postgres or second account was available in the
container, so the full send → SSE → inbox path was not run end to end. Build and type checks pass.

## 8. DEPLOY STATUS

`app.yaml` deploys from `master`. This routine may push only to
`claude/determined-turing-srvwwj`, so the feature is **pushed to that branch and ready
to merge**. Production gets it when the branch is merged to `master`. No DB migration is needed.

## 9. NEXT (v2 candidates)

- Unread state (`readAt` column, needs a migration) and an unread count on the Sync tab.
- Optional outbound real email (the project already has an email util) for recipients who are offline.
- Restrict name lookup to the LOT Community / cohort graph if it gets abused.
- `/email` autocomplete from cohort matches.

---
*LOT® — Made in the USA · brand.lot-systems.com*
