/* CUBIQ(tm) — gesture state machine v0.4. Spec in cubiq_fsm.h and R12 §03. No malloc, no float. */
#include "cubiq_fsm.h"

#include <stddef.h>

#define B(s) (1u << (s))

/* state -> allowed next states. v0.3 (R08 §05) plus the three v0.4 edges marked. */
static const uint32_t TABLE[S_COUNT] = {
    [S_IDLE] = B(S_SETTLE) | B(S_NUDGE) | B(S_PRECHARGE) | B(S_ARM) | B(S_IDLE) | B(S_SAFE_HOLD),
    [S_SETTLE] = B(S_IDLE),
    [S_NUDGE] = B(S_IDLE),
    [S_PRECHARGE] = B(S_HOP_STROKE) | B(S_IDLE) | B(S_SAFE_HOLD) | B(S_NUDGE),
    [S_HOP_STROKE] = B(S_FLIGHT),
    [S_ARM] = B(S_LOCK) | B(S_DECOCK) | B(S_SAFE_HOLD),
    [S_LOCK] = B(S_ARMED) | B(S_UNLOCK) | B(S_SAFE_HOLD),
    [S_ARMED] = B(S_FIRE) | B(S_UNLOCK) | B(S_SAFE_HOLD),
    [S_UNLOCK] = B(S_DECOCK) | B(S_SAFE_HOLD),
    [S_DECOCK] = B(S_IDLE) | B(S_PRECHARGE) | B(S_NUDGE) | B(S_SETTLE) | B(S_SAFE_HOLD)
                 | B(S_LOCK),                                   /* v0.4 F98: partial decock, re-lock */
    [S_FIRE] = B(S_FLIGHT),
    [S_FLIGHT] = B(S_LAND) | B(S_SAFE_HOLD),
    [S_LAND] = B(S_RESET) | B(S_RECOVER) | B(S_IDLE),
    [S_RESET] = B(S_IDLE) | B(S_RECOVER) | B(S_SAFE_HOLD),
    [S_RECOVER] = B(S_IDLE) | B(S_SAFE_HOLD) | B(S_RECOVER),
    [S_SAFE_HOLD] = B(S_SAFE_HOLD) | B(S_DECOCK)               /* v0.4 F96: relax a held spring */
                    | B(S_IDLE),                                /* v0.4: self-test exit (R06 G8) */
};

static const char *const NAMES[S_COUNT] = {
    "IDLE", "SETTLE", "NUDGE", "PRECHARGE", "HOP_STROKE", "ARM", "LOCK", "ARMED", "UNLOCK",
    "DECOCK", "FIRE", "FLIGHT", "LAND", "RESET", "RECOVER", "SAFE_HOLD"};

const char *cubiq_state_name(cubiq_state s) { return (s >= 0 && s < S_COUNT) ? NAMES[s] : "?"; }

int cubiq_fsm_at_rest(const cubiq_fsm *f) {
    return (f->state == S_IDLE || f->state == S_SAFE_HOLD) && f->end < 0 && !f->redecide;
}

static void go(cubiq_fsm *f, cubiq_state nxt, int64_t dur) {
    if (!(TABLE[f->state] & B(nxt))) {
        f->illegal++;
        nxt = S_SAFE_HOLD; /* an illegal edge is a firmware bug: stop, never improvise */
        dur = -1;
    }
    if ((nxt == S_ARM || nxt == S_LOCK) && f->fall_latch) f->fwd_after_fall++;
    if (nxt == S_FIRE) f->fired = 1;
    if (f->first_motion < 0 && (nxt == S_SETTLE || nxt == S_NUDGE || nxt == S_HOP_STROKE || nxt == S_FIRE))
        f->first_motion = f->t;
    if (f->state == S_ARMED) {
        int64_t armed = f->t - f->armed_entry;
        if (armed > f->armed_max_seen) f->armed_max_seen = armed;
    }
    f->state = nxt;
    f->entry = f->t;
    f->end = dur < 0 ? -1 : f->t + dur;
    if (f->n < CUBIQ_TRACE_MAX) {
        f->trace[f->n].s = (uint8_t)nxt;
        f->trace[f->n].t = f->t;
        f->n++;
    }
    if (f->hook) f->hook(f->hook_ctx, f, nxt);
}

void cubiq_fsm_init(cubiq_fsm *f, cubiq_g12 *g12, cubiq_enter_hook hook, void *ctx) {
    cubiq_fsm z = {0};
    *f = z;
    f->state = S_IDLE;
    f->end = -1;
    f->first_motion = -1;
    f->gesture = G_NONE;
    f->downgrade = G_NONE;
    f->pending = G_NONE;
    f->g12 = g12;
    f->last_g12 = -1;
    f->hook = hook;
    f->hook_ctx = ctx;
    f->trace[0].s = S_IDLE;
    f->trace[0].t = 0;
    f->n = 1;
}

