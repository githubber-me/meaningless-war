#!/usr/bin/env python3
"""
Phase C hero regeneration for "The Line".

Regenerates only the hero-frame shots (held on screen longer than ~1s) on
FLUX.2 [pro] (fal-ai/flux-pro/v1.1), one image per shot, at 1344x768
(~1.03MP, ~$0.03/image at $0.03/MP). Uses each shot's winning draft prompt
verbatim from generation/prompts/<SHOT_ID>.txt (no edits — CURATION.md
flagged no defects worth fixing on any of the picked variants).

Hero shot list (see budget.md / this repo's Phase C report for reasoning):
  H01-H10 (all ten hero frames enumerated in plan.md step 2 / script.md's
  slower sections) + W12 (the rows-of-crosses frame, held 8 seconds in
  silence at the end of the War montage per script.md's timing map/audio
  note). W01-W11 are sub-400ms montage cuts and keep their Schnell drafts.

Saves raw regenerated images to generation/drafts/<SHOT_ID>/<SHOT_ID>_pro.jpg
(kept alongside Schnell drafts as the source for post-processing) and
appends a row to budget.md after every single call.

Usage:
    FAL_KEY=... python3 generate_heroes.py
"""
import datetime
import json
import os
import sys
import time
import urllib.error
import urllib.request

FAL_KEY = os.environ.get("FAL_KEY")
if not FAL_KEY:
    print("FAL_KEY not set in environment", file=sys.stderr)
    sys.exit(1)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GEN_DIR = os.path.join(REPO_ROOT, "generation")
PROMPTS_DIR = os.path.join(GEN_DIR, "prompts")
DRAFTS_DIR = os.path.join(GEN_DIR, "drafts")
BUDGET_MD = os.path.join(REPO_ROOT, "budget.md")

ENDPOINT = "https://fal.run/fal-ai/flux-pro/v1.1"
ENDPOINT_NAME = "fal-ai/flux-pro/v1.1"
WIDTH, HEIGHT = 1344, 768
MEGAPIXELS = (WIDTH * HEIGHT) / 1_000_000.0
UNIT_PRICE = round(0.03 * MEGAPIXELS, 4)  # USD per image at $0.03/MP

PHASE_C_TARGET = 9.00
NOTIFY_THRESHOLD = 10.00
HARD_CAP = 12.00

HERO_SHOT_IDS = [f"H{n:02d}" for n in range(1, 11)] + ["W12"]


def read_prompt(shot_id):
    path = os.path.join(PROMPTS_DIR, f"{shot_id}.txt")
    with open(path) as f:
        lines = f.readlines()
    body = [l.rstrip("\n") for l in lines if l.strip() and not l.startswith("#")]
    return body[-1]


def read_cumulative():
    with open(BUDGET_MD) as f:
        content = f.read()
    cum = 0.0
    for line in content.splitlines():
        if line.startswith("|") and "Cumulative" not in line and set(line.strip()) != {"|", "-"}:
            cols = [c.strip() for c in line.strip("|").split("|")]
            if len(cols) >= 6 and cols[5].startswith("$"):
                try:
                    cum = float(cols[5].replace("$", ""))
                except ValueError:
                    pass
    return cum


def append_budget_row(date, endpoint, count, unit_price, batch_cost, cumulative, note=""):
    row = f"| {date} | {endpoint} | {count} | ${unit_price:.4f} | ${batch_cost:.4f} | ${cumulative:.4f} |"
    if note:
        row += f" {note}"
    row += "\n"
    with open(BUDGET_MD, "a") as f:
        f.write(row)


def call_fal(prompt):
    payload = {
        "prompt": prompt,
        "image_size": {"width": WIDTH, "height": HEIGHT},
        "num_images": 1,
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Key {FAL_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        return json.loads(resp.read().decode("utf-8"))


def download(url, dest):
    with urllib.request.urlopen(url, timeout=60) as resp:
        data = resp.read()
    with open(dest, "wb") as f:
        f.write(data)
    return len(data)


def main():
    cumulative = read_cumulative()
    print(f"Starting cumulative spend: ${cumulative:.4f}")
    print(f"Unit price per hero image: ${UNIT_PRICE:.4f} ({MEGAPIXELS:.3f} MP @ $0.03/MP)")

    log = []
    for shot_id in HERO_SHOT_IDS:
        batch_cost = UNIT_PRICE

        if cumulative + batch_cost > HARD_CAP:
            print(f"HARD STOP: batch for {shot_id} (${batch_cost:.4f}) would push cumulative "
                  f"(${cumulative:.4f}) past hard cap ${HARD_CAP:.2f}. Halting immediately, "
                  f"this batch NOT placed.")
            break
        if cumulative + batch_cost > PHASE_C_TARGET:
            print(f"STOP: batch for {shot_id} (${batch_cost:.4f}) would push cumulative "
                  f"(${cumulative:.4f}) past Phase C target ${PHASE_C_TARGET:.2f}. Halting "
                  f"generation for this phase and reporting.")
            break

        shot_dir = os.path.join(DRAFTS_DIR, shot_id)
        os.makedirs(shot_dir, exist_ok=True)
        dest = os.path.join(shot_dir, f"{shot_id}_pro.jpg")
        if os.path.exists(dest):
            print(f"[{shot_id}] pro image already exists, skipping.")
            continue

        prompt = read_prompt(shot_id)
        print(f"[{shot_id}] requesting FLUX.2 pro regeneration...")
        try:
            result = call_fal(prompt)
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            print(f"[{shot_id}] HTTP ERROR {e.code}: {body}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"[{shot_id}] ERROR: {e}", file=sys.stderr)
            continue

        images = result.get("images", [])
        if not images:
            print(f"[{shot_id}] no images returned: {result}", file=sys.stderr)
            continue

        url = images[0].get("url")
        try:
            size = download(url, dest)
            print(f"  saved {dest} ({size} bytes)")
        except Exception as e:
            print(f"  FAILED to download: {e}", file=sys.stderr)
            continue

        cumulative += batch_cost
        date = datetime.date.today().isoformat()
        append_budget_row(date, ENDPOINT_NAME, 1, UNIT_PRICE, batch_cost, cumulative,
                           note=f"Phase C hero: {shot_id}")
        print(f"[{shot_id}] batch cost ${batch_cost:.4f}, cumulative ${cumulative:.4f}")

        if cumulative > NOTIFY_THRESHOLD:
            print(f"NOTICE: cumulative spend ${cumulative:.4f} has crossed the $10.00 notify threshold.")

        log.append((shot_id, batch_cost, cumulative))
        time.sleep(0.5)

    print("Done.")
    print(f"Final cumulative spend: ${cumulative:.4f}")
    for shot_id, cost, cum in log:
        print(f"  {shot_id}: ${cost:.4f}, cum ${cum:.4f}")


if __name__ == "__main__":
    main()
