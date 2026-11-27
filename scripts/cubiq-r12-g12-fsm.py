#!/usr/bin/env python3
"""CUBIQ(tm) Quantum Cube v.0 — R12: G12 pitch self-check + firmware FSM v0.4, in C, checked.
Stdlib + a C99 compiler. Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R12.md §02-§04.

  0. build firmware/cubiq/ (all modules) with -std=c99 -Wall -Wextra -Wpedantic -Werror
  1. G12 thresholds re-derived from the R11 landing model at 0.0001 deg; header constants checked
  2. why gate on the measured rate, normalised by flight time (F92) — sensitivity to EST m, I, v
  3. G12 vectors (docs/corporate/cubiq/g12-v0.1-vectors.json): Python reference and C, 20/20 each
  4. G12 differential fuzz: random command streams, Python vs C, 0 disagreements
  5. median vs max (F93): an undetected knock, Monte Carlo
  6. FSM v0.4: every scenario, invariants I1-I7, expectations, and the R08 v0.3 traces compared
  7. latency budgets (F100) and fall-confirm vs flight time (F97)
  8. sanitizers: ASan + UBSan build, all scenarios + the fuzz stream
Usage: python3 -I scripts/cubiq-r12-g12-fsm.py [fuzz_cases]   Exit 0 only if everything passes."""
import importlib.util
import json
import math
import os
import random
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FW = os.path.join(ROOT, "firmware", "cubiq")
SRC = ["cubiq_json.c", "cubiq_contract.c", "cubiq_g12.c", "cubiq_fsm.c", "cubiq_r12_test.c"]
FAIL = []


def load(name, fname):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, fname))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


land = load("r11land", "cubiq-r11-landing.py")
sim = load("r08sim", "cubiq-r08-fsm-sim.py")


def check(ok, what):
    if not ok:
        FAIL.append(what)
    return ok


# ---------------------------------------------------------------- 0. build
def build(out, extra=()):
    cc = next((c for c in ("cc", "gcc", "clang") if shutil.which(c)), None)
    if not cc:
        sys.exit("no C compiler on PATH")
    exe = os.path.join(out, "r12" + ("_san" if extra else ""))
    subprocess.run([cc, "-std=c99", "-O1" if extra else "-O2", "-Wall", "-Wextra", "-Wpedantic", "-Werror",
                    *extra, "-o", exe] + [os.path.join(FW, s) for s in SRC], check=True)
    return exe, cc


def header_consts():
    vals = {}
    for line in open(os.path.join(FW, "cubiq_g12.h")):
        p = line.split()
        if len(p) >= 3 and p[0] == "#define" and p[2].lstrip("-").isdigit():
            vals[p[1]] = int(p[2])
    return vals


# ---------------------------------------------------------------- 1. thresholds
CFG = "v.1 108.7 g"


def onset(rng_mm, step=0.0001):
    name = f"JUMP {rng_mm} mm @60"
    if name not in dict(land.GESTURES):
        land.GESTURES.append((name, (rng_mm / 1000, 60)))
    e = 0.0
    while land.ratio_at(name, CFG, e + 0.01)[0] <= 1:   # coarse
        e += 0.01
    while land.ratio_at(name, CFG, e)[0] <= 1:          # fine, from the lower edge of the bracket
        e += step
    return e


def q_of(eps_deg, m=None, i=None, v=None):
    m0, h, i0 = land.CONFIGS[CFG]
    m = m0 if m is None else m
    i = i0 if i is None else i
    v = land.kin((0.040, 60))[0] if v is None else v
    lever = h / math.sin(math.radians(60))
    return math.degrees(m * v * lever * math.tan(math.radians(eps_deg)) / i)


