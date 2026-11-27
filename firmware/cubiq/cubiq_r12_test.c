/*
 * CUBIQ(tm) — host test driver for R12: G12 pitch self-check + FSM v0.4 (R12 §02-§03).
 *
 *   cubiq_r12_test g12          commands on stdin, one per line, one answer per line:
 *                                 r <kind 0|1|2> <rate_mdps> <flight_us> <sat 0|1> <contact 0|1>
 *                                   -> "rec <result>"
 *                                 d -> "reset"          q -> "q <allowed_mm> <worst_mdps> <reason|->"
 *   cubiq_r12_test fsm [name]   run one scenario (or all), one JSON line each
 *
 * Host-only (stdio). The FSM and G12 themselves use neither stdio nor malloc.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "cubiq_fsm.h"

/* ------------------------------------------------------------------ G12 line protocol */
static int run_g12(void) {
    cubiq_g12 g;
    cubiq_g12_reset(&g);
    char line[256];
    while (fgets(line, sizeof line, stdin)) {
        if (line[0] == 'r') {
            int kind, sat, contact;
            long rate;
            long long fl;
            if (sscanf(line + 1, "%d %ld %lld %d %d", &kind, &rate, &fl, &sat, &contact) != 5) {
                puts("bad");
                continue;
            }
            printf("rec %d\n", (int)cubiq_g12_record(&g, (cubiq_g12_flight)kind, (int32_t)rate, (int64_t)fl, sat, contact));
        } else if (line[0] == 'd') {
            cubiq_g12_reset(&g);
            puts("reset");
        } else if (line[0] == 'q') {
            const char *why;
            int32_t worst;
            int32_t mm = cubiq_g12_allowed_mm(&g, &why, &worst);
            printf("q %ld %ld %s\n", (long)mm, (long)worst, why ? why : "-");
        }
    }
    return 0;
}

/* ------------------------------------------------------------------ FSM scenarios */
#define MAXEV 8
typedef struct {
    int64_t t;
    int what; /* field selector */
    int32_t v;
} ev;
enum { E_FALL, E_LIFTED, E_QI, E_STILL, E_FREE, E_TIP, E_SLEEVE, E_AIR, E_CONTACT, E_SAT, E_RATE, E_SELFTEST };

typedef struct {
    const char *name;
    cubiq_gesture g;
    int32_t range;
    int v1, pad;
    int g12_n;        /* samples pre-loaded */
    int32_t g12_q;    /* their rate (LEAP, nominal flight) */
    int32_t g12_bad;  /* if > 0: the last pre-loaded sample has this rate */
    cubiq_gesture redirect; /* answer to a re-decide */
    int64_t flight_us;
    int32_t rate;
    ev evs[MAXEV];
    int nev;
} scenario;

