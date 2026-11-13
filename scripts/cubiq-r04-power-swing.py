#!/usr/bin/env python3
"""CUBIQ(tm) v.0 R04: coil power + thermal, pulse storage, off-pad battery budget,
v.2 swing-hop yaw sensitivity, landing slip, cross-track Monte Carlo.
Reproduces the numbers in docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0-R04.md. Stdlib only.
All inputs marked EST are placeholders for bench measurement, not datasheet values."""
import math
import random

G = 9.81
M = 0.120            # v.0 total mass, kg (R03 budget 115 g + margin)
M_R = 0.040          # moving reaction mass, kg (R03 D1')
STROKE = 0.008       # coil stroke, m (R03)
F_HOP = 4.4          # mean coil force for 10 mm HOP over 8 mm, N (R03 B1)
A = 0.045            # cube edge, m

print("== F14: coil electrical power for the HOP stroke ==")
a_r = F_HOP / M_R
t_stroke = math.sqrt(2 * STROKE / a_r)
E_mech = F_HOP * STROKE
print(f"  stroke time {t_stroke*1e3:.1f} ms  (mass accel {a_r:.0f} m/s^2), mech work {E_mech*1e3:.1f} mJ")
rows = []
for km in (0.7, 1.0, 1.5, 2.0):                  # motor constant N/sqrt(W), EST
    P = (F_HOP / km) ** 2                         # copper loss while holding F
    E_heat = P * t_stroke
    E_el = E_heat + E_mech
    I_batt = P / 3.7
    rows.append((km, P, E_el))
    print(f"  km={km:.1f} N/sqrtW  copper {P:5.1f} W  pulse energy {E_el*1e3:5.0f} mJ  "
          f"eff {E_mech/E_el:4.0%}  direct-from-cell current {I_batt:4.1f} A")
print("  300 mAh LiPo at 5C burst = 1.5 A -> the cell cannot drive the pulse directly.")

print("== F15: pulse storage capacitor (sized for worst case km=0.7) ==")
E_pulse = rows[0][2] * 1.25                       # +25 % driver losses
for name, v_hi, v_lo in (("supercap 5.0 V -> 3.0 V", 5.0, 3.0), ("electrolytic 16 V -> 10 V", 16.0, 10.0)):
    C = 2 * E_pulse / (v_hi ** 2 - v_lo ** 2)
    print(f"  {name:<28} C >= {C*1e3:7.1f} mF for {E_pulse*1e3:.0f} mJ")
for p_chg in (0.5, 1.0):
    print(f"  recharge at {p_chg:.1f} W from cell: {E_pulse/p_chg:.2f} s between HOPs")

print("== F16: coil thermal (adiabatic per pulse + first-order burst) ==")
C_th = 0.004 * 385                                # 4 g copper, J/K, EST
R_th = 30.0                                       # coil->ambient K/W through frame+shell, EST
tau = C_th * R_th
for km, P, E_el in rows:
    dT = (E_el - E_mech) / C_th
    burst = 10 * (E_el - E_mech)                  # 10 HOPs inside 10 s
    print(f"  km={km:.1f}: dT/HOP {dT:4.2f} K;  10 HOPs in 10 s -> <= {burst/C_th:4.1f} K rise (tau {tau:.0f} s)")
print("  -> R03 G4 rate caps are NOT thermally required; they stay as product rules.")

print("== F17: off-pad battery budget (300 mAh, 3.7 V, 80 % usable) ==")
E_cell = 0.300 * 3.7 * 3600 * 0.8
idle_W = 3.7 * 40e-6                              # MCU+BLE advertising+IMU wake, EST 40 uA
probe_J = 0.02                                    # resonance probe, EST
day = dict(nudge=(12, 0.05), hop=(4, E_pulse), leap=(1, 3.0), settle=(4, 0.4))  # count, J each
active = sum(n * e for n, e in day.values()) + 24 * probe_J
per_day = idle_W * 86400 + active
print(f"  usable {E_cell:.0f} J; idle {idle_W*86400:.1f} J/day; active {active:.1f} J/day "
      f"(LEAP re-cock 3 J EST)")
print(f"  -> {E_cell/per_day:.0f} days off-pad at the reference day; "
      f"{E_cell/(idle_W*86400 + 24*probe_J + 12*0.05):.0f} days NUDGE/SETTLE-only travel mode")

print("== F18: v.2 swing-hop yaw sensitivity to thrust-line offset ==")
I_z = M * A ** 2 / 6
for d_mm, ang in ((20, 45), (20, 60), (40, 60)):
    d = d_mm / 1000
    v = math.sqrt(G * d / math.sin(math.radians(2 * ang)))
    J = M * v
    t_f = 2 * v * math.sin(math.radians(ang)) / G
    yaw_per_mm = math.degrees(J * 0.001 / I_z * t_f)
    print(f"  hop {d_mm} mm @ {ang} deg: impulse {J*1e3:.0f} mN*s, flight {t_f*1e3:.0f} ms, "
          f"yaw {yaw_per_mm:.1f} deg per 1 mm offset")
print("  same sensitivity applies in pitch/roll (cube I is isotropic).")

print("== F19: landing slip — does the landing stick? ==")
e = 0.2                                           # elastomer restitution, EST
for ang in (45, 60, 70):
    need = 1 / ((1 + e) * math.tan(math.radians(ang)))
    print(f"  launch {ang} deg: landing sticks if mu >= {need:.2f}")
for mu in (0.4, 0.6, 0.8):
    d = 0.020; ang = 45
    v = math.sqrt(G * d / math.sin(math.radians(2 * ang)))
    vx = v * math.cos(math.radians(ang)); vz = v * math.sin(math.radians(ang))
    vx_after = max(0.0, vx - mu * (1 + e) * vz)
    print(f"  45 deg, 20 mm hop, mu={mu}: residual slide {vx_after**2/(2*mu*G)*1e3:4.1f} mm")

print("== F20: 200 mm directed traverse, cross-track error, Monte Carlo (N=20000) ==")
random.seed(4)
def traverse(hop_mm, sig_yaw_deg, sig_range, sig_slip_mm, heading_hold, n_trials=20000):
    errs = []
    n_hops = math.ceil(200 / hop_mm)
    for _ in range(n_trials):
        x = y = 0.0; h = 0.0
        for _ in range(n_hops):
            dyaw = math.radians(random.gauss(0, sig_yaw_deg))
            h = dyaw if heading_hold else h + dyaw     # hold: IMU re-aims before every hop
            r = hop_mm * (1 + random.gauss(0, sig_range))
            x += r * math.cos(h); y += r * math.sin(h)
            y += random.gauss(0, sig_slip_mm)
        errs.append(abs(y))
    errs.sort()
    return errs[int(0.98 * len(errs))]
for hop_mm in (20, 40):
    for hold in (False, True):
        p98 = traverse(hop_mm, 3.0, 0.10, 1.5, hold)
        print(f"  hop {hop_mm} mm, yaw sigma 3 deg, slip sigma 1.5 mm, "
              f"{'heading-hold' if hold else 'open-loop   '}: 98th pct |cross-track| {p98:5.1f} mm "
              f"{'PASS' if p98 < 15 else 'FAIL'} (<15)")