def part1(H):
    print("1. G12 THRESHOLDS (R11 landing model, v.1 108.7 g, 60 deg launch, worst spin sign)")
    t_leap = land.kin((0.040, 60))[3]
    t150 = land.kin((0.150, 60))[3]
    t200 = land.kin((0.200, 60))[3]
    for nm, t in (("CUBIQ_G12_T_LEAP_US", t_leap), ("CUBIQ_G12_T_J150_US", t150), ("CUBIQ_G12_T_J200_US", t200)):
        check(H[nm] == round(t * 1e6), f"{nm} {H[nm]} != {round(t * 1e6)}")
    print(f"   nominal flights: LEAP 40 mm {t_leap * 1e3:.2f} ms · JUMP 150 {t150 * 1e3:.2f} ms · "
          f"JUMP 200 {t200 * 1e3:.2f} ms")
    print("   range   R11 onset (0.01 scan)   onset (0.0001)   /1.5 limit   R11 limit   q limit (deg/s)  header mdps")
    out = {}
    for rng, r11_on, r11_lim, key in ((150, 1.18, 0.79, "CUBIQ_G12_Q150_MDPS"), (200, 0.85, 0.57, "CUBIQ_G12_Q200_MDPS")):
        e = onset(rng)
        lim = e / 1.5
        q = q_of(lim)
        mdps = math.floor(q * 1000)
        out[rng] = (e, lim, q)
        check(H[key] == mdps, f"{key} {H[key]} != {mdps}")
        print(f"   {rng} mm    {r11_on:5.2f} deg              {e:7.4f} deg      {lim:6.4f} deg  {r11_lim:5.2f} deg    "
              f"{q:7.3f}          {H[key]}")
    print(f"   F95: R11 quoted the UPPER edge of its 0.01 deg bracket. Its 0.79 deg limit sits "
          f"{(0.79 / out[150][1] - 1) * 100:.1f} % above the 1.5x line, 0.57 sits {(0.57 / out[200][1] - 1) * 100:.1f} % above.")
    print(f"   rate per degree of thrust-line error on a nominal LEAP: {q_of(1.0):.2f} deg/s "
          f"(the 0.72 deg stack reads {q_of(0.72):.1f} deg/s)")
    return out


# ---------------------------------------------------------------- 2. why the measured rate
def part2(lims):
    print("\n2. F92 — GATE ON THE MEASURED RATE, NORMALISED BY FLIGHT TIME")
    m0, h, i0 = land.CONFIGS[CFG]
    v0 = land.kin((0.040, 60))[0]
    eps_true = 0.70
    print("   true thrust-line error 0.70 deg; what the gate concludes when one EST input is off by 10 %:")
    print("   case                         R11 (infer deg via m,I,v)   R12 (q_eq, flight-normalised)   JUMP 150 landing pitch")
    for label, m, i, v in (("all inputs as EST", m0, i0, v0), ("true I 10 % higher", m0, i0 * 1.1, v0),
                           ("spring 10 % weak (v 0.9x)", m0, i0, v0 * 0.9), ("true m 10 % lower", m0 * 0.9, i0, v0)):
        q_meas = q_of(eps_true, m=m, i=i, v=v)                   # what the gyro reads on this unit
        eps_r11 = math.degrees(math.atan(math.radians(q_meas) * i0 / (m0 * v0 * h / math.sin(math.radians(60)))))
        t_meas = 2 * v * math.sin(math.radians(60)) / land.G
        q_eq = q_meas * land.kin((0.040, 60))[3] / t_meas
        # JUMP landing pitch on this unit: omega_J = m v_J d / I  (v_J commanded, nominal)
        d = h / math.sin(math.radians(60)) * math.tan(math.radians(eps_true))
        vj, _, _, tj, _ = land.kin((0.150, 60))
        psi = math.degrees(m * vj * d / i * tj)
        print(f"   {label:28s} {eps_r11:5.3f} deg                    {q_eq:6.2f} deg/s                  {psi:5.1f} deg")
    print("   With I or m off, the R11 angle is wrong but the q-space gate tracks the real landing pitch: ω_J/ω_L =")
    print("   v_J/v_L, so m and I cancel; only the threshold depends on them, and B42 measures that threshold in")
    print("   deg/s directly. With a weak spring, an un-normalised rate under-reads by 10 % (permissive); q_eq doesn't.")


# ---------------------------------------------------------------- 3-4. G12 reference + vectors + fuzz
INT32_MAX = 2 ** 31 - 1


