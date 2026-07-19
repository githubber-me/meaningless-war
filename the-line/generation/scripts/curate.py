#!/usr/bin/env python3
"""
Heuristic curation pass for Phase B drafts.

For each shot in generation/drafts/<SHOT_ID>/, checks every variant image for:
  - file validity (opens as an image, non-trivial size)
  - "grayscale-ish": average per-pixel saturation (max channel - min channel)
    should be low, since the style bible forbids color/red
  - blown-out or blank frames (near-uniform pixel value = broken/empty generation)

Picks the best-scoring variant per shot (lowest saturation + not blank) as a
starting recommendation. This is a heuristic pre-pass; final judgment calls
for borderline shots are recorded by hand in CURATION.md.
"""
import os
import statistics
from PIL import Image

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DRAFTS_DIR = os.path.join(REPO_ROOT, "generation", "drafts")

SAT_OK_THRESHOLD = 18.0     # mean channel-spread below this = acceptably grayscale-ish
STD_BLANK_THRESHOLD = 8.0   # pixel stddev below this = suspiciously flat/blank


def analyze(path):
    try:
        im = Image.open(path).convert("RGB")
    except Exception as e:
        return {"ok": False, "error": str(e)}
    w, h = im.size
    if w < 200 or h < 200:
        return {"ok": False, "error": f"tiny image {w}x{h}"}

    # downsample for speed
    small = im.resize((128, 72))
    pixels = list(small.getdata())
    sats = []
    grays = []
    for r, g, b in pixels:
        sats.append(max(r, g, b) - min(r, g, b))
        grays.append((r + g + b) / 3)
    mean_sat = sum(sats) / len(sats)
    std_gray = statistics.pstdev(grays)
    # red-leak check: pixels where R is meaningfully higher than G and B
    red_pixels = sum(1 for r, g, b in pixels if r - max(g, b) > 25)
    red_frac = red_pixels / len(pixels)

    return {
        "ok": True,
        "size": f"{w}x{h}",
        "mean_saturation": round(mean_sat, 2),
        "gray_stddev": round(std_gray, 2),
        "red_frac": round(red_frac, 4),
        "grayscale_ok": mean_sat < SAT_OK_THRESHOLD,
        "not_blank": std_gray > STD_BLANK_THRESHOLD,
        "no_red_leak": red_frac < 0.02,
    }


def main():
    shot_ids = sorted(os.listdir(DRAFTS_DIR))
    report = {}
    for shot_id in shot_ids:
        shot_dir = os.path.join(DRAFTS_DIR, shot_id)
        if not os.path.isdir(shot_dir):
            continue
        variants = sorted(f for f in os.listdir(shot_dir) if f.lower().endswith((".jpg", ".jpeg", ".png")))
        results = []
        for v in variants:
            path = os.path.join(shot_dir, v)
            r = analyze(path)
            r["file"] = v
            results.append(r)
        report[shot_id] = results

    for shot_id, results in report.items():
        print(f"\n== {shot_id} ==")
        best = None
        best_score = None
        for r in results:
            if not r.get("ok"):
                print(f"  {r['file']}: BROKEN ({r.get('error')})")
                continue
            pass_all = r["grayscale_ok"] and r["not_blank"] and r["no_red_leak"]
            score = r["mean_saturation"] + (0 if r["not_blank"] else 100) + (0 if r["no_red_leak"] else 100)
            print(f"  {r['file']}: size={r['size']} sat={r['mean_saturation']} "
                  f"gray_std={r['gray_stddev']} red_frac={r['red_frac']} "
                  f"{'PASS' if pass_all else 'FLAG'}")
            if best_score is None or score < best_score:
                best_score = score
                best = r
        if best:
            print(f"  --> recommended: {best['file']} (score {best_score:.2f})")
        else:
            print("  --> NO USABLE VARIANT (all broken)")


if __name__ == "__main__":
    main()
