#!/usr/bin/env python3
"""
Phase B draft generation for "The Line".

Calls fal-ai/flux/schnell once per shot ID (batched num_images per call),
saves images to generation/drafts/<SHOT_ID>/, and appends a row to
budget.md after every single batch call (so the ledger is accurate even
if the run is interrupted).

Usage:
    FAL_KEY=... python3 generate_drafts.py
"""
import base64
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

ENDPOINT = "https://fal.run/fal-ai/flux/schnell"
UNIT_PRICE = 0.003  # USD per image, fal-ai/flux/schnell, roughly per plan.md

PHASE_B_TARGET = 2.00
NOTIFY_THRESHOLD = 10.00
HARD_CAP = 12.00

# variants per shot: hero frames get slightly more to improve curation odds
W_VARIANTS = 4
H_VARIANTS = 4  # fal-ai/flux/schnell caps num_images at 4 per call

SHOT_IDS = [f"W{n:02d}" for n in range(1, 13)] + [f"H{n:02d}" for n in range(1, 11)]


def read_prompt(shot_id):
    path = os.path.join(PROMPTS_DIR, f"{shot_id}.txt")
    with open(path) as f:
        lines = f.readlines()
    # prompt is the last non-empty line (after the '#' metadata header)
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


def append_budget_row(date, endpoint, count, unit_price, batch_cost, cumulative):
    row = f"| {date} | {endpoint} | {count} | ${unit_price:.3f} | ${batch_cost:.3f} | ${cumulative:.3f} |\n"
    with open(BUDGET_MD, "a") as f:
        f.write(row)


def call_fal(prompt, num_images):
    payload = {
        "prompt": prompt,
        "image_size": "landscape_16_9",
        "num_inference_steps": 4,
        "num_images": num_images,
        "enable_safety_checker": True,
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
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode("utf-8"))


def download(url, dest):
    with urllib.request.urlopen(url, timeout=60) as resp:
        data = resp.read()
    with open(dest, "wb") as f:
        f.write(data)
    return len(data)


def main():
    cumulative = read_cumulative()
    print(f"Starting cumulative spend: ${cumulative:.3f}")

    log = []
    for shot_id in SHOT_IDS:
        variants = W_VARIANTS if shot_id.startswith("W") else H_VARIANTS
        batch_cost = variants * UNIT_PRICE

        if cumulative + batch_cost > HARD_CAP:
            print(f"STOP: batch for {shot_id} (${batch_cost:.3f}) would push cumulative "
                  f"(${cumulative:.3f}) past hard cap ${HARD_CAP:.2f}. Halting.")
            break
        if cumulative + batch_cost > PHASE_B_TARGET:
            print(f"STOP: batch for {shot_id} (${batch_cost:.3f}) would push cumulative "
                  f"(${cumulative:.3f}) past Phase B target ${PHASE_B_TARGET:.2f}. Halting generation.")
            break

        shot_dir_check = os.path.join(DRAFTS_DIR, shot_id)
        if os.path.isdir(shot_dir_check) and len(os.listdir(shot_dir_check)) >= variants:
            print(f"[{shot_id}] already has {len(os.listdir(shot_dir_check))} images, skipping.")
            continue

        prompt = read_prompt(shot_id)
        print(f"[{shot_id}] requesting {variants} variants...")
        try:
            result = call_fal(prompt, variants)
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            print(f"[{shot_id}] HTTP ERROR {e.code}: {body}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"[{shot_id}] ERROR: {e}", file=sys.stderr)
            continue

        images = result.get("images", [])
        shot_dir = os.path.join(DRAFTS_DIR, shot_id)
        os.makedirs(shot_dir, exist_ok=True)
        saved = 0
        for i, img in enumerate(images, start=1):
            url = img.get("url")
            if not url:
                continue
            ext = "jpg" if "jpeg" in img.get("content_type", "") or url.endswith((".jpg", ".jpeg")) else "png"
            dest = os.path.join(shot_dir, f"{shot_id}_v{i}.{ext}")
            try:
                size = download(url, dest)
                saved += 1
                print(f"  saved {dest} ({size} bytes)")
            except Exception as e:
                print(f"  FAILED to download variant {i}: {e}", file=sys.stderr)

        actual_cost = saved * UNIT_PRICE
        cumulative += actual_cost
        date = datetime.date.today().isoformat()
        append_budget_row(date, "fal-ai/flux/schnell", saved, UNIT_PRICE, actual_cost, cumulative)
        print(f"[{shot_id}] saved {saved}/{variants} images, batch cost ${actual_cost:.3f}, "
              f"cumulative ${cumulative:.3f}")

        if cumulative > NOTIFY_THRESHOLD:
            print(f"NOTICE: cumulative spend ${cumulative:.3f} has crossed the $10.00 notify threshold.")

        log.append((shot_id, saved, actual_cost, cumulative))
        time.sleep(0.5)

    print("Done.")
    print(f"Final cumulative spend: ${cumulative:.3f}")
    for shot_id, saved, cost, cum in log:
        print(f"  {shot_id}: {saved} images, ${cost:.3f}, cum ${cum:.3f}")


if __name__ == "__main__":
    main()
