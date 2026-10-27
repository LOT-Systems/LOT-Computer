#!/usr/bin/env python3
"""CUBIQ(TM) v.0 gesture physics sanity model — LOT-CUBIQ-QUANTUM-CUBE-v0-R02.

Ideal point-mass ballistics + a lossless internal-hammer launch model.
Order-of-magnitude design numbers ONLY: no drag, no spring/coil losses,
no foot compliance. Every figure here must be replaced by a measurement
from the bench rig (R02 section 08).

Run: python3 cubiq_v0_physics.py
"""
import math

G = 9.81


def launch(label, mass_kg, hammer_kg, rise_m, range_m, stroke_m):
    """Gesture reaching `rise_m` apex height and `range_m` flat-ground range.

    Launch speed/angle follow from the ballistic pair (apex, range).
    The hammer strikes inelastically (momentum shared with the shell):
    m_h * v_h = M * v.  Stroke acceleration is constant over `stroke_m`.
    """
    vy = math.sqrt(2 * G * rise_m)
    t_flight = 2 * vy / G
    vx = range_m / t_flight
    v = math.hypot(vx, vy)
    elev = math.degrees(math.atan2(vy, vx))          # from horizontal
    off_vertical = 90.0 - elev
    ke_shell = 0.5 * mass_kg * v * v
    v_h = mass_kg * v / hammer_kg
    ke_hammer = 0.5 * hammer_kg * v_h * v_h
    accel = v_h * v_h / (2 * stroke_m)
    force = hammer_kg * accel
    t_stroke = v_h / accel
    mu_min = math.tan(math.radians(off_vertical))     # foot friction to hold the strike axis
    land_v = math.sqrt(2 * G * rise_m)
    return (f"{label:<26} v={v:4.2f} m/s  off-vertical={off_vertical:4.1f} deg  "
            f"shell KE={ke_shell*1e3:5.1f} mJ  hammer KE={ke_hammer*1e3:5.1f} mJ  "
            f"stroke F={force:4.1f} N / {t_stroke*1e3:4.1f} ms  mu_min={mu_min:4.2f}  "
            f"land v={land_v:3.2f} m/s")


def spec_check(mass_kg, range_m, bias_deg):
    """v.0 spec as written (S3/S4): 40 mm range with a 5-15 deg bias off vertical."""
    th = math.radians(90 - bias_deg)
    v2 = range_m * G / math.sin(2 * th)
    rise = v2 * math.sin(th) ** 2 / (2 * G)
    return f"  bias {bias_deg:>2} deg -> apex {rise*1e3:5.1f} mm  shell KE {0.5*mass_kg*v2*1e3:5.1f} mJ"


if __name__ == "__main__":
    print("SPEC-AS-WRITTEN CHECK (M=120 g, 40 mm range):")
    for b in (5, 10, 15):
        print(spec_check(0.120, 0.040, b))
    print("  -> HOP is specified at <10 mm rise; none of the above comes close.\n")
    print("RE-DERIVED GESTURES (M, hammer, rise, range, stroke):")
    print(launch("THE HOP   (v.0)", 0.120, 0.030, 0.010, 0.000, 0.010))
    print(launch("THE LEAP  (v.0 rev)", 0.120, 0.030, 0.010, 0.040, 0.010))
    print(launch("LONG JUMP (v.1)", 0.090, 0.025, 0.040, 0.150, 0.012))
    print()
    print("Weight to defeat for levitation: 120 g -> %.2f N ; 90 g -> %.2f N"
          % (0.120 * G, 0.090 * G))
