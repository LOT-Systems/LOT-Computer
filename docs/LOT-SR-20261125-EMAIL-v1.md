# SESSION REPORT — LOT® EMAIL v1
## Date: 2026-11-25 · Branch: claude/determined-turing-mgrex5
### Session Type: PRODUCT — LOT® Email (compose in Log, receive in Sync)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                       ║
║  LOT® EMAIL v1 · LOG → SYNC · PRIVATE                           ║
║  November 25, 2026 · Scheduled routine run                      ║
║  Authorized: S-2 // VADIK MARMELADOV                            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. TASK

> Design, develop, and deploy the simplest LOT® Email system in LOT® style.
> Compose a message in Log with a command "/email to Hitomi." New messages appear
> in Sync. Incorporate with LOT Chat (Sync) and Cohort Dating through LOT Community.
> Push a full .MD report after each session.

**Status:** BUILT · VERIFIED (local Postgres + live server + headless browser) · PUSHED to
`claude/determined-turing-mgrex5`. **Not deployed to production.** Production deploy
runs from master; this routine pushes only to its development branch. Production needs
a merge and the migration in §4 (it runs automatically on boot through
`yarn migrations:up` in the Dockerfile).

---

## 2. HOW IT WORKS

```
 LOG (primary entry)                       SYNC (recipient)
 ─────────────────────────────             ─────────────────────────────
 morning notes stay private                Mail  1 new
 /email to Hitomi.            ──POST──▶    ●  Vadik M.  See you at 8.
 See you at the studio at 8.  /api/email        │ click
                                                 ▼
 EMAIL:  TO     Hitomi K. · Tokyo          /dm/:userId thread (reply here)
         BODY   See you at the studio at 8.     │ open = read
         ROUTE  LOG → SYNC · PRIVATE            ▼
         [Send]                            ✉  Vadik M.  See you at 8.  (dimmed)

 after send, the Log line becomes:
 ✉ SENT TO HITOMI K. · 04:25
```

### Command grammar
| Form | Example |
|---|---|
| Multi-line | `/email to Hitomi.` + body on the following lines |
| One-line | `/email to Hitomi: see you at 8` |
| Without "to" | `/email Hitomi K` |
| Disambiguate | `/email to Hitomi K` (first name + last initial) |

- **Body = text AFTER the command only.** Journal text written above the command
  never leaves the Log (a privacy rule, verified in the browser test).
- If several operators share the name, the block lists them as `Hitomi K. · Tokyo` and
  `Hitomi S. · Kyoto` and the sender picks one.
- `/system` help now lists `/email to [name]`.

### Surfaces
| Surface | Change |
|---|---|
| **Log** | `EMAIL:` compose block (TO / BODY / ROUTE / STATUS / Send) under the primary entry |
| **Sync** | `Mail` strip above the chat: `● new` · `✉ read` · `→ sent`, with an unread count. Click a row to open the thread. Also shown to members **without** chat access, so everyone receives mail. |
| **DM thread** `/dm/:userId` | Reused as the reply surface. Opening it marks the mail read. Live delivery now works (see §5). The route now survives a hard reload. |
| **Cohort (Community)** | Cohort Connect's "Send message" button (it routed to public chat) is now **Email**, and opens the private thread with that match. A hint reads `Or write /email to [name] in Log.` This gives cohort dating and introductions a private channel. |

---

## 3. FILES

| File | Change |
|---|---|
| `src/client/utils/lotEmail.ts` | NEW: a pure `/email` parser (`parseEmailCommand`, `sentStamp`) |
| `src/client/components/EmailCompose.tsx` | NEW: Log compose block: debounced recipient resolution, picker, send, error states |
| `src/client/components/SyncMail.tsx` | NEW: Sync inbox strip. SSE-refreshed, links to `/dm/:userId` |
| `src/client/components/Logs.tsx` | Wires the compose block in, adds the SENT stamp and the `/system` help line, and **fixes a stale-debounce autosave race** (§5) |
| `src/client/components/Sync.tsx` | Mounts `SyncMail` for both chat and non-chat members |
| `src/client/components/CohortConnectWidget.tsx` | Email → private thread, plus a Log hint |
| `src/client/queries.ts` | `useEmailInbox`, `findEmailRecipients`, `useSendEmail` |
| `src/server/routes/api.ts` | `GET /api/email/recipients`, `POST /api/email`, `GET /api/email/inbox`; private `direct_message` SSE fan-out; thread GET marks mail read |
| `src/server/models/direct-message.ts`, `src/shared/types/index.ts` | `kind`, `subject`, `readAt` |
| `src/server/index.ts`, `src/server/server.ts` | `/dm/:userId` added to the SPA routes |
| `migrations/20261125120000_add-direct-messages-lot-email.cjs` | NEW (§4) |

---

## 4. DATA — MIGRATION

The `DirectMessage` model shipped **without a migration**, so the `direct_messages` table
may not exist in production. If it doesn't, existing DMs would already be failing there.
The new migration is fully idempotent:

