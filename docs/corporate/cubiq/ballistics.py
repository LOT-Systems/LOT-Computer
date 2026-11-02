"""CUBIQ(TM) ballistics budget. Ideal projectile, flat surface, no drag, no
launch-surface slip. Elevation = angle above the table plane (90 = vertical).
Usage: python3 -I ballistics.py"""
import math
g = 9.81

def launch(mass_kg, range_m, elev_deg):
    th = math.radians(elev_deg)
    v = math.sqrt(range_m * g / math.sin(2 * th))
    vy = v * math.sin(th)
    return dict(v=v, ke_mJ=0.5 * mass_kg * v * v * 1e3, rise_mm=vy * vy / (2 * g) * 1e3,
                impulse_Ns=mass_kg * v, land_v=vy)

def vertical_hop(mass_kg, rise_m):
    v = math.sqrt(2 * g * rise_m)
    return dict(v=v, ke_mJ=0.5 * mass_kg * v * v * 1e3, impulse_Ns=mass_kg * v)

if __name__ == "__main__":
    print("v.0 HOP   120g 10mm rise :", vertical_hop(0.120, 0.010))
    print("v.0 LEAP  120g 40mm @75° :", launch(0.120, 0.040, 75))
    for e in (75, 60, 45):
        print(f"v.1 JUMP   90g 150mm @{e}° :", launch(0.090, 0.150, e))
    for stroke_mm in (3, 5, 8):
        j = launch(0.120, 0.040, 75)["impulse_Ns"]
        print(f"v.0 LEAP mean thrust over {stroke_mm}mm stroke ~ {j*j/(0.120*2*stroke_mm/1e3):.1f} N (net of gravity ignored)")