static int64_t arm_target(const cubiq_fsm *f, cubiq_gesture g) {
    if (g == G_JUMP) return f->range_mm >= 200 ? T_ARM_J200_US : T_ARM_J150_US;
    return f->plan.v1 ? T_ARM_LEAP_V1_US : T_ARM_LEAP_V0_US;
}

static int32_t runway(const cubiq_fsm *f, cubiq_gesture g) {
    if (g == G_JUMP) return f->plan.runway_jump_mm + (f->range_mm >= 200 ? 50 : 0);
    if (g == G_LEAP) return f->plan.runway_leap_mm;
    return f->plan.runway_hop_mm;
}

/* begin a non-ballistic-spring gesture from the current state (IDLE or DECOCK) */
static void begin_simple(cubiq_fsm *f, cubiq_gesture g, int64_t precharge_credit) {
    f->gesture = g;
    switch (g) {
    case G_SETTLE: go(f, S_SETTLE, T_SETTLE_US); break;
    case G_NUDGE: go(f, S_NUDGE, T_NUDGE_US); break;
    case G_HOP: {
        int64_t d = T_PRECHARGE_US - precharge_credit; /* R08 F57: precharge overlaps the decock */
        go(f, S_PRECHARGE, d > 0 ? d : 0);
        break;
    }
    default: if (f->state != S_IDLE) go(f, S_IDLE, -1); break;
    }
}

int cubiq_fsm_start(cubiq_fsm *f, const cubiq_plan *p, const cubiq_inputs *in) {
    (void)in;
    if (f->state != S_IDLE || f->fall_latch || f->redecide) return -1;
    f->plan = *p;
    f->reason = NULL;
    f->downgraded = 0;
    f->recover_n = 0;
    f->range_mm = p->range_mm;
    cubiq_gesture g = p->gesture;
    if (g == G_JUMP && !p->v1) { g = G_LEAP; f->reason = "device_capability"; f->downgraded = 1; }
    if (g == G_JUMP) {
        const char *why = "G12_no_record";
        int32_t worst;
        int32_t ok = f->g12 ? cubiq_g12_allowed_mm(f->g12, &why, &worst) : 0;
        f->range_mm = f->range_mm >= 200 ? 200 : 150; /* v.1 offers two ranges (R10 D51, R11 D58) */
        if (ok == 0) { g = G_LEAP; f->reason = why; f->downgraded = 1; }
        else if (f->range_mm > ok) { f->range_mm = ok; f->reason = "G12_range_150"; }
    }
    f->gesture = g;
    if (g == G_LEAP || g == G_JUMP) {
        f->cam_entry = f->cam;
        go(f, S_ARM, arm_target(f, g) - f->cam);
    } else {
        begin_simple(f, g, 0);
    }
    return 0;
}

void cubiq_fsm_redirect(cubiq_fsm *f, cubiq_gesture g) {
    f->pending = g;
    f->redecide = 0;
    if (f->state == S_IDLE && f->end < 0) {
        f->pending = G_NONE;
        if (g != G_NONE) begin_simple(f, g, 0);
    }
}

int cubiq_fsm_self_test(cubiq_fsm *f) {
    if (f->state != S_SAFE_HOLD || f->cam != 0 || f->end >= 0) return -1;
    f->fall_latch = 0;
    go(f, S_IDLE, -1);
    return 0;
}

static void start_decock(cubiq_fsm *f, int64_t target) {
    f->decock_target = target;
    f->cam_entry = f->cam;
    f->decock_dur = f->cam > target ? f->cam - target : 0;
    go(f, S_DECOCK, f->decock_dur);
}

static void land_g12(cubiq_fsm *f, const cubiq_inputs *in, int64_t measured) {
    if (!f->g12 || (f->gesture != G_LEAP && f->gesture != G_JUMP)) return;
    cubiq_g12_flight k = f->gesture == G_LEAP ? G12_LEAP : (f->range_mm >= 200 ? G12_JUMP200 : G12_JUMP150);
    f->last_g12 = (int)cubiq_g12_record(f->g12, k, in->pitch_rate_mdps, measured, in->gyro_sat, in->contact);
}