- `CREATE TABLE IF NOT EXISTS direct_messages (…)`
- `ADD COLUMN IF NOT EXISTS kind VARCHAR(16) NOT NULL DEFAULT 'dm'`: `'dm'` for a thread reply, `'email'` for mail composed in Log
- `ADD COLUMN IF NOT EXISTS subject VARCHAR(200)`: reserved, currently null
- `ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMPTZ`: drives the ● NEW marker
- two indexes, `(receiverId, createdAt)` and `(senderId, receiverId, createdAt)`

Verified: all 22 migrations apply on a fresh Postgres 16 database, and `down` and `up` on the new one are clean.

---

## 5. DEFECTS FOUND & FIXED DURING THE SESSION

| # | Defect | Impact | Fix |
|---|---|---|---|
| D1 | `direct_messages` table had no migration | DMs could fail in any freshly migrated environment | Idempotent migration (§4) |
| D2 | SSE `/api/sync` never forwarded `direct_message` | DM threads never updated live | Private fan-out: only sender and receiver get the event (bystander test: 0 events) |
| D3 | **Autosave stale-debounce race** in `Logs.tsx`. An immediate save (Ctrl+Enter, `/prayer`, `/story`, `/email`) inside the 7s debounce window was followed by autosave writing the *old* snapshot back. When that snapshot was `""`, the server **deleted the note**. | Silent data loss in the Log. Reproduced in the browser with `/email`. Same code path as Ctrl+Enter, `/prayer` and `/story`. | Autosave skips a debounced value the live value has already moved past (`debouncedValue !== valueRef.current`). The debounce re-fires with the live value. |
| D4 | A server-side `direct_message_sent` Log row sorted above the open primary note, so `GET /logs` spawned a new empty note mid-compose | Lost the in-progress entry | `/api/email` writes no extra Log row: the sender's entry already carries `✉ SENT TO …`. (`POST /direct-messages` still writes one; it already existed and is left unchanged.) |
| D5 | `/dm/:userId` hard reload redirected to `/` | Thread links not reload-safe | Added to `KNOWN_CLIENT_ROUTES` |

---

## 6. SECURITY & ABUSE POSTURE

- Auth: all `/api/email/*` routes sit behind the existing authenticated `/api` scope (unauthenticated requests get 401, verified).
- Directory: resolution is exact on first name (case-insensitive), with an optional last-name prefix. The `% _ \` wildcards are stripped, so `?q=%` returns `[]` (verified). Only **joined, non-suspended** users are returned, never self, at most 6 results. Only the first name, last initial and city are exposed.
- Sending: suspended senders get 403. Sending to self or an unknown name returns 404. Empty bodies return 400. Bodies are capped at 2000 characters. The rate limit is **30 messages per hour per sender** (429), on top of the global 100 requests per minute per IP.
- Privacy: the SSE fan-out is filtered per connection. Journal text above the command is never sent.
- Known, unchanged: the existing `GET /direct-messages/:userId` returns the full `lastName` of the other party, and `POST /direct-messages` has no suspended or rate checks. Consider aligning both with `/api/email`.

---

## 7. VERIFICATION LOG

```
BUILD        yarn build ........................................... GREEN
             (client esbuild + server tsc; duplicate-key warnings in badges.ts are pre-existing)
TYPECHECK    tsconfig.server.json ................................. 0 errors
             tsconfig.json (client) ............................... 104 errors, ALL pre-existing (baseline 111)
MIGRATIONS   fresh PG16: 22/22 applied · new migration down/up ..... OK
PARSER       8 cases (multi-line, inline, no-"to", prefix text, /emailx, empty, 1-char, inline-after-dot) OK
API          resolve "Hitomi" → 2 · "Hitomi K" → 1 · "%" → 0 ........ OK
             ambiguous send → 409 + candidates ...................... OK
             send → 200 · empty → 400 · unknown → 404 · self → 404 ... OK
             unauth → 401 ........................................... OK
             inbox unread=1 → open thread → unread=0 ................ OK
SSE          receiver got direct_message: 1 · bystander: 0 .......... OK
BROWSER      Log compose → pick Hitomi K. → Send → SENT stamp saved .. OK
             entry pushed down, new empty primary ................... OK
             Sync inbox ● new → thread renders → ✉ read ............. OK
             hard reload /dm/:id stays on thread .................... OK
```

Screenshots: `docs/releases/lot-email-v1/`
- `01-log-compose.png`: the compose block, with two Hitomis to choose from
- `02-sync-inbox-new.png`: the recipient's Sync with `● new`
- `03-thread.png`: the thread
- `04-sync-inbox-read.png`: after reading (`✉`)

---

## 8. NEXT (NOT DONE — DELIBERATELY SIMPLE v1)

1. **Outbound real email** (Resend is already in `src/utils/email.ts`): an optional digest
   saying "You have N new LOT® mail", with opt-in under Settings. It was left out of v1 to avoid unsolicited email.
2. **Unread badge on the Sync tab pill** (`unread` is already in `/api/email/inbox`).
3. **Cohort-first resolution**: rank recipients who are cohort matches first, and show a "cohort" tag in Mail.
4. **Block and mute** per sender, before any wider rollout of cohort dating.
5. Align the legacy `POST /direct-messages` with the email guards (§6).

---

*LOT® Email v1 · Log → Sync · Private by default.*