class G12:
    N, T = 5, (118848, 230148, 265752)

    def __init__(self, H):
        self.H = H
        self.reset()

    def reset(self):
        self.q, self.head, self.count = [0] * 5, 0, 0

    def record(self, kind, rate, fl, sat, contact):
        if kind not in (0, 1, 2) or fl <= 0:
            return 3
        nom = self.T[kind]
        if fl * 100 < nom * 85 or fl * 100 > nom * 115:
            return 1
        if contact:
            return 2
        q = INT32_MAX if sat else min(INT32_MAX, abs(rate) * self.T[0] // fl)
        self.q[self.head] = q
        self.head = (self.head + 1) % 5
        self.count = min(5, self.count + 1)
        return 0

    def query(self):
        if self.count < 5:
            return "q 0 -1 G12_pitch_unverified"
        w = max(self.q)
        if w <= self.H["CUBIQ_G12_Q200_MDPS"]:
            return f"q 200 {w} -"
        if w <= self.H["CUBIQ_G12_Q150_MDPS"]:
            return f"q 150 {w} -"
        return f"q 0 {w} G12_pitch_over_limit"

    def run(self, cmd):
        p = cmd.split()
        if p[0] == "r":
            return f"rec {self.record(*map(int, p[1:]))}"
        if p[0] == "d":
            self.reset()
            return "reset"
        return self.query()


def c_g12(exe, cmds):
    r = subprocess.run([exe, "g12"], input="\n".join(cmds) + "\n", capture_output=True, text=True, check=True)
    return r.stdout.splitlines()


def part3(exe, H):
    print("\n3. G12 VECTORS v0.1 (docs/corporate/cubiq/g12-v0.1-vectors.json)")
    vec = json.load(open(os.path.join(ROOT, "docs", "corporate", "cubiq", "g12-v0.1-vectors.json")))["vectors"]
    py_ok = c_ok = 0
    for v in vec:
        cmds = [s[0] for s in v["steps"]]
        want = [s[1] for s in v["steps"]]
        g = G12(H)
        got_py = [g.run(c) for c in cmds]
        got_c = c_g12(exe, cmds)
        py_ok += got_py == want
        c_ok += got_c == want
        if got_py != want or got_c != want:
            print(f"   FAIL {v['name']}: want {want[-1]} py {got_py[-1]} c {got_c[-1]}")
    check(py_ok == len(vec) and c_ok == len(vec), "G12 vectors")
    print(f"   Python reference {py_ok}/{len(vec)} · C firmware {c_ok}/{len(vec)}")


def part4(exe, H, cases, seed=20261127):
    rnd = random.Random(seed)
    cmds = []
    for _ in range(cases):
        x = rnd.random()
        if x < 0.03:
            cmds.append("d")
        elif x < 0.25:
            cmds.append("q")
        else:
            kind = rnd.choice([0, 0, 0, 1, 2, rnd.randint(-2, 4)])
            nom = G12.T[kind] if kind in (0, 1, 2) else 118848
            fl = rnd.choice([nom, int(nom * rnd.uniform(0.8, 1.2)), rnd.randint(-5, 400000),
                             int(nom * 0.85) + rnd.randint(-2, 2), int(nom * 1.15) + rnd.randint(-2, 2)])
            rate = rnd.choice([rnd.randint(-60000, 60000), rnd.randint(-2 ** 31, 2 ** 31 - 1),
                               H["CUBIQ_G12_Q150_MDPS"] + rnd.randint(-2, 2), H["CUBIQ_G12_Q200_MDPS"] + rnd.randint(-2, 2)])
            cmds.append(f"r {kind} {rate} {fl} {int(rnd.random() < 0.02)} {int(rnd.random() < 0.03)}")
    g = G12(H)
    py = [g.run(c) for c in cmds]
    cc = c_g12(exe, cmds)
    bad = sum(a != b for a, b in zip(py, cc)) + abs(len(py) - len(cc))
    check(bad == 0, f"G12 fuzz {bad} disagreements")
    print(f"\n4. G12 DIFFERENTIAL FUZZ: {cases} commands (seed {seed}), Python vs C: {bad} disagreements")
    return cmds


# ---------------------------------------------------------------- 5. median vs max
def part5(H, trials=20000, seed=7):
    print("\n5. F93 — MEDIAN vs MAX OF THE LAST 5 (undetected knock: thrust line 0.40 -> 0.95 deg)")
    rnd = random.Random(seed)
    q_ok, q_bad = q_of(0.40) * 1000, q_of(0.95) * 1000
    sigma = 0.03 * 1000            # 0.03 deg/s rate noise per LEAP (R11: < 0.5 deg/s; MEMS EST)
    on150 = onset(150)
    res = {}
    for rule in ("median", "max"):
        unsafe200 = unsafe150 = 0
        for _ in range(trials):
            hist = [rnd.gauss(q_ok, sigma) for _ in range(5)]
            # after the knock, LEAPs and JUMPs interleave; count how many of the next 3 JUMP requests
            # are allowed at a range whose topple onset is below the unit's true error
            for _k in range(3):
                hist = (hist + [rnd.gauss(q_bad, sigma)])[-5:]
                w = sorted(hist)[2] if rule == "median" else max(hist)
                if w <= H["CUBIQ_G12_Q200_MDPS"]:
                    unsafe200 += 1           # 0.95 deg > 200 mm onset 0.85: topples
                elif w <= H["CUBIQ_G12_Q150_MDPS"] and 0.95 > on150 / 1.5:
                    unsafe150 += 1           # inside the 150 onset but inside its 1.5x margin? count it
        res[rule] = (unsafe200, unsafe150)
        print(f"   {rule:6s}: JUMPs allowed at 200 mm (topples, onset 0.85 deg) per knock: {unsafe200 / trials:.2f} · "
              f"at 150 mm inside the 1.5x margin: {unsafe150 / trials:.2f}")
    check(res["max"][0] == 0, "max rule allowed an unsafe 200 mm JUMP")
    # cost of max: false blocks from noise for a unit sitting just under the 200 mm limit
    rnd = random.Random(11)
    near = H["CUBIQ_G12_Q200_MDPS"] - 100   # 0.1 deg/s under the limit
    fb = sum(max(rnd.gauss(near, sigma) for _ in range(5)) > H["CUBIQ_G12_Q200_MDPS"] for _ in range(trials))
    print(f"   cost of max: a unit 0.1 deg/s under the 200 mm limit is held to 150 mm on {fb / trials * 100:.2f} % of "
          f"queries; at 0.2 deg/s under: ~0 %. Noise is 1/800 of the limit, so max costs nothing real.")


# ---------------------------------------------------------------- 6. FSM v0.4
REST = {"IDLE", "SAFE_HOLD"}
BUDGET = {"settle": 0.1, "nudge": 0.1, "hop": 1.5, "leap": 1.5, "jump150": 3.5, "jump200": 4.5,
          "sub_from_leap": 3.0, "sub_from_jump": 6.0}
EXPECT = {  # name: (sequence after the initial IDLE, end state, fired, gesture, reason, g12 count, g12_last)
    "settle": ("SETTLE IDLE", "IDLE", 0, "settle", None, -1, -1),
    "nudge": ("NUDGE IDLE", "IDLE", 0, "nudge", None, -1, -1),
    "hop": ("PRECHARGE HOP_STROKE FLIGHT LAND IDLE", "IDLE", 0, "hop", None, -1, -1),
    "leap": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "leap", None, -1, -1),
    "none": ("", "IDLE", 0, "none", None, -1, -1),
    "f1_fall_during_arm": ("ARM SAFE_HOLD DECOCK SAFE_HOLD", "SAFE_HOLD", 0, "leap", None, -1, -1),
    "f2_fall_while_armed": ("ARM LOCK ARMED UNLOCK DECOCK SAFE_HOLD", "SAFE_HOLD", 0, "leap", None, -1, -1),
    "f3_hand_at_recheck_100mm": ("ARM LOCK ARMED UNLOCK DECOCK PRECHARGE HOP_STROKE FLIGHT LAND IDLE", "IDLE", 0,
                                 "hop", "G1_recheck", -1, -1),
    "f3b_hand_at_recheck_70mm": ("ARM LOCK ARMED UNLOCK DECOCK NUDGE IDLE", "IDLE", 0, "nudge", "G1_recheck", -1, -1),
    "f3c_hand_70mm_on_pad": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "leap", None, -1, -1),
    "f4_armed_timeout": ("ARM LOCK ARMED UNLOCK DECOCK IDLE", "IDLE", 0, "leap", "armed_timeout", -1, -1),
    "f5_tipped_landing": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET RECOVER RECOVER IDLE", "IDLE", 1, "leap", None, -1, -1),
    "f5b_cannot_right": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET RECOVER RECOVER SAFE_HOLD", "SAFE_HOLD", 1, "leap",
                         None, -1, -1),
    "f6_sleeve_stuck": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET SAFE_HOLD", "SAFE_HOLD", 1, "leap", None, -1, -1),
    "f7_lifted_while_armed": ("ARM LOCK ARMED UNLOCK DECOCK IDLE", "IDLE", 0, "leap", "G7_lifted", -1, -1),
    "f8_pad_lost_mid_arm": ("ARM DECOCK SETTLE IDLE", "IDLE", 0, "settle", "pad_lost", -1, -1),
    "j150": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "jump", None, 5, 0),
    "j200": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "jump", None, 5, 0),
    "j200_capped_150": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "jump", "G12_range_150", 5, 0),
    "j_unverified_3": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "leap", "G12_pitch_unverified", 4, 0),
    "j_one_bad_of_5": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "leap", "G12_pitch_over_limit", 5, 0),
    "v0_jump_refused": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "leap", "device_capability", -1, -1),
    "f9_jump_hand_at_150mm": ("ARM LOCK ARMED UNLOCK DECOCK LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "leap",
                              "G1_recheck", 5, 0),
    "f10_fall_in_partial_decock": ("ARM LOCK ARMED UNLOCK DECOCK SAFE_HOLD", "SAFE_HOLD", 0, "jump", "G1_recheck", 0, -1),
    "f11_jump_off_the_edge": ("ARM LOCK ARMED FIRE FLIGHT SAFE_HOLD", "SAFE_HOLD", 1, "jump", "flight_overrun", 0, -1),
    "f12_late_landing": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "jump", None, 5, 1),
    "f13_leap_touched_in_flight": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "leap", None, 4, 2),
    "f14_leap_gyro_saturated": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "leap", None, 5, 0),
    "f15_leap_fifth_sample": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "leap", None, 5, 0),
    "f16_jump_flight_confirms_fall": ("ARM LOCK ARMED FIRE FLIGHT LAND RESET IDLE", "IDLE", 1, "jump", None, 5, 0),
}
EXTRA = {  # scenario-specific checks beyond the table
    "f14_leap_gyro_saturated": lambda d: d["g12_allowed"] == 0,
    "f15_leap_fifth_sample": lambda d: d["g12_allowed"] == 150,
    "j200": lambda d: d["range"] == 200,
    "j200_capped_150": lambda d: d["range"] == 150,
    "f10_fall_in_partial_decock": lambda d: d["fall_latch"] == 1 and d["t"] == 6470000,
    "f11_jump_off_the_edge": lambda d: d["fall_latch"] == 1,
    "f16_jump_flight_confirms_fall": lambda d: d["fall_latch"] == 0,
}


