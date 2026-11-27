/*
 * CUBIQ(tm) Quantum Cube — G12 pitch self-check, firmware reference (C99).
 * Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R12.md §02 (F92-F95); proposal R11 §03 (F88, D58).
 *
 * A thrust line that misses the CoM spins the cube in flight. The pitch the cube lands with grows
 * with range (R11 F87), so a v.1 JUMP is only as safe as THIS unit's thrust line. The gyro sees that
 * line on every ballistic flight: in free flight the body rate is constant and equals m*v*d/I.
 *
 * R12 gates on the MEASURED quantity, not on an inferred angle (F92):
 *   q_eq = |mean pitch rate in flight| * T_LEAP_NOM / t_flight_measured
 * At a fixed 60 deg launch v is proportional to the flight time, so q_eq is the pitch rate this unit
 * would show on a nominal LEAP. m, I and the CoM lever (all EST today) cancel out of the JUMP landing
 * pitch prediction; only the impact model's threshold still depends on them, and B42 measures that
 * threshold directly in q (deg/s), not in degrees.
 *
 * Rules (R12 D61):
 *   - LEAP and JUMP flights both feed the record (HOPs are vertical: different lever, not used).
 *   - A sample is refused only for reasons independent of its rate: flight time outside +-15 % of the
 *     gesture's nominal, or contact during flight. A saturated gyro is never refused: it is recorded
 *     as the largest possible error (F94: an outlier filter must never drop a sample that would
 *     tighten the gate).
 *   - JUMP needs >= 5 samples on record. The gate uses the MAX of the last 5, not the median
 *     (F93, correction to R11 D58: a median lets two bad flights through).
 *   - A confirmed fall (G8) clears the record.
 *
 * No malloc, no floating point.
 */
#ifndef CUBIQ_G12_H
#define CUBIQ_G12_H

#include <stdint.h>

#define CUBIQ_G12_N 5
/* nominal flights at a 60 deg launch (R06 F32), us: LEAP 40 mm, JUMP 150 mm, JUMP 200 mm */
#define CUBIQ_G12_T_LEAP_US 118848
#define CUBIQ_G12_T_J150_US 230148
#define CUBIQ_G12_T_J200_US 265752
/* q_eq limits, milli-deg/s, floored: topple onset / 1.5 (R11 F87 margin over a MEASURED error),
 * onset from scripts/cubiq-r12-g12.py at 0.0001 deg resolution (F95). */
#define CUBIQ_G12_Q150_MDPS 34964
#define CUBIQ_G12_Q200_MDPS 25355
#define CUBIQ_G12_Q_SATURATED INT32_MAX

typedef enum { G12_LEAP = 0, G12_JUMP150 = 1, G12_JUMP200 = 2 } cubiq_g12_flight;

typedef enum {
    G12_ACCEPTED = 0,
    G12_REFUSED_FLIGHT_TIME, /* not a clean ballistic flight of this gesture */
    G12_REFUSED_CONTACT,     /* something touched the cube in flight */
    G12_REFUSED_ARG          /* a value no sensor can produce */
} cubiq_g12_result;

typedef struct {
    int32_t q[CUBIQ_G12_N]; /* ring of q_eq, mdps */
    uint8_t head;
    uint8_t count;          /* saturates at CUBIQ_G12_N */
} cubiq_g12;

void cubiq_g12_reset(cubiq_g12 *g);

/* rate_mdps: mean gyro pitch rate over the flight, signed. flight_us: liftoff to touchdown. */
cubiq_g12_result cubiq_g12_record(cubiq_g12 *g, cubiq_g12_flight kind, int32_t rate_mdps,
                                  int64_t flight_us, int saturated, int contact);

/* Longest JUMP range (mm) this unit may perform now: 0 (LEAP only), 150 or 200.
 * *reason is a static string when the answer is 0, else NULL. *worst_mdps is the max of the last 5
 * (or -1 with fewer than 5). */
int32_t cubiq_g12_allowed_mm(const cubiq_g12 *g, const char **reason, int32_t *worst_mdps);

#endif
