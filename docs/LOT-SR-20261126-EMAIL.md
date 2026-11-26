# SESSION REPORT — LOT® EMAIL v1
## Date: 2026-11-26 · Branch: claude/determined-turing-xoqj9v
### Session Type: Feature Build: LOT® Email (Log → Sync · Cohort Dating via LOT Community)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION · SESSION REPORT                        ║
║  LOT® EMAIL v1 · THE SIMPLEST MAIL                               ║
║  November 26, 2026 · Scheduled routine run                       ║
║  Authorized: S-2 // VADIK MARMELADOV                             ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. TASK

> Design, develop, and deploy the simplest LOT® Email system in LOT® style.
> Compose a message in Log with the command `/email to Hitomi.`
> New messages appear in Sync.
> Incorporate with LOT Chat (Sync) and Cohort Dating through LOT Community.
> Push a full .MD report after each session.

## 2. STATUS BOARD

| Item                                        | Status                    |
|---------------------------------------------|---------------------------|
| `/email to <name>` command in Log           | DONE                      |
| Delivery to Sync (MAIL block, live via SSE) | DONE                      |
| Reply inside Sync + "Write in Log"          | DONE                      |
| Cohort Dating → LOT Email hand-off          | DONE                      |
| DB migration (`lot_emails`)                 | DONE (additive only)      |
| Server typecheck                            | GREEN                     |
| Production build (`yarn build`)             | GREEN                     |
| API tests (16 checks, real Postgres)        | 16/16 PASS                |
| Browser test (Chromium, full app)           | PASS                      |
| Pushed to `claude/determined-turing-xoqj9v` | DONE                      |
| Deployed to production                      | PENDING: needs merge to `master` |

Production deploys from `master` (`app.yaml`). The Dockerfile runs `yarn migrations:up`
on boot, so the new table is created automatically when this branch is merged.

---

## 3. HOW IT WORKS

### 3.1 Compose in Log

```
/email to Hitomi.
Coffee on Friday? The new ceramics shop opens at 10.
```

* The command line is `/email to <name>`. Trailing punctuation is ignored (`Hitomi.` → `Hitomi`).
* The body is every line below the command. An inline form also works: `/email to Hitomi: hello`.
* An **EMAIL:** block appears under the primary log:

```
EMAIL:      TO      Hitomi Tanaka
            BODY    10 words
            [ Send ]  Delivered to Sync
```

* If more than one member matches the name, the block shows `CHOOSE:` followed by each
  candidate. The sender picks one, and the system never guesses.
* **Nothing is sent until Send is pressed.** On success, the command line is replaced in
  the log with a receipt, so the Log keeps a record:

```
✉ LOT Email to Hitomi Tanaka · sent 04:19
Coffee on Friday? The new ceramics shop opens at 10.
```

* `/system` help now lists `/email to [name]`.

### 3.2 Receive in Sync

A **MAIL:** block sits at the top of Sync, above the chat:

```
MAIL · 1 NEW:   Inbox  Sent
                ● Vadik M     Coffee on Friday? The new ce…    a few seconds ago
```

* Tapping a message opens it and marks it read. The view shows the time and its origin
  (`via Log`, `via Sync` or `via Cohort`).
* **Reply** sends inline from Sync (`source: sync`, threaded with `replyToId`).
* **Write in Log** opens Log with `/email to <name>` already typed.
* Updates arrive live over the existing `/api/sync` SSE stream (`lot_email` event).
* Mail is visible to **every** member, including members without Sync chat access
  (Usership/Onyx/Legacy/R&D/Admin). Those members see MAIL plus the usual chat-access note.

### 3.3 Cohort Dating via LOT Community

In the Cohort Connect widget, the member action **"Send message"** is now **"LOT Email"**.
It records the `cohort_message_initiated` signal (now with `channel: lot_email`), opens Log
with `/email to <First Last>` pre-filled, and shows `VIA  Cohort · LOT Community` in the
composer. The email is stored with `source: cohort`, and the recipient sees `via Cohort`.

---

## 4. ARCHITECTURE

```
 Log (NoteEditor, primary)                    Sync
 ┌──────────────────────────┐                ┌──────────────────────────┐
 │ /email to Hitomi.        │                │ MAIL: Inbox · Sent       │
 │ body…                    │                │ ● Vadik M  Coffee on…    │
 │ EMAIL: TO/BODY/[Send]    │                │   [Reply] Write in Log   │
 └───────────┬──────────────┘                └──────────▲───────────────┘
             │ POST /api/lot-email                      │ SSE lot_email
             ▼                                          │ (sender+receiver only)
 ┌───────────────────────────────────────────────────────┴──────────────┐
 │ routes/lot-email.ts → models/lot-email.ts → table lot_emails        │
 └──────────────────────────────────────────────────────────────────────┘
             ▲
 Cohort Connect widget ── composeLotEmail(name,'cohort') ─► Log draft
```

### 4.1 API (all behind the existing `/api` auth gate)

| Method | Path                          | Purpose                                      |
|--------|-------------------------------|----------------------------------------------|
| GET    | `/api/lot-email`              | `{ inbox[50], sent[20], unread }`            |
| GET    | `/api/lot-email/recipients?name=` | Composer preview: `{ candidates[] }`     |
| POST   | `/api/lot-email`              | Send `{ to \| receiverId, body, subject?, source?, replyToId? }` |
| POST   | `/api/lot-email/:id/read`     | Mark read (recipient only)                   |