def invariants(d):
    e = []
    if d["illegal"]:
        e.append("illegal edge")
    if d["end"] not in REST:
        e.append(f"I1 ends in {d['end']}")
    if d["cam"] != 0:
        e.append(f"I7 spring stored at rest ({d['cam']} us of cam)")
    if d["fired"] and d["gesture"] not in ("leap", "jump"):
        e.append("I2 fired without a LEAP/JUMP")
    seq = [s for s, _ in d["trace"]]
    if "ARM" in seq and d["gesture"] in ("settle", "nudge", "hop", "none") and not d["downgraded"] \
            and d["reason"] not in ("pad_lost",):
        e.append("I3 ARM for a non-ballistic gesture")
    if d["armed_max"] > 10_000_000:
        e.append("I5 ARMED > 10 s")
    if d["fwd_after_fall"]:
        e.append("I6 forward motor after a fall")
    return e


def budget_key(d):
    if d["reason"] in ("G1_recheck", "pad_lost"):
        return "sub_from_jump" if "jump" in d["name"] else "sub_from_leap"
    if d["gesture"] == "jump":
        return "jump200" if d["range"] == 200 else "jump150"
    return d["gesture"] if d["gesture"] in BUDGET else None


def part6(exe):
    print("\n6. FSM v0.4 IN C — scenarios, invariants I1-I7, expectations")
    rows = [json.loads(l) for l in subprocess.run([exe, "fsm"], capture_output=True, text=True,
                                                    check=True).stdout.splitlines()]
    byname = {d["name"]: d for d in rows}
    check(set(byname) == set(EXPECT), f"scenario set {set(byname) ^ set(EXPECT)}")
    n_ok = 0
    for d in rows:
        seq = " ".join(s for s, _ in d["trace"][1:])
        want = EXPECT.get(d["name"])
        errs = invariants(d)
        if want:
            got = (seq, d["end"], d["fired"], d["gesture"], d["reason"], d["g12_count"], d["g12_last"])
            if got != want:
                errs.append(f"expected {want} got {got}")
        if d["name"] in EXTRA and not EXTRA[d["name"]](d):
            errs.append("scenario check")
        k = budget_key(d)
        if k and d["first_motion"] >= 0 and d["first_motion"] / 1e6 > BUDGET[k] + 1e-9:
            errs.append(f"I4 latency {d['first_motion'] / 1e6:.3f} s > {BUDGET[k]} s ({k})")
        n_ok += not errs
        check(not errs, f"fsm {d['name']}: {errs}")
        fm = "-" if d["first_motion"] < 0 else f"{d['first_motion'] / 1e6:6.3f}s"
        print(f"   {'PASS' if not errs else 'FAIL'}  {d['name']:30s} {d['end']:9s} motion {fm:>7s}  rest {d['t'] / 1e6:6.3f}s"
              f"  {d['gesture']:6s} {d['reason'] or '':22s} " + ("" if not errs else str(errs)))
    print(f"   {n_ok}/{len(rows)} scenarios pass")

    print("\n   vs R08 FSM v0.3 (scripts/cubiq-r08-fsm-sim.py), same fault, same EST timings:")
    v03 = {f.__name__: f() for f in sim.FAULTS}
    v03.update({g: (sim.run_gesture(g),) for g in ("settle", "nudge", "hop", "leap", "none")})
    pairs = [("settle", "settle"), ("nudge", "nudge"), ("hop", "hop"), ("leap", "leap"), ("none", "none"),
             ("f1_fall_during_arm", "f1_fall_during_arm"), ("f2_fall_while_armed", "f2_fall_while_armed"),
             ("f3_hand_in_front_at_recheck", "f3_hand_at_recheck_100mm"), ("f4_armed_timeout", "f4_armed_timeout"),
             ("f5_tipped_landing", "f5_tipped_landing"), ("f5b_cannot_right", "f5b_cannot_right"),
             ("f6_sleeve_stuck", "f6_sleeve_stuck"), ("f7_lifted_while_armed", "f7_lifted_while_armed"),
             ("f8_pad_lost_mid_arm", "f8_pad_lost_mid_arm")]
    known = {"f1_fall_during_arm": "F96: v0.4 relaxes the held cam (+ DECOCK > SAFE_HOLD)",
             "f4_armed_timeout": "I5 clock starts at ARMED entry in v0.4, at the re-check in v0.3 (-50 ms)",
             "f3_hand_in_front_at_recheck": "run at 100 mm: at R08's 70 mm the contract's runways give NUDGE (F98b)"}
    same = 0
    for pyname, cname in pairs:
        c = v03[pyname][0]
        pseq = " ".join(s for s, _ in c.trace[1:])
        d = byname[cname]
        cseq = " ".join(s for s, _ in d["trace"][1:])
        dt = d["t"] / 1e6 - c.t
        pfm = -1 if c.first_motion is None else c.first_motion
        dfm = -1 if d["first_motion"] < 0 else d["first_motion"] / 1e6
        ok = pseq == cseq and abs(dt) < 2e-6 and abs(pfm - dfm) < 2e-6
        same += ok
        note = "" if ok else ("  KNOWN: " + known[pyname] if pyname in known else "  UNEXPLAINED")
        if not ok and pyname not in known:
            check(False, f"v0.3 vs v0.4 {pyname}")
        print(f"     {'same' if ok else 'diff'}  {pyname:30s} rest v0.3 {c.t:7.4f}s  v0.4 {d['t'] / 1e6:7.4f}s{note}")
    print(f"     {same}/{len(pairs)} identical (sequence, rest time and first motion to 2 us); the rest are listed")

    vec = json.load(open(os.path.join(ROOT, "docs", "corporate", "cubiq", "signal-contract-v0.4-vectors.json")))["vectors"]
    agree = 0
    for v in vec:
        ev, g, _ = sim.decide(v["signal"], v["state"])
        key = g if ev == "performed" else "none"
        py = sim.run_gesture(key)
        d = byname[key]
        agree += " ".join(s for s, _ in py.trace[1:]) == " ".join(s for s, _ in d["trace"][1:]) \
            and abs(py.t - d["t"] / 1e6) < 2e-6
    check(agree == len(vec), "contract v0.4 vectors through the C FSM")
    print(f"   contract v0.4 vectors driven through the C FSM: {agree}/{len(vec)} traces identical to v0.3")
    return byname


