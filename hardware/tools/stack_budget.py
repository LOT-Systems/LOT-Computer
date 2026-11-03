#!/usr/bin/env python3
"""LOT Pager z-height stack budget. All thicknesses mm, (est.) from typical datasheets."""
import sys
STACKS = {
 "v0.1 dev (8 mm)": [("steel back",0.8),("battery 100mAh",3.0),("PCB 0.8",0.8),("ESP32-S3-MINI",2.4),("LCD+window",0.2)],
 "v0.2 (6 mm)": [("steel back",0.5),("battery 80mAh",2.0),("PCB 0.6 (side-by-side parts)",0.6),("LCD panel",1.5),("glass window",0.5),("bezel margin",0.2)],
 "v1.0 (5 mm target)": [("steel back",0.5),("battery 60mAh",1.6),("PCB 0.6",0.6),("LCD 1.1 panel",1.1),("glass window 0.4",0.4),("adhesive/gaps",0.3)],
}
LIMITS = {"v0.1 dev (8 mm)":8.0,"v0.2 (6 mm)":6.0,"v1.0 (5 mm target)":5.0}
# Columns that were missing from the first pass: camera and Qi coil (parts that cannot sit beside each other).
STACKS["v0.2 camera column (6 mm)"]=[("steel back",0.5),("PCB 0.6",0.6),("camera module (flat DVP)",3.2),("glass window",0.5),("bezel margin",0.2)]
STACKS["v1.0 camera column (5 mm)"]=[("steel back",0.5),("PCB 0.6",0.6),("camera module (flat DVP)",3.2),("glass window 0.4",0.4),("gaps",0.3)]
STACKS["v1.0 Qi column (5 mm)"]=[("steel back",0.5),("battery 60mAh",1.6),("ferrite 0.2",0.2),("Qi coil FPC",0.5),("PCB 0.6",0.6),("glass window 0.4",0.4),("gaps",0.3)]
LIMITS["v0.2 camera column (6 mm)"]=6.0; LIMITS["v1.0 camera column (5 mm)"]=5.0; LIMITS["v1.0 Qi column (5 mm)"]=5.0
ok=True
for name,items in STACKS.items():
    t=sum(v for _,v in items); lim=LIMITS[name]
    print(f"{name}: {t:.1f} mm / {lim:.1f}  {'PASS' if t<=lim+1e-9 else 'FAIL'}")
    for n,v in items: print(f"   {v:4.1f}  {n}")
    ok &= t<=lim+1e-9
sys.exit(0 if ok else 1)