static const scenario S[] = {
    /* the five gesture traces every contract vector reduces to (R08 main loop) */
    {"settle", G_SETTLE, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{0}}, 0},
    {"nudge", G_NUDGE, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{0}}, 0},
    {"hop", G_HOP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{0}}, 0},
    {"leap", G_LEAP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{0}}, 0},
    {"none", G_NONE, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{0}}, 0},
    /* R08 fault scenarios, as inputs at times */
    {"f1_fall_during_arm", G_LEAP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0,
     {{500000, E_FALL, 1}, {500000, E_STILL, 0}, {2000000, E_FALL, 0}, {2000000, E_STILL, 1}}, 4},
    {"f2_fall_while_armed", G_LEAP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{1260000, E_FALL, 1}}, 1},
    {"f3_hand_at_recheck_100mm", G_LEAP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{1260000, E_FREE, 100}}, 1},
    {"f3b_hand_at_recheck_70mm", G_LEAP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{1260000, E_FREE, 70}}, 1},
    {"f3c_hand_70mm_on_pad", G_LEAP, 0, 0, 1, 0, 0, 0, G_NONE, 0, 0, {{1260000, E_FREE, 70}}, 1},
    {"f4_armed_timeout", G_LEAP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{1000000, E_STILL, 0}}, 1},
    {"f5_tipped_landing", G_LEAP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{0, E_TIP, 600}}, 1},
    {"f5b_cannot_right", G_LEAP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{0, E_TIP, 800}}, 1},
    {"f6_sleeve_stuck", G_LEAP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{0, E_SLEEVE, 0}}, 1},
    {"f7_lifted_while_armed", G_LEAP, 0, 0, 0, 0, 0, 0, G_NONE, 0, 0, {{1260000, E_LIFTED, 1}}, 1},
    {"f8_pad_lost_mid_arm", G_LEAP, 0, 0, 1, 0, 0, 0, G_SETTLE, 0, 0, {{600000, E_QI, 1}}, 1},
    /* v.1: JUMP + G12 (R12) */
    {"j150", G_JUMP, 150, 1, 0, 5, 18000, 0, G_NONE, 0, 9000, {{0}}, 0},
    {"j200", G_JUMP, 200, 1, 0, 5, 18000, 0, G_NONE, 0, 9000, {{0}}, 0},
    {"j200_capped_150", G_JUMP, 200, 1, 0, 5, 18000, 30000, G_NONE, 0, 9000, {{0}}, 0},
    {"j_unverified_3", G_JUMP, 150, 1, 0, 3, 18000, 0, G_NONE, 0, 9000, {{0}}, 0},
    {"j_one_bad_of_5", G_JUMP, 150, 1, 0, 5, 18000, 40000, G_NONE, 0, 9000, {{0}}, 0},
    {"v0_jump_refused", G_JUMP, 150, 0, 0, 5, 18000, 0, G_NONE, 0, 0, {{0}}, 0},
    {"f9_jump_hand_at_150mm", G_JUMP, 150, 1, 0, 5, 18000, 0, G_NONE, 0, 9000, {{3260000, E_FREE, 150}}, 1},
    {"f10_fall_in_partial_decock", G_JUMP, 150, 1, 0, 5, 18000, 0, G_NONE, 0, 9000,
     {{3260000, E_FREE, 150}, {3600000, E_FALL, 1}, {3600000, E_STILL, 0}}, 3},
    {"f11_jump_off_the_edge", G_JUMP, 150, 1, 0, 5, 18000, 0, G_NONE, 0, 9000, {{0, E_AIR, 1}}, 1},
    {"f12_late_landing", G_JUMP, 150, 1, 0, 5, 18000, 0, G_NONE, 0, 9000,
     {{0, E_AIR, 1}, {3650000, E_AIR, 0}}, 2},
    {"f13_leap_touched_in_flight", G_LEAP, 0, 1, 0, 4, 18000, 0, G_NONE, 0, 9000, {{0, E_CONTACT, 1}}, 1},
    {"f14_leap_gyro_saturated", G_LEAP, 0, 1, 0, 4, 18000, 0, G_NONE, 0, 9000, {{0, E_SAT, 1}}, 1},
    {"f15_leap_fifth_sample", G_LEAP, 0, 1, 0, 4, 18000, 0, G_NONE, 0, 30000, {{0}}, 0},
    /* R06 confirms a fall after 150 ms of free fall; a 150 mm JUMP flies 230 ms (F97) */
    {"f16_jump_flight_confirms_fall", G_JUMP, 150, 1, 0, 5, 18000, 0, G_NONE, 0, 9000,
     {{3481300, E_FALL, 1}, {3561448, E_FALL, 0}}, 2},
};
#define NS ((int)(sizeof S / sizeof S[0]))

static void plant_hook(void *ctx, cubiq_fsm *f, cubiq_state s) {
    (void)f;
    cubiq_inputs *in = (cubiq_inputs *)ctx;
    if (s == S_RECOVER) in->tip_ddeg -= 200; /* EST: one corrective pulse rights ~20 deg (R08) */
}

static void apply(cubiq_inputs *in, cubiq_fsm *f, const ev *e) {
    switch (e->what) {
    case E_FALL: in->fall = (uint8_t)e->v; break;
    case E_LIFTED: in->lifted = (uint8_t)e->v; break;
    case E_QI: in->qi_lost = (uint8_t)e->v; break;
    case E_STILL: in->imu_still = (uint8_t)e->v; break;
    case E_FREE: in->free_ahead_mm = e->v; break;
    case E_TIP: in->tip_ddeg = e->v; break;
    case E_SLEEVE: in->sleeve_ok = (uint8_t)e->v; break;
    case E_AIR: in->airborne = (uint8_t)e->v; break;
    case E_CONTACT: in->contact = (uint8_t)e->v; break;
    case E_SAT: in->gyro_sat = (uint8_t)e->v; break;
    case E_RATE: in->pitch_rate_mdps = e->v; break;
    case E_SELFTEST: cubiq_fsm_self_test(f); break;
    default: break;
    }
}

