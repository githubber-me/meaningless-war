#!/usr/bin/env python3
"""
V2 (Red Thread cut) generation for "The Line".

Modes:
  python3 v2_generate.py drafts [SHOT_ID ...]   # schnell, 2 variants/shot -> v2/drafts/<ID>/
  python3 v2_generate.py hero SHOT_ID [suffix]  # flux-pro v1.1, 1344x768 -> v2/heroes/<ID><suffix>.jpg

Every fal call appends a row to the-line/budget.md immediately.
Budget gates: task ceiling $4.00 over the v2 task start ($0.726 cumulative),
project notify $10.00, hard cap $12.00.
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
    sys.exit("FAL_KEY not set")

LINE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
V2_DIR = os.path.join(LINE_ROOT, "generation", "v2")
PROMPTS_DIR = os.path.join(V2_DIR, "prompts")
DRAFTS_DIR = os.path.join(V2_DIR, "drafts")
HEROES_DIR = os.path.join(V2_DIR, "heroes")
BUDGET_MD = os.path.join(LINE_ROOT, "budget.md")

SCHNELL = ("https://fal.run/fal-ai/flux/schnell", 0.003)
PRO = ("https://fal.run/fal-ai/flux-pro/v1.1", 0.031)

TASK_START = 0.726
TASK_CEILING = TASK_START + 4.00
NOTIFY = 10.00
HARD_CAP = 12.00

SHOT_IDS = [f"R{n:02d}" for n in range(1, 29)] + [f"M{n}" for n in range(1, 6)]


def read_prompt(shot_id):
    with open(os.path.join(PROMPTS_DIR, f"{shot_id}.txt")) as f:
        body = [l.rstrip("\n") for l in f if l.strip() and not l.startswith("#")]
    return body[-1]


def read_cumulative():
    cum = TASK_START
    with open(BUDGET_MD) as f:
        for line in f:
            if line.startswith("|") and set(line.strip()) != {"|", "-"}:
                cols = [c.strip() for c in line.strip().strip("|").split("|")]
                if len(cols) >= 6 and cols[5].startswith("$"):
                    try:
                        cum = float(cols[5].replace("$", ""))
                    except ValueError:
                        pass
    return cum


def log_budget(endpoint, count, unit, cost, cum, note):
    with open(BUDGET_MD, "a") as f:
        f.write(f"| {datetime.date.today().isoformat()} | {endpoint} | {count} | "
                f"${unit:.4f} | ${cost:.4f} | ${cum:.4f} | {note} |\n")


def call_fal(url, payload):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"Authorization": f"Key {FAL_KEY}", "Content-Type": "application/json"},
        method="POST")
    with urllib.request.urlopen(req, timeout=180) as resp:
        return json.loads(resp.read().decode())


def download(url, dest):
    with urllib.request.urlopen(url, timeout=60) as resp:
        data = resp.read()
    with open(dest, "wb") as f:
        f.write(data)


def gate(cum, cost):
    if cum + cost > HARD_CAP:
        sys.exit(f"HARD STOP: ${cum:.3f}+${cost:.3f} > ${HARD_CAP}")
    if cum + cost > TASK_CEILING:
        sys.exit(f"TASK CEILING STOP: ${cum:.3f}+${cost:.3f} > ${TASK_CEILING:.3f}")
    if cum + cost > NOTIFY:
        print(f"*** NOTIFY: cumulative crossing ${NOTIFY} ***")


def do_drafts(ids):
    cum = read_cumulative()
    for sid in ids:
        n = 2
        cost = n * SCHNELL[1]
        gate(cum, cost)
        d = os.path.join(DRAFTS_DIR, sid)
        prompt = read_prompt(sid)
        try:
            r = call_fal(SCHNELL[0], {"prompt": prompt, "image_size": "landscape_16_9",
                                      "num_inference_steps": 4, "num_images": n,
                                      "enable_safety_checker": True})
        except urllib.error.HTTPError as e:
            print(f"[{sid}] HTTP {e.code}: {e.read().decode(errors='replace')[:200]}", file=sys.stderr)
            continue
        os.makedirs(d, exist_ok=True)
        existing = len([f for f in os.listdir(d) if f.endswith(".jpg")])
        saved = 0
        for i, img in enumerate(r.get("images", []), start=existing + 1):
            if img.get("url"):
                download(img["url"], os.path.join(d, f"{sid}_v{i}.jpg"))
                saved += 1
        cum += saved * SCHNELL[1]
        log_budget("fal-ai/flux/schnell", saved, SCHNELL[1], saved * SCHNELL[1], cum,
                   f"v2 draft {sid}")
        print(f"[{sid}] {saved} drafts, cum ${cum:.4f}")
        time.sleep(0.3)


def do_hero(sid, suffix=""):
    cum = read_cumulative()
    gate(cum, PRO[1])
    prompt = read_prompt(sid)
    r = call_fal(PRO[0], {"prompt": prompt, "image_size": {"width": 1344, "height": 768},
                          "num_images": 1, "enable_safety_checker": True,
                          "safety_tolerance": "2"})
    os.makedirs(HEROES_DIR, exist_ok=True)
    dest = os.path.join(HEROES_DIR, f"{sid}{suffix}.jpg")
    download(r["images"][0]["url"], dest)
    cum += PRO[1]
    note = f"v2 hero {sid}" + (f" (re-roll{suffix})" if suffix else "")
    log_budget("fal-ai/flux-pro/v1.1", 1, PRO[1], PRO[1], cum, note)
    print(f"[{sid}] hero saved {dest}, cum ${cum:.4f}")


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "drafts":
        do_drafts(sys.argv[2:] or SHOT_IDS)
    elif mode == "hero":
        do_hero(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "")
    else:
        sys.exit("unknown mode")
