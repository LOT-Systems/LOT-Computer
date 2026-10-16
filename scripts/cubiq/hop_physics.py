#!/usr/bin/env python3
"""CUBIQ(TM) v.0 hop/leap energy budget. Reproduces the tables in
docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-REPORT-02.md. Stdlib only.

Model: internal hammer of mass mr strikes the shell inelastically, so the
shell+hammer body (total mass M) leaves with V = mr*vr/M and the hammer
needs KE = E_body * M/mr. Ballistic flight on a flat surface, no drag.
"""
import math

G = 9.81


def ballistic(range_m, off_deg):
    """Launch speed, apex, flight time for a given range and off-vertical bias."""
    th = math.radians(90 - off_deg)
    v2 = range_m * G / math.sin(2 * th)
    return math.sqrt(v2), v2 * math.sin(th) ** 2 / (2 * G), 2 * math.sqrt(v2) * math.sin(th) / G


def row(label, M, mr, range_m, off, stroke_m):
    v, apex, T = ballistic(range_m, off)
    e_body = 0.5 * M * v * v
    e_ham = e_body * M / mr
    print(f"{label:<12} M={M*1e3:>4.0f}g mr={mr*1e3:>3.0f}g range={range_m*1e3:>4.0f}mm bias={off:>2}deg "
          f"v={v:.2f}m/s apex={apex*1e3:>4.0f}mm T={T*1e3:>3.0f}ms "
          f"E_body={e_body*1e3:>4.0f}mJ E_hammer={e_ham*1e3:>4.0f}mJ F_avg@{stroke_m*1e3:.0f}mm={e_ham/stroke_m:>4.1f}N")


def vertical(label, M, mr, rise_m, stroke_m):
    v = math.sqrt(2 * G * rise_m)
    e_body = 0.5 * M * v * v
    e_ham = e_body * M / mr
    print(f"{label:<12} M={M*1e3:>4.0f}g mr={mr*1e3:>3.0f}g rise={rise_m*1e3:>3.0f}mm v={v:.2f}m/s "
          f"T={2*v/G*1e3:>3.0f}ms E_body={e_body*1e3:>4.1f}mJ E_hammer={e_ham*1e3:>4.1f}mJ "
          f"F_avg@{stroke_m*1e3:.0f}mm={e_ham/stroke_m:>4.1f}N")


if __name__ == "__main__":
    M, a = 0.120, 0.045
    I = M * a * a / 6
    print("== HOP (vertical) ==")
    vertical("HOP 5mm", M, 0.045, 0.005, 0.010)
    vertical("HOP 10mm", M, 0.045, 0.010, 0.010)
    print("== LEAP (v0.1 target: 40mm range, 5-15deg bias) ==")
    for off in (5, 10, 15):
        row(f"LEAP40/{off}", M, 0.045, 0.040, off, 0.015)
    print("== SHORT LEAP (v0.2 re-baseline: 20mm range, 25deg bias) ==")
    row("LEAP20/25", M, 0.045, 0.020, 25, 0.010)
    print("== LONG JUMP (v.1: 150mm, M=90g, mr=45g) ==")
    for off in (45, 35, 25):
        row(f"LJ150/{off}", 0.090, 0.045, 0.150, off, 0.020)
    print("== FLIGHT ROTATION BUDGET (<10deg tumble) ==")
    for label, rise in (("HOP 10mm", 0.010), ("SHORT LEAP", None)):
        if rise:
            v, T = math.sqrt(2 * G * rise), 2 * math.sqrt(2 * G * rise) / G
            p = M * v
        else:
            v, apex, T = ballistic(0.020, 25)
            p = M * v
        w = math.radians(10) / T
        print(f"{label:<12} T={T*1e3:.0f}ms max_w={w:.2f}rad/s max_L={I*w*1e6:.0f}uNms "
              f"p={p:.3f}Ns max_line_of_action_offset={I*w/p*1e3:.2f}mm")
    print(f"required foot friction at 25deg bias: mu >= {math.tan(math.radians(25)):.2f}")