static void run_one(const scenario *sc) {
    static cubiq_fsm f;
    static cubiq_g12 g;
    cubiq_inputs in = {0};
    in.imu_still = 1;
    in.sleeve_ok = 1;
    in.free_ahead_mm = 1000;
    in.pitch_rate_mdps = sc->rate;
    in.flight_us = sc->flight_us;
    cubiq_g12_reset(&g);
    for (int i = 0; i < sc->g12_n; i++) {
        int32_t q = (sc->g12_bad > 0 && i == sc->g12_n - 1) ? sc->g12_bad : sc->g12_q;
        cubiq_g12_record(&g, G12_LEAP, q, CUBIQ_G12_T_LEAP_US, 0, 0);
    }
    cubiq_fsm_init(&f, sc->v1 ? &g : NULL, plant_hook, &in);
    cubiq_plan p = {sc->g, sc->range, (uint8_t)sc->v1, (uint8_t)sc->pad, 85, 125, 201};
    if (sc->pad) { p.runway_hop_mm = 20; p.runway_leap_mm = 60; } /* R08 §04 deck-certified */
    int k = 0;
    while (k < sc->nev && sc->evs[k].t == 0) apply(&in, &f, &sc->evs[k++]);
    int rc = cubiq_fsm_start(&f, &p, &in);
    for (int guard = 0; guard < 1000; guard++) {
        int64_t next_ev = k < sc->nev ? sc->evs[k].t : -1;
        if (cubiq_fsm_at_rest(&f) && next_ev < 0) break;
        int64_t next = f.end;
        if (next_ev >= 0 && (next < 0 || next_ev <= next)) {
            if (next_ev - 1 > f.t) cubiq_fsm_poll(&f, &in, next_ev - 1); /* old inputs up to the event */
            while (k < sc->nev && sc->evs[k].t == next_ev) apply(&in, &f, &sc->evs[k++]);
            cubiq_fsm_poll(&f, &in, next_ev);
        } else if (next >= 0) {
            cubiq_fsm_poll(&f, &in, next);
        } else {
            break;
        }
        if (f.redecide) cubiq_fsm_redirect(&f, sc->redirect);
    }
    const char *why;
    int32_t worst;
    int32_t allowed = sc->v1 ? cubiq_g12_allowed_mm(&g, &why, &worst) : 0;
    printf("{\"name\":\"%s\",\"start\":%d,\"trace\":[", sc->name, rc);
    for (int i = 0; i < f.n; i++)
        printf("%s[\"%s\",%lld]", i ? "," : "", cubiq_state_name((cubiq_state)f.trace[i].s), (long long)f.trace[i].t);
    printf("],\"end\":\"%s\",\"t\":%lld,\"first_motion\":%lld,\"fired\":%d,\"cam\":%lld,\"gesture\":\"%s\","
           "\"range\":%ld,\"reason\":", cubiq_state_name(f.state), (long long)f.t, (long long)f.first_motion,
           f.fired, (long long)f.cam, cubiq_gesture_name(f.gesture), (long)f.range_mm);
    if (f.reason) printf("\"%s\"", f.reason); else fputs("null", stdout);
    printf(",\"illegal\":%d,\"fwd_after_fall\":%d,\"armed_max\":%lld,\"fall_latch\":%d,\"downgraded\":%d,"
           "\"g12_count\":%d,\"g12_allowed\":%ld,\"g12_last\":%d}\n",
           f.illegal, f.fwd_after_fall, (long long)f.armed_max_seen, f.fall_latch, f.downgraded,
           sc->v1 ? g.count : -1, (long)allowed, f.last_g12);
}

int main(int argc, char **argv) {
    if (argc >= 2 && strcmp(argv[1], "g12") == 0) return run_g12();
    if (argc >= 2 && strcmp(argv[1], "fsm") == 0) {
        for (int i = 0; i < NS; i++)
            if (argc < 3 || strcmp(argv[2], S[i].name) == 0) run_one(&S[i]);
        return 0;
    }
    fprintf(stderr, "usage: %s g12 | fsm [scenario]\n", argv[0]);
    return 2;
}