static void recheck(cubiq_fsm *f, const cubiq_inputs *in) {
    /* the re-check is a guard evaluation, not a timer: a fall, a hand or a lost pad seen at the same
     * instant is handled by preempt(), never fired through */
    if (in->fall || in->lifted || (in->qi_lost && f->plan.pad_credit && !f->qi_handled)) {
        f->waiting = 1;
        f->end = f->armed_entry + T_ARMED_MAX_US;
        if (f->end <= f->t) f->end = f->t + 1;
        return;
    }
    if (f->t - f->armed_entry >= T_ARMED_MAX_US) { /* I5: never hold the spring longer */
        f->waiting = 0;
        f->abort_to_idle = 1;
        f->reason = "armed_timeout";
        go(f, S_UNLOCK, T_UNLOCK_US);
        return;
    }
    int32_t need = runway(f, f->gesture);
    if (in->free_ahead_mm < need) {
        f->waiting = 0;
        if (f->gesture == G_JUMP && in->free_ahead_mm >= runway(f, G_LEAP)) f->downgrade = G_LEAP;
        else if (in->free_ahead_mm >= runway(f, G_HOP)) f->downgrade = G_HOP;
        else f->downgrade = G_NUDGE;
        f->reason = "G1_recheck";
        f->downgraded = 1;
        go(f, S_UNLOCK, T_UNLOCK_US);
        return;
    }
    if (!in->imu_still) { /* wait for stillness, up to the I5 limit */
        f->waiting = 1;
        f->end = f->armed_entry + T_ARMED_MAX_US;
        return;
    }
    f->waiting = 0;
    go(f, S_FIRE, T_FIRE_US);
}

static void complete(cubiq_fsm *f, const cubiq_inputs *in) {
    switch (f->state) {
    case S_SETTLE:
    case S_NUDGE: go(f, S_IDLE, -1); break;
    case S_PRECHARGE: go(f, S_HOP_STROKE, T_HOP_STROKE_US); break;
    case S_HOP_STROKE:
        f->flight_nom = T_FLIGHT_HOP_US;
        f->flight_true = in->flight_us > 0 ? in->flight_us : T_FLIGHT_HOP_US;
        f->liftoff = f->t;
        f->overrun = 0;
        go(f, S_FLIGHT, f->flight_true);
        break;
    case S_ARM:
        f->cam = arm_target(f, f->gesture);
        go(f, S_LOCK, T_LOCK_US);
        break;
    case S_LOCK:
        go(f, S_ARMED, T_RECHECK_US);
        f->armed_entry = f->entry;
        break;
    case S_ARMED: recheck(f, in); break;
    case S_UNLOCK:
        if (f->downgrade == G_LEAP && !f->fall_latch && !f->abort_to_idle) start_decock(f, arm_target(f, G_LEAP));
        else start_decock(f, 0);
        break;
    case S_DECOCK:
        f->cam = f->decock_target;
        if (f->fall_latch || f->safe_decock) {
            f->safe_decock = 0;
            go(f, S_SAFE_HOLD, -1);
        } else if (f->pending != G_NONE) {
            cubiq_gesture g = f->pending;
            f->pending = G_NONE;
            begin_simple(f, g, 0);
        } else if (f->redecide) {
            go(f, S_IDLE, -1); /* the caller re-decides; redirect() starts the substitute */
        } else if (f->downgrade == G_LEAP && f->cam > 0) {
            f->downgrade = G_NONE;
            f->gesture = G_LEAP;
            go(f, S_LOCK, T_LOCK_US);
        } else if (f->downgrade == G_HOP || f->downgrade == G_NUDGE) {
            cubiq_gesture g = f->downgrade;
            f->downgrade = G_NONE;
            begin_simple(f, g, f->decock_dur);
        } else {
            f->abort_to_idle = 0;
            go(f, S_IDLE, -1);
        }
        break;
    case S_FIRE: {
        f->cam = 0;
        int64_t stroke = f->gesture == G_JUMP ? T_JUMP_STROKE_US : T_LEAP_STROKE_US;
        f->flight_nom = f->gesture == G_JUMP ? (f->range_mm >= 200 ? T_FLIGHT_J200_US : T_FLIGHT_J150_US)
                                             : T_FLIGHT_LEAP_US;
        f->flight_true = in->flight_us > 0 ? in->flight_us : f->flight_nom;
        f->liftoff = f->t + stroke;
        f->overrun = 0;
        go(f, S_FLIGHT, stroke + f->flight_true);
        break;
    }
    case S_FLIGHT:
        if (in->airborne) {
            if (!f->overrun) { /* F97: not down yet. Wait to 1.5x nominal, then it is a fall. */
                f->overrun = 1;
                f->end = f->liftoff + f->flight_nom + f->flight_nom / 2;
                if (f->end <= f->t) f->end = f->t + 1;
            } else {
                f->fall_latch = 1;
                if (f->g12) cubiq_g12_reset(f->g12);
                f->reason = "flight_overrun";
                go(f, S_SAFE_HOLD, -1);
            }
            break;
        }
        land_g12(f, in, f->t - f->liftoff);
        go(f, S_LAND, 0);
        break;
    case S_LAND:
        if (f->gesture == G_LEAP || f->gesture == G_JUMP) go(f, S_RESET, T_RESET_US);
        else if (in->tip_ddeg > TIP_RECOVER_DDEG) { f->recover_n = 1; go(f, S_RECOVER, T_RECOVER_US); }
        else go(f, S_IDLE, -1);
        break;
    case S_RESET:
        if (!in->sleeve_ok) go(f, S_SAFE_HOLD, -1);
        else if (in->tip_ddeg > TIP_RECOVER_DDEG) { f->recover_n = 1; go(f, S_RECOVER, T_RECOVER_US); }
        else go(f, S_IDLE, -1);
        break;
    case S_RECOVER:
        if (in->tip_ddeg <= TIP_RECOVER_DDEG) go(f, S_IDLE, -1);
        else if (f->recover_n < RECOVER_MAX) { f->recover_n++; go(f, S_RECOVER, T_RECOVER_US); }
        else go(f, S_SAFE_HOLD, -1);
        break;
    default: f->end = -1; break; /* IDLE, SAFE_HOLD: open-ended */
    }
}

