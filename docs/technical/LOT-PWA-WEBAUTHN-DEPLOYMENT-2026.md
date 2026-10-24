================================================================================
LOT SYSTEMS CORPORATION
LOT PWA — WebAuthn Passkey Deployment
Summer-Autumn 2026
================================================================================

Classification: RESTRICTED // S-2 EYES
Authorized by: S-2 // VADIK MARMELADOV
Date: 14 June 2026

Reference: W3C Web Authentication Level 2 Recommendation
https://www.w3.org/TR/webauthn-2/

================================================================================

## Executive Summary

LOT operates a passwordless PWA (Progressive Web App) using email-code
authentication with 30-day session cookies. WebAuthn passkeys are the natural
next step: they eliminate email dependency during login, resist phishing at the
cryptographic level, and deliver a native-app login experience inside the PWA
standalone shell.

LOT's current architecture requires no password migration. The deployment is
purely additive — passkeys become a new way to create a session alongside the
existing email-code flow. No existing user flow is disrupted.

--------------------------------------------------------------------------------

## Current Authentication Architecture

```
Email Code Flow (live, production)
──────────────────────────────────
1. User enters email         → POST /auth/send-code
2. 6-digit code sent         → Resend API
3. User submits code + token → POST /auth/email/code
4. Session created           → 64-char hex token in auth_token cookie
5. JWT wraps user ID         → HS256, 30-day expiry
6. Each request              → Cookie → JWT verify → Session lookup → req.user
```

- No passwords stored. No OAuth.
- Brute-force protection: 5 failed attempts → 15-min IP lockout
- Credential stuffing detection: 5+ different emails from same IP
- Session model: token, userId, fingerprint, IP, expiresAt, lastUsedAt
- PWA manifest: standalone display, portrait, HTTPS

--------------------------------------------------------------------------------

## What WebAuthn Adds

WebAuthn (FIDO2) replaces shared secrets with asymmetric public-key
cryptography. The private key never leaves the user's device. The server
stores only the public key — a database breach yields nothing usable.

```
Passkey Flow (proposed)
───────────────────────
1. User opens login page     → Conditional UI shows passkey in autofill
2. User taps passkey         → Biometric / PIN verification (local)
3. Authenticator signs       → Challenge signed with private key
4. Server verifies           → Signature checked against stored public key
5. Session created           → Same auth_token cookie, same session model
```

| Property              | Email Code        | Passkey                       |
|-----------------------|-------------------|-------------------------------|
| Phishing resistance   | None              | Cryptographic origin binding  |
| Login time            | ~30 seconds       | ~8 seconds                    |
| External dependency   | Resend API        | None                          |
| Offline re-auth       | Impossible        | Biometric (cached session)    |
| Multi-factor          | Email (1FA)       | Possession + biometric (2FA)  |
| NIST compliance       | —                 | AAL2 (SP 800-63-4, 2025)     |

--------------------------------------------------------------------------------

## Deployment Phases

### Phase 1 — Infrastructure (Summer 2026)

No user-facing changes. Backend preparation only.

**Database**: Add WebAuthnCredentials table via Sequelize migration.

```
WebAuthnCredentials
───────────────────
id              UUID        PK
userId          UUID        FK → Users.id
credentialId    TEXT        Base64URL, unique
publicKey       BYTEA      COSE-encoded public key
counter         INTEGER    Sign counter (clone detection)
transports      JSONB      ["internal", "hybrid"]
backedUp        BOOLEAN    Whether synced (passkey vs device-bound)
deviceType      VARCHAR    singleDevice | multiDevice
deviceName      VARCHAR    User-friendly label
createdAt       TIMESTAMP
lastUsedAt      TIMESTAMP
```

**Server routes** (Fastify, 4 endpoints):

```
POST /api/webauthn/register/options    → generateRegistrationOptions()
POST /api/webauthn/register/verify     → verifyRegistrationResponse()
POST /api/webauthn/login/options       → generateAuthenticationOptions()
POST /api/webauthn/login/verify        → verifyAuthenticationResponse()
```

**Dependencies**:
- @simplewebauthn/server v13.x (Node.js, TypeScript, MIT)
- @simplewebauthn/browser (client companion)

**Configuration**:
- RP ID: `lot-systems.com` (set once, never change — credentials are
  permanently bound to this domain)
- RP Name: `LOT`
- Attestation: `none` (consumer app, no device verification needed)
- Algorithms: ES256 (-7), RS256 (-257)
- Resident key: `preferred` (enables Conditional UI / autofill)
- User verification: `preferred` (biometric when available)

**Session reuse**: After successful WebAuthn verification, create a Session
record and set the auth_token cookie using the exact same path as the
email-code flow. No changes to session infrastructure.

**Recovery codes**: Generate 10 one-time recovery codes at passkey enrollment.
Store hashed (bcrypt). Recovery codes are the backup path — not email, which
would re-introduce the phishing vector for passkey-only users.

### Phase 2 — Opt-In Enrollment (Late Summer 2026)

User-facing. Additive only.

After a successful email-code login, prompt:

```
Faster login available.
Use biometric authentication on this device.
[Enable] [Not now]
```

- Run registration ceremony on acceptance
- Store credential in WebAuthnCredentials
- Allow multiple passkeys per user (phone + laptop + security key)
- Credential management UI in Settings: list passkeys, rename, delete,
  show last-used date
- Email-code auth remains fully functional as fallback

**Enrollment trigger**: Post-login prompt achieves 2x higher adoption than
burying enrollment in Settings (industry data: 75% of enrollments come from
a single post-login auto-trigger).

### Phase 3 — Passkey-First Login (Autumn 2026)

Login page upgrade. No flow removal.

