#!/usr/bin/env python3
"""CUBIQ(tm) Quantum Cube v.0 — R08: signal contract v0.4 + firmware FSM v0.3 simulator.
Stdlib only. Spec: docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R08.md §05-§06.

  1. contract v0.4 = v0.3 decide() (scripts/cubiq-r07-contract-check.py, imported unchanged)
     + the home-pad credit: on a known LOT pad, at the home spot, the SURFACE is certified
     (damped, deck edges known: shorter runway) but never the AIRSPACE.
  2. every one of the 54 vectors is driven through the FSM v0.3 state table; each trace is
     checked against invariants I1-I6.
  3. eight fault scenarios (F1-F8) inject events mid-gesture.
Exit code 0 only if all vectors, traces and fault scenarios pass."""
import importlib.util
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("c03", os.path.join(HERE, "cubiq-r07-contract-check.py"))
c03 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(c03)

G = 9.81
PAD_FREE_AHEAD_MM = {"leap": 60, "hop": 20}     # deck-certified runway from the home spot (R08 §04)


# ------------------------------------------------------------------ contract v0.4
def decide(sig, st):
    pad = st.get("pad") or {}
    if pad.get("model_ok") and pad.get("home_spot"):
        st = dict(st)
        # surface credit: pad-certified DAMPED; G7 dirty windows untouched (airspace)
        if not st.get("tof_window_dirty"):
            st["surface"] = "damped"
        saved = dict(c03.FREE_AHEAD_MM)
        c03.FREE_AHEAD_MM.update(PAD_FREE_AHEAD_MM)
        try:
            return c03.decide(sig, st)
        finally:
            c03.FREE_AHEAD_MM.clear()
            c03.FREE_AHEAD_MM.update(saved)
    return c03.decide(sig, st)


# ------------------------------------------------------------------ FSM v0.3 timing (s, EST)
def flight(rise_m):
    return 2 * math.sqrt(2 * rise_m / G)


T = {
    "SETTLE": 2.0, "NUDGE": 0.6, "PRECHARGE": 1.0, "HOP_STROKE": 0.0121,
    "ARM": 1.1, "LOCK": 0.11, "RECHECK": 0.05, "FIRE": 0.056, "LEAP_STROKE": 0.0108,
    "FLIGHT_HOP": flight(0.010), "FLIGHT_LEAP": flight(0.017), "RESET": 0.2,
    "RECOVER": 0.3, "UNLOCK": 0.11, "DECOCK": 1.1, "LOOK": 0.1,
}
LATENCY_MAX = {"settle": 0.1, "nudge": 0.1, "hop": 1.5, "leap": 1.5}
LATENCY_DOWNGRADE_MAX = 3.0   # substitute gesture after an abandoned ARM (R08 F57)
ARMED_MAX = 10.0
REST = {"IDLE", "SAFE_HOLD"}

# state -> allowed next states (the state table, R08 §05)
TABLE = {
    "IDLE":        {"SETTLE", "NUDGE", "PRECHARGE", "ARM", "IDLE", "SAFE_HOLD"},
    "SETTLE":      {"IDLE"},
    "NUDGE":       {"IDLE"},
    "PRECHARGE":   {"HOP_STROKE", "IDLE", "SAFE_HOLD", "NUDGE"},
    "HOP_STROKE":  {"FLIGHT"},
    "ARM":         {"LOCK", "DECOCK", "SAFE_HOLD"},
    "LOCK":        {"ARMED", "UNLOCK", "SAFE_HOLD"},
    "ARMED":       {"FIRE", "UNLOCK", "SAFE_HOLD"},
    "UNLOCK":      {"DECOCK", "SAFE_HOLD"},
    "DECOCK":      {"IDLE", "PRECHARGE", "NUDGE", "SETTLE", "SAFE_HOLD"},
    "FIRE":        {"FLIGHT"},
    "FLIGHT":      {"LAND", "SAFE_HOLD"},
    "LAND":        {"RESET", "RECOVER", "IDLE"},
    "RESET":       {"IDLE", "RECOVER", "SAFE_HOLD"},
    "RECOVER":     {"IDLE", "SAFE_HOLD", "RECOVER"},
    "SAFE_HOLD":   {"SAFE_HOLD"},
}
# stored spring energy by state: "zero" | "rising" | "full"
SPRING = {"ARM": "rising", "LOCK": "full", "ARMED": "full", "UNLOCK": "full", "DECOCK": "rising"}


