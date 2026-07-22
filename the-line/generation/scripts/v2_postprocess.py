#!/usr/bin/env python3
"""V2 post-processing: heroes -> true-grayscale normalized finals.

Adapted from postprocess_finals.py. Picks the curated hero file per shot
(_r2 re-roll where that won), collapses to exact R=G=B grayscale, autocontrast
(1% cutoff), saves to v2/finals/<ID>.jpg, then reloads and verifies channel
divergence <= 2 (JPEG quantization epsilon).
"""
import os
import sys
from PIL import Image, ImageOps, ImageChops

V2 = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "v2")
HEROES = os.path.join(V2, "heroes")
FINALS = os.path.join(V2, "finals")

RE_ROLL_WINNERS = {"R09", "R10", "R11", "R23", "R25", "M5"}
SHOTS = [f"R{n:02d}" for n in range(1, 29)] + [f"M{n}" for n in range(1, 6)]


def divergence(img):
    r, g, b = img.split()
    mx = ImageChops.lighter(ImageChops.lighter(r, g), b)
    mn = ImageChops.darker(ImageChops.darker(r, g), b)
    return ImageChops.difference(mx, mn).getextrema()[1]


def main():
    os.makedirs(FINALS, exist_ok=True)
    bad = []
    for sid in SHOTS:
        suffix = "_r2" if sid in RE_ROLL_WINNERS else ""
        src = os.path.join(HEROES, f"{sid}{suffix}.jpg")
        gray = ImageOps.autocontrast(ImageOps.grayscale(Image.open(src).convert("RGB")), cutoff=1)
        dest = os.path.join(FINALS, f"{sid}.jpg")
        Image.merge("RGB", (gray,) * 3).save(dest, quality=95)
        d = divergence(Image.open(dest).convert("RGB"))
        ok = d <= 2
        if not ok:
            bad.append(sid)
        print(f"[{sid}] {os.path.basename(src)} -> finals/{sid}.jpg | divergence={d} | {'OK' if ok else 'FAIL'}")
    if bad:
        print("FAILED:", bad, file=sys.stderr)
        sys.exit(1)
    print(f"All {len(SHOTS)} finals verified true grayscale (divergence <= 2/255).")


if __name__ == "__main__":
    main()