1. Add `autocomplete="username webauthn"` to email input
2. On page load, check `PublicKeyCredential.isConditionalMediationAvailable()`
3. If available, call `navigator.credentials.get({ mediation: "conditional" })`
4. Passkey appears in browser autofill dropdown alongside email input
5. User taps passkey → signed in (no email, no code, no waiting)
6. "Sign in with email code" link remains below for non-passkey users

```
┌─────────────────────────────────────────┐
│                                         │
│  Email                                  │
│  ┌───────────────────────────────────┐  │
│  │ user@example.com                  │  │
│  ├───────────────────────────────────┤  │
│  │ 🔑 LOT — user@example.com       │  │  ← Conditional UI
│  │    Passkey from iCloud Keychain   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Continue with email code]             │
│                                         │
└─────────────────────────────────────────┘
```

### Phase 4 — Optional Email-Code Removal (Post-Autumn 2026)

For users with 2+ registered passkeys who opt in:

- Disable email-code auth on their account
- Recovery via recovery codes only
- Reduces attack surface to zero shared secrets
- Never forced — always user-initiated

--------------------------------------------------------------------------------

## Platform Support Matrix

WebAuthn is supported by ~95% of global browsers.

| Environment               | WebAuthn | Passkeys | Conditional UI |
|---------------------------|----------|----------|----------------|
| Chrome Android (PWA)      | Yes      | Yes      | Yes            |
| Safari iOS (PWA)          | Yes      | Yes      | Yes            |
| Chrome Desktop            | Yes      | Yes      | Yes            |
| Safari macOS              | Yes      | Yes      | Yes            |
| Firefox Desktop (122+)    | Yes      | Yes      | Yes            |
| Edge Desktop              | Yes      | Yes      | Yes            |

**Sync providers** (how passkeys travel across devices):
- iCloud Keychain: all Apple devices on same Apple ID
- Google Password Manager: Android, iOS, macOS, Windows via Chrome
- 1Password / Bitwarden / Dashlane: all platforms via extensions

**PWA-specific**:
- WebAuthn works in standalone PWAs on both Android and iOS
- Cannot be called from service workers (document context only)
- iOS EU: standalone mode removed (DMA, iOS 17.4+); WebAuthn still works
  in Safari tab fallback
- iOS ITP may evict sessions after 7 days of inactivity — passkey
  re-authentication is the solution, not the problem

--------------------------------------------------------------------------------

## Security Properties

1. **Origin binding**: Credentials cryptographically bound to `lot-systems.com`.
   Cannot be replayed on a phishing domain. The browser embeds the real origin
   into the signed response — a fake site produces an invalid signature.

2. **No shared secrets**: Private key never leaves the authenticator. Server
   stores only the public key. Database breach exposes nothing usable.

3. **Replay-proof**: Server generates a fresh cryptographic challenge for each
   ceremony. Single-use, 5-minute TTL.

4. **Clone detection**: Monotonic sign counter increments on each authentication.
   Counter mismatch = cloned authenticator alert. (Note: synced passkeys may
   not reliably increment counters across devices — do not rely solely on
   counter checks for synced credentials.)

5. **Multi-factor in one gesture**: Passkey = possession (device) + inherence
   (biometric) or knowledge (PIN). Meets NIST SP 800-63-4 AAL2.

6. **AiTM resistance**: Even an adversary-in-the-middle proxy that relays
   everything cannot succeed — the signature binds the response to the actual
   origin the browser navigated to.

--------------------------------------------------------------------------------

## Known Constraints

| Constraint                          | Impact on LOT                         | Mitigation                          |
|-------------------------------------|---------------------------------------|-------------------------------------|
| RP ID change breaks all credentials | Must commit to lot-systems.com        | Set once at Phase 1, never change   |
| Cannot revoke from user's device    | Deleted passkey still shows in picker | Show clear error on auth attempt    |
| iOS EU standalone removed           | PWA opens as Safari tab               | Cosmetic only; WebAuthn works       |
| Cross-ecosystem isolation           | iCloud ≠ Google Password Manager      | Allow multiple passkey registrations|
| Recovery when all passkeys lost     | User locked out                       | Recovery codes at enrollment        |
| Windows 10 no Conditional UI        | No autofill passkeys                  | Manual "Use a passkey" button       |
| Service worker restriction          | No background re-auth                 | All auth in page context (standard) |

--------------------------------------------------------------------------------

## Dependencies

```
@simplewebauthn/server   v13.3.1   MIT   Server-side registration/auth
@simplewebauthn/browser  v13.x     MIT   Client-side credential API wrapper
```

No other dependencies required. The libraries handle CBOR parsing, COSE key
decoding, challenge generation, and signature verification internally.

**Zero interaction with the AI layer**: Together AI, memory stories, QIE,
psychological profiles, and all CQGS modules are unaffected. WebAuthn only
touches the authentication entry point.

--------------------------------------------------------------------------------

## Timeline

```
June 2026       Research complete. This document.
July 2026       Phase 1: Database migration + server routes + tests
August 2026     Phase 2: Post-login enrollment prompt + Settings UI
September 2026  Phase 3: Conditional UI on login page
October 2026    Phase 4: Optional email-code removal for passkey users
```

--------------------------------------------------------------------------------

## References

W3C Web Authentication: An API for accessing Public Key Credentials
Level 2 — W3C Recommendation, 8 April 2021
https://www.w3.org/TR/webauthn-2/

W3C Web Authentication Level 3 — Candidate Recommendation, 26 May 2026
https://www.w3.org/TR/webauthn-3/

FIDO Alliance — Passkeys
https://fidoalliance.org/passkeys/

SimpleWebAuthn — TypeScript WebAuthn Library
https://simplewebauthn.dev/

NIST SP 800-63-4 — Digital Identity Guidelines (2025)

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
LOT SYSTEMS CORPORATION
================================================================================