Responses: `400` empty or too long (max 5000 chars) · `404` no such member, yourself, or
a suspended member · `409` ambiguous name + `candidates` · `429` over 30 emails per hour.

### 4.2 Schema: `lot_emails` (migration `20261126120000_add-lot-emails.cjs`)

`id uuid PK · senderId → users · receiverId → users (CASCADE) · subject varchar(200)? ·
body text · source varchar(16) 'log'|'sync'|'cohort' · replyToId uuid? · readAt? ·
createdAt · updatedAt`, plus indexes on `(receiverId, createdAt)` and `(senderId, createdAt)`.
The migration is additive only, and no existing data is touched.

### 4.3 Guardrails

* Recipient lookup is limited to LOT members. It excludes the sender and anyone tagged `Suspended`.
* SQL `LIKE` wildcards in names are escaped, so a `%` name matches nothing.
* Suspended senders are blocked (403). Inbox items from suspended senders are hidden.
* SSE delivery is filtered per connection to the sender and receiver only.
* A reply thread can only point at an email the sender was part of.

---

## 5. FILES

**New**
* `src/server/models/lot-email.ts`: model
* `src/server/routes/lot-email.ts`: routes, recipient resolution, rate limit
* `migrations/20261126120000_add-lot-emails.cjs`: table + indexes
* `src/client/utils/lotEmail.ts`: pure `/email` parser + receipt
* `src/client/stores/lotEmail.ts`: draft hand-off atom (`composeLotEmail`) + unread atom
* `src/client/components/LogEmailComposer.tsx`: EMAIL: block in Log
* `src/client/components/SyncMail.tsx`: MAIL: block in Sync

**Changed**
* `src/server/models/index.ts`: register `LotEmail`
* `src/server/routes/api.ts`: register routes; SSE forwards `lot_email` + `direct_message` to participants only
* `src/client/queries.ts`: `useLotEmail`, `useSendLotEmail`, `useMarkLotEmailRead`, `getLotEmailRecipients`
* `src/client/components/Logs.tsx`: composer mount, draft hand-off, `/system` help line, **autosave fix (see §6)**
* `src/client/components/Sync.tsx`: MAIL block (for all members)
* `src/client/components/CohortConnectWidget.tsx`: "LOT Email" action

---

## 6. BUGS FOUND AND FIXED DURING VERIFICATION

1. **Log autosave could wipe a log (pre-existing; now fixed).** The 7 s autosave debounce
   still held the old text while an immediate save (the `/email` receipt, and the same
   pattern in `/prayer` and `/story`) updated the log. When `log.text` changed, the effect
   saved that stale value. An empty stale value **deleted the log**. Fix: autosave now
   skips when the debounced value is not the current text, and the newer debounce saves
   the current text. Browser re-test: the receipt persists.
2. **Draft hand-off dropped on first mount.** The editor's mount-time "sync from server"
   effect reset the text after the draft was inserted. Fix: draft consumption is deferred
   one tick. Re-test: Log opens with `/email to Vadik` pre-filled.
3. **`GhostButton` ignores `className`.** Candidate selection and the Inbox/Sent underline
   now style an inner `<span>`.

### Noted, not changed (outside this task)

* `direct_messages` has **no migration** in `migrations/`. The DM model exists, but
  production may not have the table. `direct_message` SSE events were never forwarded to
  clients before this session. They are now forwarded to the two participants only.
* `badges.ts` has duplicate keys (`elixir_found`, among others). These are existing esbuild
  warnings and do not break the build.
* The client `tsc` run shows about 104 pre-existing type errors, none in the files added here.

---

## 7. VERIFICATION LOG

**API (fastify inject, real Postgres 16, compiled `dist/`): 16/16 PASS**

```
PASS recipients "Hitomi." → 2 candidates (Hitomi Tanaka,Hitomi Sato)
PASS ambiguous name → 409 + candidates
PASS send by full name → delivered, source=log
PASS prefix match + source=cohort
PASS suspended member not reachable → 404
PASS cannot email self → 404
PASS empty body → 400
PASS LIKE wildcard escaped → 404
PASS recipient inbox shows 1 unread
PASS mark read
PASS unread → 0
PASS reply from Sync threads to parent
PASS non-recipient cannot mark read
PASS third party cannot see others mail
PASS hourly limit → 429
PASS SSE lot_email emitted
```

**Browser (Chromium, full server, two members): PASS**

* Vadik types `/email to Hitomi.` plus a body in Log. EMAIL: block shows two candidates;
  he picks Hitomi Tanaka and presses Send.
* The log persists as `✉ LOT Email to Hitomi Tanaka · sent 04:19` + body (checked in DB).
* Hitomi opens Sync. MAIL: shows `Vadik M` unread; opening it shows the body,
  `via Log`, Reply and Write in Log.
* "Write in Log" opens Log with `/email to Vadik` pre-filled and the composer active.
* No page errors.

**Migration:** all 22 migrations applied cleanly to an empty Postgres 16, including `lot_emails`.

**Build:** `yarn build` passes (client + server, ESM import fix-up).

---

## 8. NEXT STEPS

1. **Deploy:** merge `claude/determined-turing-xoqj9v` into `master`. Migrations run on boot.
2. Optional nudge: send an outside email via Resend ("You have a new LOT Email"), with a
   setting to opt out.
3. Unread count on the Sync nav pill (`lotEmailUnread` atom is already in place).
4. Add the missing `direct_messages` migration, or retire DMs in favour of LOT Email.