class Cube:
    def __init__(self):
        self.state, self.t, self.trace, self.fired, self.fall_seen = "IDLE", 0.0, [("IDLE", 0.0)], False, False
        self.motor_fwd_after_fall = False
        self.spring_full_since = None
        self.armed_time = 0.0
        self.err = []
        self.first_motion = None

    def go(self, nxt, dt=None):
        if nxt not in TABLE[self.state]:
            self.err.append(f"illegal {self.state}->{nxt}")
        if nxt in ("ARM", "LOCK") and self.fall_seen:
            self.motor_fwd_after_fall = True
        if nxt == "FIRE":
            self.fired = True
        if self.first_motion is None and nxt in ("SETTLE", "NUDGE", "HOP_STROKE", "FIRE"):
            self.first_motion = self.t
        self.state = nxt
        self.t += T.get(nxt, 0.0) if dt is None else dt
        self.trace.append((nxt, round(self.t, 4)))

    # gesture paths ------------------------------------------------------------
    def settle(self):
        self.go("SETTLE"); self.go("IDLE")

    def nudge(self):
        self.go("NUDGE"); self.go("IDLE")

    def hop(self, tip_deg=0.0):
        self.go("PRECHARGE"); self.go("HOP_STROKE"); self.go("FLIGHT", T["FLIGHT_HOP"]); self.go("LAND")
        self.land(tip_deg, sleeve=False)

    def land(self, tip_deg, sleeve=True, sleeve_ok=True):
        if sleeve:
            self.go("RESET")
            if not sleeve_ok:
                self.go("SAFE_HOLD"); return
        if tip_deg > 25:
            for _ in range(2):
                self.go("RECOVER")
                tip_deg = tip_deg - 20       # EST: one corrective pulse rights ~20 deg
                if tip_deg <= 25:
                    break
            self.go("IDLE" if tip_deg <= 25 else "SAFE_HOLD")
        else:
            self.go("IDLE")

    def arm_lock(self):
        self.go("ARM"); self.go("LOCK"); self.go("ARMED", T["RECHECK"])

    def decock(self):
        self.go("UNLOCK") if self.state in ("LOCK", "ARMED") else None
        self.go("DECOCK")

    def leap(self, tip_deg=0.0, sleeve_ok=True):
        self.arm_lock(); self.go("FIRE"); self.go("FLIGHT", T["LEAP_STROKE"] + T["FLIGHT_LEAP"])
        self.go("LAND", 0.0); self.land(tip_deg, sleeve=True, sleeve_ok=sleeve_ok)


def run_gesture(g):
    c = Cube()
    {"settle": c.settle, "nudge": c.nudge, "hop": c.hop, "leap": c.leap, "none": lambda: None}[g]()
    return c


def check(c, gesture, event, armed_intent=False):
    e = list(c.err)
    if c.state not in REST:
        e.append(f"I1 ends in {c.state}")                                  # I1 rest with zero spring
    if SPRING.get(c.state, "zero") != "zero":
        e.append("I1 spring not zero at rest")
    if c.fired and not (event == "performed" and gesture in ("leap", "jump")):
        e.append("I2 fired without a performed leap")                       # I2
    if any(s == "ARM" for s, _ in c.trace) and gesture not in ("leap", "jump") and not armed_intent:
        e.append("I3 ARM for a non-ballistic-spring gesture")              # I3
    lim = LATENCY_DOWNGRADE_MAX if armed_intent else LATENCY_MAX.get(gesture)
    if lim is not None and c.first_motion is not None and c.first_motion > lim:
        e.append(f"I4 latency {c.first_motion:.2f}s > {lim}s")
    armed = [t for (s, t) in c.trace if s == "ARMED"]
    if armed and c.armed_time > ARMED_MAX:
        e.append("I5 ARMED > 10 s")                                          # I5
    if c.motor_fwd_after_fall:
        e.append("I6 motor forward after fall")                              # I6
    return e


# ------------------------------------------------------------------ fault scenarios
def f1_fall_during_arm():
    c = Cube(); c.go("ARM", 0.5)                      # half way up the cam
    c.fall_seen = True; c.go("SAFE_HOLD")             # motor stop, worm self-locks; decock after self-test
    return c, "leap", "performed_aborted", lambda c: not c.fired and c.state == "SAFE_HOLD"


def f2_fall_while_armed():
    c = Cube(); c.arm_lock()
    c.fall_seen = True; c.go("UNLOCK"); c.go("DECOCK"); c.go("SAFE_HOLD")   # reverse only: away from the edge
    return c, "leap", "performed_aborted", lambda c: not c.fired and c.state == "SAFE_HOLD"


def f3_hand_in_front_at_recheck():
    c = Cube(); c.arm_lock()                          # re-check: free_ahead 300 -> 70 mm (hand)
    c.decock(); c.go("PRECHARGE", 0.0)               # supercap precharged DURING the decock (F57)
    c.go("HOP_STROKE"); c.go("FLIGHT", T["FLIGHT_HOP"]); c.go("LAND"); c.go("IDLE")
    return c, "hop", "performed", lambda c: not c.fired and c.state == "IDLE", True


