#!/usr/bin/env python3
"""LOT Pager z-stack budget (mm). Planning values, verify against datasheets."""
OPTS = {
 "A ~7.4mm full (camera+display+Qi)": [("front steel",0.8),("display IPS 0.96",1.6),("PCB 0.8",0.8),("LiPo 301525",3.0),("Qi coil+ferrite",0.4),("back steel",0.8)],
 "B ~5.4mm slim (0.6mm walls, OLED 0.91)": [("front steel",0.6),("OLED 0.91",1.2),("PCB 0.6",0.6),("LiPo 301220",2.0),("Qi coil+ferrite",0.4),("back steel",0.6)],
 "C ~4.8mm shell (no camera, no Qi, pogo charge)": [("front steel",0.5),("OLED 0.91",1.2),("PCB 0.6",0.6),("LiPo 2.0mm",2.0),("back steel",0.5)],
}
for n,l in OPTS.items():
    t=sum(v for _,v in l); print(f"{n}: {t:.1f} mm  {'OK<=5' if t<=5 else 'over 5mm by %.1f'%(t-5)}")
