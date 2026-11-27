/* CUBIQ(tm) — G12 pitch self-check. Spec in cubiq_g12.h and R12 §02. */
#include "cubiq_g12.h"

#include <stddef.h>

static const int64_t T_NOM_US[3] = {CUBIQ_G12_T_LEAP_US, CUBIQ_G12_T_J150_US, CUBIQ_G12_T_J200_US};

void cubiq_g12_reset(cubiq_g12 *g) {
    for (int i = 0; i < CUBIQ_G12_N; i++) g->q[i] = 0;
    g->head = 0;
    g->count = 0;
}

cubiq_g12_result cubiq_g12_record(cubiq_g12 *g, cubiq_g12_flight kind, int32_t rate_mdps,
                                  int64_t flight_us, int saturated, int contact) {
    if ((int)kind < 0 || (int)kind > 2 || flight_us <= 0) return G12_REFUSED_ARG;
    int64_t nom = T_NOM_US[kind];
    /* +-15 % window, integer: 0.85*nom <= t <= 1.15*nom */
    if (flight_us * 100 < nom * 85 || flight_us * 100 > nom * 115) return G12_REFUSED_FLIGHT_TIME;
    if (contact) return G12_REFUSED_CONTACT;
    int32_t q;
    if (saturated) {
        q = CUBIQ_G12_Q_SATURATED;
    } else {
        int64_t r = rate_mdps < 0 ? -(int64_t)rate_mdps : (int64_t)rate_mdps; /* INT32_MIN safe */
        int64_t v = r * CUBIQ_G12_T_LEAP_US / flight_us; /* r < 2^31, T < 2^18: no overflow */
        q = v > INT32_MAX ? INT32_MAX : (int32_t)v;
    }
    g->q[g->head] = q;
    g->head = (uint8_t)((g->head + 1) % CUBIQ_G12_N);
    if (g->count < CUBIQ_G12_N) g->count++;
    return G12_ACCEPTED;
}

int32_t cubiq_g12_allowed_mm(const cubiq_g12 *g, const char **reason, int32_t *worst_mdps) {
    if (g->count < CUBIQ_G12_N) {
        if (reason) *reason = "G12_pitch_unverified";
        if (worst_mdps) *worst_mdps = -1;
        return 0;
    }
    int32_t worst = 0;
    for (int i = 0; i < CUBIQ_G12_N; i++)
        if (g->q[i] > worst) worst = g->q[i];
    if (worst_mdps) *worst_mdps = worst;
    if (reason) *reason = NULL;
    if (worst <= CUBIQ_G12_Q200_MDPS) return 200;
    if (worst <= CUBIQ_G12_Q150_MDPS) return 150;
    if (reason) *reason = "G12_pitch_over_limit";
    return 0;
}
