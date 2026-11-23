# SESSION REPORT — LOT® EMAIL v1
## Date: 2026-11-23 · Branch: claude/determined-turing-mua1cf
### Session Type: Feature — the simplest LOT® Email system

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                        ║
║  LOT® EMAIL v1 · LOG → COMMUNITY → SYNC                          ║
║  November 23, 2026 · Scheduled routine                           ║
║  Authorized: S-2 // VADIK MARMELADOV                             ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. TASK

> Design, develop, and deploy the simplest LOT® Email system in LOT® style.
> Compose a message in Log with a command "/email to Hitomi."
> New messages appear in Sync.
> Incorporate with Lot Chat (Sync) and Cohort Dating through LOT Community.

## 2. DESIGN — SIMPLEST POSSIBLE

**No new table and no migration.** LOT® Email runs on the existing `direct_messages` table and
its model. Mail and DMs are the same record, so a mail thread is also a DM thread (`/dm/:userId`).

```
  LOG                      SERVER                         SYNC
  ───                      ──────                         ────
  /email to Hitomi: hi ──▶ POST /api/email            ──▶ Mail: block (inbox)
  [EMAIL: block · Send]    resolve "Hitomi" in         ◀── SSE direct_message
                           LOT Community (joined,          (receiver/sender only)
                           not suspended)
                           → DirectMessage.create
                           → sync.emit('direct_message')
                           → Log event direct_message_sent
                             (channel: lot_email)

  COHORT (dating / matching) ── "Email" button ──▶ seeds "/email to <Name>: " in Log
                              ── "Send message" ──▶ opens /dm/:userId thread
```

### Command grammar (Log)

| Typed in Log                         | To          | Body                    |
|--------------------------------------|-------------|-------------------------|
| `/email to Hitomi: Tea at 5?`        | Hitomi      | Tea at 5?               |
| `/email to Hitomi` + lines below     | Hitomi      | following lines         |
| `/email to Hitomi K. see you`        | Hitomi K.   | see you                 |
| `/email to Hitomi Tanaka: hi`        | Hitomi Tanaka | hi                    |

Typing the command shows an **EMAIL:** block in the Terminal Grid style used by `/fast` and `/phys`:

```
TO              HITOMI
BODY            9 CHARS
CHANNEL         LOT COMMUNITY · SYNC
[ Send ]
```

Nothing sends while you type. Mail goes out only when you press **Send**. After sending, the
command line is rewritten in place to `✉ Email to Hitomi: …`. The log keeps a record of it, and
the command cannot fire twice. The block then shows `SENT  HITOMI K. · 14:32`.

### Recipient resolution (LOT Community)

1. Search by first name (case-insensitive). An optional last name or initial narrows it with a prefix match.
2. Only joined members (`joinedAt` set) qualify. Members tagged `suspended` are excluded, and so is the sender.
3. Ranking: people you have written to before (+2), then the same city as you (+1, a cohort-adjacent signal), then the most recently seen.
4. LIKE wildcards (`%`, `_`, `\`) in the name are escaped, so `/email to %` cannot match everyone.

### Sync inbox

- A **Mail:** block sits above the chat. It shows the 5 most recent messages, and "All N" expands to 20.
- Mail is shown even to members without chat access (non-Usership), because mail is personal and not part of the public chat.
- Unread means received since this device last left Sync. That timestamp is kept in localStorage (`lot:email:lastSeenAt`), only as a convenience on each device.
- Mail arrives live: an SSE `direct_message` event addressed to me refetches the inbox.
- Clicking a sender opens the `/dm/:userId` thread. The hint line says how to reply: `/email to name`.

## 3. FILES

| File | Change |
|------|--------|
| `src/server/routes/api.ts` | `POST /api/email`, `GET /api/email/inbox`; SSE now forwards `direct_message` **only to sender/receiver** |
| `src/client/utils/logTriggers.ts` | `parseEmailCommand()` pure parser |
| `src/client/components/Logs.tsx` | EMAIL: compose block, Send, in-place disarm, draft seeding, `/system` help line |
| `src/client/components/SyncMail.tsx` | **new**, Sync inbox block |
| `src/client/components/Sync.tsx` | mounts `<SyncMail />` (chat and non-chat views) |
| `src/client/stores/lotEmail.ts` | **new**, `$emailDraftTo` handoff atom + `composeEmailInLog()` |
| `src/client/components/CohortConnectWidget.tsx` | "Email" button; "Send message" now opens the DM thread instead of the generic Sync page |
| `src/client/queries.ts` | `useEmailInbox`, `useSendEmail` |

## 4. SIDE FIX: DM live delivery

Before this session the server emitted `direct_message` but the `/api/sync` SSE switch had no
case for it. Live DMs never reached anyone, so `DirectMessageThread` could only update on refetch.
The new case forwards the event only when `receiverId` or `senderId` matches the connected user.
Nothing private is broadcast to other users.

## 5. VERIFICATION

| Check | Result |
|-------|--------|
| `tsc -p tsconfig.server.json --noEmit` | **0 errors** |
| Client `tsc --noEmit` | no new errors in touched files (107 pre-existing errors in the repo before the change, 104 after) |
| `yarn build` (client + server) | **green** |
| `parseEmailCommand` cases (7) | all pass, including the disarmed `✉ Email to …` → `null` |

Not exercised: an end-to-end send against a live Postgres. No database is available in the session container.

## 6. DEPLOY

The App Platform (`app.yaml`) deploys from `master`. This session pushed to
`claude/determined-turing-mua1cf`. **To go live, merge this branch to `master`.** That needs no
migration and no new environment variables.

## 7. NEXT (v2 candidates)

- Server-side read receipts: a `readAt` column on `direct_messages` would replace the localStorage unread count.
- An `/inbox` Log command that prints the last 3 messages as a Terminal Grid block.
- An unread dot on the Sync nav tab, fed by the SSE `direct_message` event.
- Optional outbound delivery to real email through the existing Resend `src/utils/email.ts`, for recipients who opt in.
- Handling ambiguous names: when more than one member matches, offer "Hitomi K. / Hitomi T." in the EMAIL block.

---
`LOT® EMAIL v1 · STATUS: GREEN · AWAITING MERGE TO MASTER`
