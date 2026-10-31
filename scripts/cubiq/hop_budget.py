#!/usr/bin/env python3
"""CUBIQ(TM) v.0 ballistic + energy budget. Pure stdlib, no deps.

Usage: python3 scripts/cubiq/hop_budget.py
Rigid-body point-mass model, flat surface, no drag, no landing losses.
Numbers are lower bounds on launch energy; real units add actuator losses.
"""
import math

G = 9.81


def launch(range_m, mass_kg, elev_deg):
    """Launch speed, apex rise, kinetic energy for a given range and elevation angle."""
    th = math.radians(elev_deg)
    v = math.sqrt(range_m * G / math.sin(2 * th))
    rise = (v * math.sin(th)) ** 2 / (2 * G)
    ke = 0.5 * mass_kg * v * v
    return v, rise, ke


def row(name, range_mm, mass_g, elev):
    v, rise, ke = launch(range_mm / 1000, mass_g / 1000, elev)
    print(f"{name:<34} {range_mm:>5} mm {mass_g:>4} g {elev:>3}deg  "
          f"v={v:5.2f} m/s  rise={rise*1000:6.1f} mm  KE={ke*1000:6.1f} mJ")


print("== Ballistic budget ==")
row("v0 LEAP as written (80deg launch)", 40, 120, 80)   # 10deg off vertical
row("v0 LEAP, 60deg launch", 40, 120, 60)
row("v0 LEAP, 45deg launch", 40, 120, 45)
row("v1 LONG JUMP, 45deg", 150, 90, 45)
row("v1 LONG JUMP, 45deg, 120g", 150, 120, 45)
row("v1 DOCK JUMP, 250 mm, 45deg", 250, 90, 45)

print("\n== Pure vertical hop (THE HOP, <10 mm rise) ==")
for m in (120, 90):
    print(f"  m={m} g, rise=10 mm -> E = {m/1000*G*0.010*1000:.1f} mJ")

print("\n== Battery / jump-count (100 mAh, 3.7 V = {:.0f} J) ==".format(0.1 * 3.7 * 3600))
batt = 0.1 * 3.7 * 3600
for ke_mj, eff in ((70, 0.05), (70, 0.15), (90, 0.05)):
    per = ke_mj / 1000 / eff
    print(f"  KE={ke_mj} mJ, chain eff {eff:.0%}: {per:.2f} J/jump -> {batt/per:,.0f} jumps/charge")

print("\n== Levitation feasibility, 120 g cube, 45x45 mm base ==")
m, A = 0.120, 0.045 ** 2
w = m * G
print(f"  weight = {w:.2f} N ; base area = {A*1e4:.2f} cm2 ; mean pressure needed = {w/A:.0f} Pa")
# Acoustic radiation pressure ~ p_rms^2/(rho*c^2) (order of magnitude)
rho_c2 = 1.2 * 343 ** 2
for spl in (150, 160, 170, 175):
    p = 20e-6 * 10 ** (spl / 20)
    print(f"  {spl} dB SPL: p_rms={p:7.0f} Pa -> radiation pressure ~ {p*p/rho_c2:6.1f} Pa")
print("  -> acoustic needs ~170+ dB: infeasible/unsafe at 120 g. Magnetic (EMS) is the v.3 candidate.")
