# SESSION REPORT — LOT® EMAIL v1
## Date: 2026-11-22 · Branch: claude/determined-turing-66w9np
### Session Type: Feature — LOT® Email (Log → Sync, Cohort Dating, LOT Community)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                       ║
║  LOT® EMAIL v1 · THE SIMPLEST MAIL                              ║
║  November 22, 2026 · Scheduled routine                          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. TASK

> Design, develop, and deploy the simplest LOT® Email system in LOT® style.
> Compose a message in Log with a command "/email to Hitomi."
> New messages appear in Sync.
> Incorporate with Lot Chat (Sync) and Cohort Dating through LOT Community.
> Push a full .MD report after each session.

## 2. WHAT SHIPPED

| Surface | Behaviour |
|---|---|
| **Log** | Type `/email to Hitomi. See you at the walk.` in any log. An `EMAIL:` block appears under the entry: `TO` (resolved member), `BODY` (char count), `[Send]`. Sending is explicit — autosave never sends. After send, `/email` is rewritten to `✉` in the log, so it can't fire twice and the log keeps a record. |
| **Sync** | New `Email:` inbox block at the top of Sync (above the chat). Live via SSE `lot_email`. Unread mail is full strength, read mail fades to `text-acc/40`. Inbox is marked read after a 2.5s dwell. Click a name to reply inline. The inbox also shows for members who don't have chat access, so every recipient can read their mail. |
| **Cohort Dating** | Each expanded match in the `Cohort:` widget gets an **Email** button. It opens an inline compose box and sends by user id (`source: cohort`). |
| **/system** | Help screen lists `/email  /email to Name. message — LOT® Email, lands in their Sync`. |

### Grammar

```
/email to Hitomi. message          recipient ends at . : , — or newline
/email to Hitomi S. message        surname or initial narrows it down
/email Hitomi: message             "to" is optional
/email to Hitomi                   message can go on the next lines
multi-line body
```

### Recipient resolution (LOT Community)

1. Case-insensitive match on first name (plus a surname prefix if one is given). Excludes yourself and suspended members.
2. One match → resolved.
3. Several matches → if you've already exchanged mail with exactly one of them, that person wins. Otherwise the block lists `Hitomi K. · Hitomi S. — add an initial`, and a send returns HTTP 409 with the candidates.
4. No match → `NO MEMBER NAMED HITOMI` / HTTP 404.

## 3. ARCHITECTURE

```
Log NoteEditor ──/email──▶ LogEmailComposer ──GET /api/emails/resolve──▶ email-api
                                  │ POST /api/emails {toUserId, body, source}
                                  ▼
                         lot_emails (Postgres) ──sync.emit('lot_email')──▶ SSE /api/sync
                                                                      │ (sender + receiver only)
Cohort widget ──Email──▶ POST /api/emails                              ▼
Sync ◀── EmailInbox ◀── GET /api/emails + SSE ── POST /api/emails/read
```

No SMTP and no external relay: mail never leaves LOT.

### API (`src/server/routes/email-api.ts`, mounted under `/api`)

| Method | Path | Notes |
|---|---|---|
| GET | `/emails` | Last 50 (inbox + sent), plus the `unread` count |
| GET | `/emails/resolve?to=` | `{status: ok\|none\|ambiguous, user?, candidates}` |
| POST | `/emails` | `{to? \| toUserId?, body, source: log\|cohort\|sync}`. Returns 400 for an empty body, 403 for a suspended sender, 404 for an unknown recipient, 409 for an ambiguous name, 429 over 30 sends/hour |
| POST | `/emails/read` | `{ids?}`, or no ids to mark the whole inbox read |

### Data — migration `20261122120000_add-lot-emails.cjs`

`lot_emails(id uuid pk, senderId → users, receiverId → users, body text, source varchar(16), readAt, createdAt, updatedAt)` with indexes `(receiverId, createdAt)` and `(senderId, createdAt)`. Rows cascade-delete with the user.

## 4. FILES

New:
- `migrations/20261122120000_add-lot-emails.cjs`
- `src/server/models/lot-email.ts`
- `src/server/routes/email-api.ts`
- `src/shared/utils/lot-email.ts` — pure parser shared by client and server
- `src/client/components/EmailInbox.tsx`
- `src/client/components/LogEmailComposer.tsx`

Modified: `models/index.ts`, `routes/api.ts` (registers the routes and forwards SSE `lot_email` only to the two people on the envelope), `shared/types` (`LotEmail`, `PublicLotEmail`, `SyncEvents.lot_email`), `client/queries.ts`, `Sync.tsx`, `Logs.tsx`, `CohortConnectWidget.tsx`.

## 5. VERIFICATION

| Check | Result |
|---|---|
| Parser (11 cases: initials, colon, newline body, mid-note, unicode `Zoë-Ann`, `/emailing`, already-sent `✉`, missing terminator) | PASS |
| `tsc` server | 0 errors |
| `tsc` client | 0 new errors (104 remain; all pre-existing in `intentionEngine.ts`, `MicroGameWidget.tsx`, `UserMetricsWidget.tsx`, `Sync.tsx` chat listeners) |
| `yarn build` (client + server) | GREEN |
| E2E on local Postgres 16: migration up/down/up, resolve ok/ambiguous/initial/suspended/`%` injection, send 200/409/400/self-404/suspended-404, SSE emit to receiver, ambiguity broken by correspondence, inbox + unread, mark read, reply, suspended sender 403, rate limit 429 | 17/17 PASS |
| Browser click-through of the UI | NOT RUN (needs an authenticated session) |

## 6. DEPLOY NOTES

- Production runs `migrations:up` as part of `production:run`, so the `lot_emails` table is created on the next deploy.
- **Repo hygiene:** `.gitignore` line 50 (`server/`) also matches `src/server/**`. The new server files were committed with `git add -f`, the same way the existing ones are tracked. Recommend changing that rule to `/server/`.
- **Finding:** the older `DirectMessage` (`/dm`) feature has no migration for `direct_messages`, and `/api/sync` never forwards `direct_message` events. LOT® Email does not depend on it.

## 7. NEXT

- Unread badge (`✉ 2`) on the Sync nav tab.
- Optional outbound copy to real email through the existing Resend integration (opt-in per member).
- Threading view (`/email` history with one person).