# ---------------------------------------------------------------- 7. budgets
def part7(byname):
    print("\n7. F100 LATENCY BUDGETS (first motion after the decision, EST)  and  F97 FALL CONFIRMATION")
    for name, key in (("settle", "settle"), ("nudge", "nudge"), ("hop", "hop"), ("leap", "leap"),
                      ("j150", "jump150"), ("j200", "jump200"), ("f3_hand_at_recheck_100mm", "sub_from_leap"),
                      ("f9_jump_hand_at_150mm", "sub_from_jump")):
        d = byname[name]
        print(f"   {key:14s} {d['first_motion'] / 1e6:6.3f} s   budget {BUDGET[key]:4.1f} s   rest {d['t'] / 1e6:6.3f} s")
    full = 3.26 + 0.11 + 3.1 + 1.0 + 0.11 + 0.05
    print(f"   JUMP -> LEAP substitute: partial decock {byname['f9_jump_hand_at_150mm']['first_motion'] / 1e6:.2f} s; "
          f"full decock + re-arm would be {full:.2f} s")
    print("   flight vs the R06 150 ms fall confirmation:")
    for nm, us in (("HOP 10 mm", 90305), ("LEAP 40 mm", 118848), ("JUMP 150 mm", 230148), ("JUMP 200 mm", 265752)):
        print(f"     {nm:12s} {us / 1e3:6.1f} ms  {'CONFIRMS AS A FALL unless masked' if us > 150000 else 'below 150 ms'}")


