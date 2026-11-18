# SESSION REPORT — LOT® EMAIL v1
## Date: 2026-11-18 · Branch: claude/determined-turing-ddmlfy
### Session Type: Feature Build: LOT® Email (Log → Sync, Cohort, Community)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — SESSION REPORT                       ║
║  LOT® EMAIL v1 · THE SIMPLEST LETTER                            ║
║  November 18, 2026 · Scheduled routine                          ║
║  Authorized: S-2 // VADIK MARMELADOV                            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. SESSION CONTEXT

**Task (scheduled prompt):** Design, develop and deploy the simplest LOT® Email system
in LOT® style. You compose a message in Log with the command `/email to Hitomi.` New messages
appear in Sync. It connects to LOT Chat (Sync) and Cohort Dating through the LOT Community.
Push a full .MD report after each session.

**Base state:** `9f2b88c` (Badge Codex v33). DirectMessage model and `/api/direct-messages`
already existed. Before this session, live `direct_message` SSE events were emitted on the server
but **never relayed** to any client (the SSE switch had no case for them).

---

## 2. DESIGN: ONE LETTER, THREE SURFACES

```
 LOG                          SERVER                         SYNC
 ───                          ──────                         ────
 /email to Hitomi.            POST /api/email                EMAIL:
 Tea on Thursday?   ──Send──▶ resolve "Hitomi" in community  Vadik  Tea on Thursday?  2m
                              → DirectMessage "✉ …"   ──SSE─▶ (live, receiver only)
 ✉ Sent to Hitomi T. · 14:32  → emit lot_email + direct_message
                                                             DM thread shows same letter
 COHORT: [Email] ──────────▶ prefills "/email to <Name>." in primary Log (exact receiverId)
```

**Principles**
- **No new table, no migration.** A LOT® Email is a `DirectMessage` whose text starts with
  the marker `✉ `. The same letter shows in the Sync inbox and in the 1:1 DM thread (LOT Chat).
- **Log is the outbox.** After sending, the command line is replaced by
  `✉ Sent to <Name> · HH:mm`, so the Log keeps a record and the composer closes.
- **Privacy line.** Text written *above* the command stays private in the Log. Only the inline
  text and the lines *below* `/email to …` are sent.
- **Silence by default.** The Sync inbox renders nothing while it is empty.

### Command grammar

| Input                                   | To              | Body                  |
|-----------------------------------------|-----------------|-----------------------|
| `/email to Hitomi.` + next lines        | Hitomi          | next lines            |
| `/email to Hitomi: tea on Thursday?`    | Hitomi          | tea on Thursday?      |
| `/email Hitomi Tanaka.` + next lines    | Hitomi Tanaka   | next lines            |
| `/email to Hitomi see you soon`         | Hitomi          | see you soon          |
| `/email` · `/email to` · `/emailx …`    | (no composer)   | n/a                   |

### Recipient resolution (LOT Community)
1. A `receiverId` handed over from Cohort is used directly.
2. Otherwise the server matches `firstName ILIKE` (plus `lastName ILIKE` for two words) and
   excludes the sender. Matches are ordered by `lastSeenAt DESC`.
3. With one match, the letter is sent. With several, the server prefers the unique match in
   the sender's city. If it is still ambiguous it returns **409** with up to 5 candidates, and
   the Log shows `SEVERAL MATCHES, ADD A LAST NAME: …`.
4. With no match, it returns **404** and the Log shows `NO LOT MEMBER NAMED "…"`.

---

## 3. FILES

| File | Change |
|------|--------|
| `src/shared/utils/lot-email.ts` | **new**: marker, `parseEmailCommand`, `formatLotEmail`, `isLotEmail`, `lotEmailText` (pure) |
| `src/server/utils/lot-email.ts` | **new**: `buildEmailRecipientWhere`, `pickEmailRecipient` (escapes `%`/`_`) |
| `src/server/routes/api.ts` | `POST /api/email`, `GET /api/email/inbox`. SSE now relays `direct_message` + `lot_email` **only to sender/receiver** |
| `src/client/queries.ts` | `useEmailInbox`, `useSendEmail`, `LotEmailRecord` |
| `src/client/components/Logs.tsx` | `EMAIL:` composer block (TO / preview / Send / status). Cohort handoff. `/system` help line |
| `src/client/components/SyncEmailInbox.tsx` | **new**: `EMAIL:` inbox in Sync. Live via SSE, expand to read, "Reply in Log: /email to X." |
| `src/client/components/Sync.tsx` | Inbox mounted for **all** users, including those without chat access |
| `src/client/components/CohortConnectWidget.tsx` | `Email` button on expanded cohort member: prefills Log, signal `cohort_email_initiated` |
| `src/client/stores/lotEmail.ts` | **new**: `$pendingEmailTo` handoff atom |
| `src/client/utils/logTriggers.ts` | `email-compose` trigger (`/email`) |
| `scripts/tests/test-lot-email.ts` + `package.json` | `yarn test:lot-email` (11 cases) |

---

## 4. VERIFICATION

```
CHECK                                   RESULT
─────────────────────────────────────── ──────
yarn test:lot-email                     ALL 11 PASS
tsc (client) — new errors vs base       0   (104 pre-existing, identical set)
tsc (server)                            PASS
yarn build (client + server)            GREEN (only pre-existing duplicate-key warnings in badges.ts)
dist runtime import of lot-email libs   PASS (#server/utils/lot-email resolves; parser OK)
End-to-end against live DB / browser    NOT RUN (no database in session container)
```

---

## 5. SECURITY & PRIVACY NOTES

- **Fixed in passing:** DM and email SSE payloads are now delivered only to the two parties.
  Before this session they were never relayed at all, so live DM updates did not work.
- `ILIKE` wildcards in names are escaped, so `/email to %` cannot match every member.
- Body is capped at 2000 chars (same as DMs). The sender is always excluded from resolution.
- **Open item:** name-based addressing lets any signed-in member write to any member by first
  name, the same reach as the existing DM endpoint. If Email should be limited to cohort or
  connections only, add that gate in `POST /api/email`.

---

## 6. DEPLOY

Pushed to `claude/determined-turing-ddmlfy`. No migration is needed. The feature goes live when
this branch is merged and the normal build runs. No PR was opened (none requested).

---

## 7. NEXT

1. Unread count on the Sync tab (`✉ 2`), cleared on open.
2. Optional cohort-only gate for "Cohort Dating" mode, plus "letters from your cohort" grouping.
3. Reply-in-place: clicking "Reply" prefills the Log via `$pendingEmailTo` (the handoff is already built).
4. Optional outbound real email (Resend) for members who are offline more than 24h.

---

## 8. LEXICON

- **LOT® Email**: a DirectMessage marked `✉ `, written in Log and read in Sync.
- **Privacy line**: the `/email` command line. Text above it stays private, text below it is sent.
- **Handoff**: `$pendingEmailTo`, a one-shot draft passed from Cohort or Community into the primary Log.