/* inputs at f->t. Returns 1 if the state changed. */
static int preempt(cubiq_fsm *f, const cubiq_inputs *in) {
    cubiq_state s = f->state;
    int ballistic = s == S_HOP_STROKE || s == S_FIRE || s == S_FLIGHT || s == S_LAND;
    if (in->fall && !ballistic) { /* F97: masked while ballistic */
        if (!f->fall_latch) {
            f->fall_latch = 1;
            if (f->g12) cubiq_g12_reset(f->g12); /* G8 clears the G12 record (R11 D58) */
        }
        switch (s) {
        case S_IDLE:
        case S_PRECHARGE:
        case S_RESET:
        case S_RECOVER: go(f, S_SAFE_HOLD, -1); return 1;
        case S_ARM: /* motor stop; the worm self-locks where it is (R08 F57) */
            f->cam = f->cam_entry + (f->t - f->entry);
            go(f, S_SAFE_HOLD, -1);
            return 1;
        case S_LOCK:
        case S_ARMED: f->waiting = 0; go(f, S_UNLOCK, T_UNLOCK_US); return 1; /* reverse only */
        case S_DECOCK:
            if (f->decock_target > 0) { /* a partial decock becomes a full one */
                f->decock_target = 0;
                f->decock_dur = f->cam_entry;
                f->end = f->entry + f->cam_entry;
                if (f->end < f->t) f->end = f->t;
            }
            return 0;
        default: return 0; /* SETTLE/NUDGE finish (<= 2 s, no stored energy); UNLOCK continues */
        }
    }
    if (in->fall) return 0;
    if (s == S_SAFE_HOLD && f->end < 0 && f->cam > 0 && in->imu_still) { /* F96 */
        f->safe_decock = 1;
        start_decock(f, 0);
        return 1;
    }
    if (in->lifted && (s == S_ARM || s == S_LOCK || s == S_ARMED)) { /* G7: never fire in a hand */
        f->reason = "G7_lifted";
        f->abort_to_idle = 1;
        f->waiting = 0;
        if (s == S_ARM) { f->cam = f->cam_entry + (f->t - f->entry); start_decock(f, 0); }
        else go(f, S_UNLOCK, T_UNLOCK_US);
        return 1;
    }
    if (in->qi_lost && f->plan.pad_credit && !f->qi_handled && (s == S_ARM || s == S_LOCK || s == S_ARMED)) {
        f->qi_handled = 1;
        f->redecide = 1; /* the pad credit is gone: the contract must decide again */
        f->reason = "pad_lost";
        f->waiting = 0;
        if (s == S_ARM) { f->cam = f->cam_entry + (f->t - f->entry); start_decock(f, 0); }
        else go(f, S_UNLOCK, T_UNLOCK_US);
        return 1;
    }
    if (s == S_ARMED && f->waiting && in->imu_still) { recheck(f, in); return f->state != S_ARMED; }
    if (s == S_ARMED && f->waiting && in->free_ahead_mm < runway(f, f->gesture)) { recheck(f, in); return 1; }
    if (s == S_FLIGHT && f->overrun && !in->airborne) { /* came down late: land, G12 refuses the time */
        land_g12(f, in, f->t - f->liftoff);
        go(f, S_LAND, 0);
        return 1;
    }
    return 0;
}

void cubiq_fsm_poll(cubiq_fsm *f, const cubiq_inputs *in, int64_t now) {
    if (now < f->t) now = f->t;
    for (int guard = 0; guard < 256; guard++) {
        if (f->end >= 0 && f->end <= now) {
            f->t = f->end;
            cubiq_state before = f->state;
            int64_t end_before = f->end;
            complete(f, in);
            if (f->state == before && f->end == end_before) f->end = -1; /* no progress: stop */
            continue;
        }
        f->t = now;
        if (!preempt(f, in)) break;
    }
}
