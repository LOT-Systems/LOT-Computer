/*
 * CUBIQ(tm) Quantum Cube — signal contract, firmware reference (C99).
 * Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R11.md §02 (F84), contract text in R07 §06,
 *       R08 §06 (v0.4 pad credit), R09 §02 (v0.5 input rule), R10 §02 (v0.6-draft).
 *
 * The third implementation of decide(), after the Python spec scripts and the TypeScript
 * platform reference (src/shared/cubiq/signal-contract.ts). The cube is the authority on what
 * it does with a signal (R09 F64); this file is the shape that authority takes on the MCU.
 *
 *   - no malloc, no recursion outside the bounded JSON decoder, no floating point in the
 *     decision path except the two state readings that are physical (free_ahead_mm, level_deg)
 *   - time is integer microseconds since 1970-01-01T00:00:00Z; the timestamp profile and the
 *     calendar checks are written out, not delegated to a libc parser (R09 F66: two libraries
 *     disagreeing is exactly how v0.4 broke)
 *   - CUBIQ_V05 is the adopted contract; CUBIQ_V06_DRAFT is R10's draft, selectable, never the
 *     default (R10 D50)
 */
#ifndef CUBIQ_CONTRACT_H
#define CUBIQ_CONTRACT_H

#include "cubiq_json.h"

typedef enum { CUBIQ_V05 = 5, CUBIQ_V06_DRAFT = 6 } cubiq_version;

typedef enum {
    EV_PERFORMED, EV_REJECTED, EV_EXPIRED, EV_HELD, EV_SAFE_HOLD, EV_DEFERRED,
    EV_FAULT /* the STATE (firmware's own data) was malformed: a firmware bug, never a wire error */
} cubiq_event;

typedef enum { G_NONE, G_SETTLE, G_NUDGE, G_HOP, G_LEAP, G_JUMP } cubiq_gesture;

typedef struct {
    cubiq_event event;
    cubiq_gesture gesture;
    const char *reason; /* static string, or NULL */
} cubiq_decision;

/* sig and st are node indices of JSON objects inside arena a (sig may be any JSON value). */
cubiq_decision cubiq_decide(cubiq_version v, const cj_arena *a, int32_t sig, int32_t st);

/* Profile YYYY-MM-DDTHH:MM[:SS[.ffffff]](Z|+-HH:MM) + calendar checks. 1 on success. */
int cubiq_parse_ts(const char *s, int32_t len, int64_t *us_out);

const char *cubiq_event_name(cubiq_event e);
const char *cubiq_gesture_name(cubiq_gesture g);

#endif