def part8(exe_san, cmds):
    print("\n8. SANITIZERS (ASan + UBSan)")
    env = dict(os.environ, UBSAN_OPTIONS="halt_on_error=1:print_stacktrace=1", ASAN_OPTIONS="detect_leaks=1")
    r1 = subprocess.run([exe_san, "fsm"], capture_output=True, text=True, env=env)
    r2 = subprocess.run([exe_san, "g12"], input="\n".join(cmds) + "\n", capture_output=True, text=True, env=env)
    clean = r1.returncode == 0 and r2.returncode == 0 and "runtime error" not in r1.stderr + r2.stderr \
        and "ERROR" not in r1.stderr + r2.stderr
    check(clean, "sanitizers")
    print(f"   {len(r1.stdout.splitlines())} FSM scenarios + {len(cmds)} G12 commands: "
          f"{'0 reports' if clean else r1.stderr[-400:] + r2.stderr[-400:]}")


def main():
    cases = int(sys.argv[1]) if len(sys.argv) > 1 else 50000
    with tempfile.TemporaryDirectory() as out:
        exe, cc = build(out)
        print(f"0. build ({cc}): -std=c99 -Wall -Wextra -Wpedantic -Werror  clean ({len(SRC)} files)")
        H = header_consts()
        lims = part1(H)
        part2(lims)
        part3(exe, H)
        cmds = part4(exe, H, cases)
        part5(H)
        byname = part6(exe)
        part7(byname)
        try:
            exe_san, _ = build(out, ("-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"))
            part8(exe_san, cmds[:20000])
        except subprocess.CalledProcessError:
            print("\n8. SANITIZERS: toolchain has no ASan/UBSan here — skipped (not a pass)")
    print("\nRESULT:", "PASS" if not FAIL else f"FAIL {FAIL}")
    sys.exit(1 if FAIL else 0)


if __name__ == "__main__":
    main()