def f4_armed_timeout():
    c = Cube(); c.arm_lock(); c.armed_time = 10.0; c.t += 10.0   # IMU never still: re-check never passes
    c.decock(); c.go("IDLE")
    return c, "leap", "deferred", lambda c: not c.fired and c.state == "IDLE"


def f5_tipped_landing():
    c = Cube(); c.leap(tip_deg=60.0)                  # 60 -> 40 -> 20: righted on the 2nd pulse
    return c, "leap", "performed", lambda c: c.state == "IDLE" and sum(s == "RECOVER" for s, _ in c.trace) == 2


def f5b_cannot_right():
    c = Cube(); c.leap(tip_deg=80.0)                  # 80 -> 60 -> 40: stays tipped
    return c, "leap", "performed", lambda c: c.state == "SAFE_HOLD"


def f6_sleeve_stuck():
    c = Cube(); c.leap(sleeve_ok=False)               # B27 failure: level > 1 deg after 200 ms
    return c, "leap", "performed", lambda c: c.state == "SAFE_HOLD"


def f7_lifted_while_armed():
    c = Cube(); c.arm_lock(); c.decock(); c.go("IDLE")   # G7 unplaced: never fire in a hand
    return c, "leap", "performed_aborted", lambda c: not c.fired and c.state == "IDLE"


def f8_pad_lost_mid_arm():
    c = Cube(); c.go("ARM", 0.6)                      # Qi lost: pad credit withdrawn, own probe says resonant
    c.go("DECOCK", 0.6)                               # decock time = time spent arming
    c.go("SETTLE"); c.go("IDLE")                      # contract re-run: leap -> settle (G6)
    return c, "settle", "performed", lambda c: not c.fired and c.state == "IDLE", True


FAULTS = [f1_fall_during_arm, f2_fall_while_armed, f3_hand_in_front_at_recheck, f4_armed_timeout,
          f5_tipped_landing, f5b_cannot_right, f6_sleeve_stuck, f7_lifted_while_armed, f8_pad_lost_mid_arm]


def main():
    path = os.path.join(HERE, "..", "docs", "corporate", "cubiq", "signal-contract-v0.4-vectors.json")
    vectors = json.load(open(path))["vectors"]
    fails = 0
    print("CONTRACT v0.4 + FSM v0.3 TRACE")
    for v in vectors:
        got = decide(v["signal"], v["state"])
        want = (v["expect"]["event"], v["expect"]["performed"], v["expect"]["downgrade_reason"])
        c = run_gesture(got[1] if got[0] == "performed" else "none")
        errs = ([] if got == want else [f"contract expected {want}"]) + check(c, got[1], got[0])
        fails += bool(errs)
        lat = "-" if c.first_motion is None else f"{c.first_motion:5.3f}s"
        print(f"  {'PASS' if not errs else 'FAIL'}  {v['name']:42s} {got[0]:9s} {got[1]:6s} "
              f"latency {lat:>7s}  done {c.t:5.3f}s  {len(c.trace) - 1:2d} steps" + ("" if not errs else f"  {errs}"))
    print(f"  {len(vectors) - fails}/{len(vectors)} vectors pass contract + trace invariants")

    print("\nFAULT INJECTION")
    ffails = 0
    for f in FAULTS:
        c, g, ev, ok, *dg = f()
        errs = check(c, g, "performed" if ev == "performed" else ev, armed_intent=bool(dg))
        if g == "leap" and c.fired and ev == "performed":
            errs = [x for x in errs if not x.startswith("I2")]
        good = ok(c) and not errs
        ffails += not good
        fm = "-" if c.first_motion is None else f"{c.first_motion:.2f}s"
        print(f"  {'PASS' if good else 'FAIL'}  {f.__name__:28s} end {c.state:9s} fired {str(c.fired):5s} "
              f"motion {fm:>6s}  t {c.t:6.3f}s  " + " > ".join(s for s, _ in c.trace[1:]) + ("" if good else f"  {errs}"))
    print(f"  {len(FAULTS) - ffails}/{len(FAULTS)} fault scenarios pass")

    print("\nTIMING BUDGET (EST)")
    for g in ("settle", "nudge", "hop", "leap"):
        c = run_gesture(g)
        print(f"  {g:6s} first motion {c.first_motion:6.3f} s (max {LATENCY_MAX[g]}s)   back at rest {c.t:6.3f} s")
    print(f"  flight: HOP {T['FLIGHT_HOP'] * 1000:.0f} ms, LEAP {T['FLIGHT_LEAP'] * 1000:.0f} ms;"
          f"  spring stored per LEAP {T['LOCK'] + T['RECHECK'] + T['FIRE']:.3f} s at full energy")
    sys.exit(1 if fails or ffails else 0)


if __name__ == "__main__":
    main()
