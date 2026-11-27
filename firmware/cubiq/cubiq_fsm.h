/*
 * CUBIQ(tm) Quantum Cube — gesture state machine v0.4, firmware reference (C99).
 * Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R12.md §03 (F96-F100).
 * Ports the R08 §05 FSM v0.3 state table and simulator (scripts/cubiq-r08-fsm-sim.py) from "a table
 * a script checks" to "the loop the cube runs": the table is enforced, the invariants are guards,
 * the spring is tracked as a cam position (not inferred from the state name), and inputs arrive
 * at arbitrary times.
 *
 * Changes from v0.3 (R12 §03):
 *   F96  the spring is a quantity: cam_us = motor time stored in the cam/rocker. v0.3 keyed spring
 *        energy on the state name, so f1 (fall during ARM) "ended at rest with zero spring" while the
 *        worm held the cam part-way up. v0.4: SAFE_HOLD -> DECOCK -> SAFE_HOLD once the cube is still.
 *   F97  fall detection is masked from HOP_STROKE to LAND (every flight IS free fall); a flight that
 *        overruns its nominal time by 50 % is the real fall (FLIGHT -> SAFE_HOLD).
 *   F98  v.1 JUMP path: cock to the JUMP level; on a failed re-check with room for a LEAP, decock
 *        PARTIALLY to the LEAP level and re-lock (DECOCK -> LOCK, new edge in the table).
 *   F99  G12 is consulted before ARM for a JUMP, and every LEAP/JUMP landing feeds it.
 *   F100 latency budgets for JUMP (the v.0 1.5 s budget cannot hold a 3.1 s arm).
 * Timing constants are EST (R08 §05, R10 §06); MULE-1 replaces them (B32).
 */
#ifndef CUBIQ_FSM_H
#define CUBIQ_FSM_H

#include <stdint.h>

#include "cubiq_contract.h"
#include "cubiq_g12.h"

typedef enum {
    S_IDLE, S_SETTLE, S_NUDGE, S_PRECHARGE, S_HOP_STROKE, S_ARM, S_LOCK, S_ARMED, S_UNLOCK, S_DECOCK,
    S_FIRE, S_FLIGHT, S_LAND, S_RESET, S_RECOVER, S_SAFE_HOLD, S_COUNT
} cubiq_state;

/* Timing, microseconds (EST). */
#define T_SETTLE_US 2000000
#define T_NUDGE_US 600000
#define T_PRECHARGE_US 1000000
#define T_HOP_STROKE_US 12100
#define T_LOCK_US 110000
#define T_UNLOCK_US 110000
#define T_RECHECK_US 50000
#define T_FIRE_US 56000
#define T_RESET_US 200000
#define T_RECOVER_US 300000
#define T_ARMED_MAX_US 10000000
#define T_LEAP_STROKE_US 10800
#define T_JUMP_STROKE_US 15300    /* 10 mm rod at 1.30 m/s (R10 §06) */
#define T_FLIGHT_HOP_US 90305     /* 10 mm rise */
#define T_FLIGHT_LEAP_US 117743   /* 17 mm rise (R08 FSM v0.3) */
#define T_FLIGHT_J150_US 230148
#define T_FLIGHT_J200_US 265752
#define T_ARM_LEAP_V0_US 1100000  /* v.0 snail cam, 43 mJ */
#define T_ARM_LEAP_V1_US 1000000  /* v.1 rocker cocked to the LEAP level, EST */
#define T_ARM_J150_US 3100000     /* R10 §06: 2.8-3.4 s */
#define T_ARM_J200_US 4100000     /* R10 §06: 3.7-4.5 s */
#define TIP_RECOVER_DDEG 250      /* R03: RECOVER above 25 deg */
#define RECOVER_MAX 2

typedef struct {
    uint8_t fall;            /* free-fall confirmed (R06: >= 150 ms) */
    uint8_t lifted;          /* G7: in a hand / not on a surface */
    uint8_t qi_lost;         /* pad link lost: pad credit withdrawn */
    uint8_t imu_still;
    uint8_t sleeve_ok;       /* RESET: sleeve flush (B27) */
    uint8_t airborne;        /* still in the air (touchdown not detected) */
    uint8_t contact;         /* touched in flight */
    uint8_t gyro_sat;
    int32_t free_ahead_mm;   /* ToF runway ahead, at the ARMED re-check */
    int32_t tip_ddeg;        /* tilt from level, 0.1 deg */
    int32_t pitch_rate_mdps; /* mean gyro pitch rate over the flight */
    int64_t flight_us;       /* true ballistic flight time; 0 = nominal */
} cubiq_inputs;

typedef struct {
    cubiq_gesture gesture;
    int32_t range_mm;        /* JUMP only: 150 or 200 */
    uint8_t v1;              /* device is a v.1 (rocker, JUMP-capable) */
    uint8_t pad_credit;      /* the decision relied on the home-pad credit (R08 §06) */
    int32_t runway_hop_mm, runway_leap_mm, runway_jump_mm;
} cubiq_plan;

#define CUBIQ_TRACE_MAX 96

typedef struct cubiq_fsm cubiq_fsm;
typedef void (*cubiq_enter_hook)(void *ctx, cubiq_fsm *f, cubiq_state s);

struct cubiq_fsm {
    cubiq_state state;
    int64_t t, entry, end;   /* end < 0: open-ended */
    int64_t cam, cam_entry, decock_target, decock_dur;
    cubiq_gesture gesture;   /* the gesture being executed (after any downgrade) */
    int32_t range_mm;
    cubiq_plan plan;
    cubiq_gesture downgrade; /* pending substitute after UNLOCK/DECOCK */
    cubiq_gesture pending;   /* redirected gesture after a re-decide */
    uint8_t redecide, qi_handled, fall_latch, waiting, overrun, abort_to_idle, safe_decock;
    uint8_t fired, downgraded;
    int recover_n;
    int64_t armed_entry, liftoff, flight_true, flight_nom;
    int64_t first_motion;    /* -1 until the first motion */
    int64_t armed_max_seen;
    int illegal, fwd_after_fall;
    const char *reason;      /* why the FSM changed the gesture, static string or NULL */
    cubiq_g12 *g12;          /* NULL on a v.0 */
    int last_g12;            /* last cubiq_g12_result, -1 none */
    cubiq_enter_hook hook;
    void *hook_ctx;
    struct { uint8_t s; int64_t t; } trace[CUBIQ_TRACE_MAX];
    int n;
};

void cubiq_fsm_init(cubiq_fsm *f, cubiq_g12 *g12, cubiq_enter_hook hook, void *ctx);
/* Start a decided gesture from IDLE. Returns 0, or -1 if refused (not IDLE, or fall latched). */
int cubiq_fsm_start(cubiq_fsm *f, const cubiq_plan *p, const cubiq_inputs *in);
/* Advance to time now (>= f->t) with the inputs as they are at now. */
void cubiq_fsm_poll(cubiq_fsm *f, const cubiq_inputs *in, int64_t now);
/* After f->redecide: the gesture the contract chose with the new state (SETTLE/NUDGE/HOP/NONE). */
void cubiq_fsm_redirect(cubiq_fsm *f, cubiq_gesture g);
/* Operator + self-test (R06 G8): SAFE_HOLD with a relaxed spring -> IDLE, fall latch cleared. */
int cubiq_fsm_self_test(cubiq_fsm *f);
int cubiq_fsm_at_rest(const cubiq_fsm *f);
const char *cubiq_state_name(cubiq_state s);

#endif
