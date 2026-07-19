# PLAN.md — "The Line" Production Plan

**Executor:** Claude Code (Sonnet or Opus)
**Companion file:** `script.md` (the locked script; do not deviate from its timing map or rules)
**Hard budget cap:** $20.00 USD total fal spend. This is a ceiling, not a target. Track every API call in `budget.md`.
**Output:** `the-line-final.mp4`, 1920x1080, 30fps, 3:00 exactly (5400 frames), H.264, stereo audio.

---

## 0. Architecture decision (read before writing any code)

This is a hybrid production:

- **Remotion (cost: $0)** renders everything mechanical, typographic, and geometric: the drawn line, lettering, propaganda cards, the coin machine, map pullback, ending sequence, final card, and all red compositing. Render with `npx remotion render`, never screen capture.
- **fal.ai (cost: capped at $20)** generates only the organic hand-drawn stills where imperfection is the point: primarily the War montage (1:28–2:00) and a small set of hero frames elsewhere.
- **ElevenLabs (user-supplied)** narration arrives as eight files, `VO-01.mp3` through `VO-08.mp3`. Do not generate narration. If files are missing, build the timeline with silent placeholders of the correct duration and flag it.
- **Music and SFX (cost: $0)** come from freesound.org or a free library. Wind, distant artillery, paper texture sounds, one sparse music bed. List every asset and license in `CREDITS.md`.

Rationale: stick figures are geometry; geometry is SVG; SVG is free. Diffusion is reserved for texture and emotional imperfection only.

---

## 1. Repository layout

```
the-line/
  script.md
  plan.md
  budget.md            # running fal spend ledger, updated after every call
  CREDITS.md           # audio/asset licenses
  remotion/
    src/
      Root.tsx
      scenes/          # one component per script section (S1Before ... S8Ending)
      components/      # StickFigure.tsx, Paper.tsx, RedLine.tsx, PropagandaCard.tsx, Hand.tsx
      assets/          # generated stills, audio
    remotion.config.ts
  generation/
    style-bible.md     # locked prompt suffix + negative prompts
    prompts/           # one .txt per shot, named by shot ID
    drafts/            # Schnell output
    finals/            # FLUX.2 pro output, curated
    scripts/           # fal API call scripts (Python or TS)
```

---

## 2. Phase gates (execute in order; do not skip ahead)

### Phase A — Remotion scaffold (no spend)

1. `npx create-video@latest` with the blank template. Comp: 1920x1080, 30fps, `durationInFrames: 5400`.
2. Build shared components first:
   - `Paper`: full-frame off-white textured background (procedural noise or one free paper texture, reused everywhere for visual unity).
   - `StickFigure`: parameterized SVG (pose props, uniform 4px stroke). All stick figures in Remotion scenes come from this one component so line weight never drifts.
   - `RedLine`: the only source of red in the entire film. Export its hex (#C0392B or similar, pick once) as a constant. Every red element imports this constant. This enforces script rule 1 in code.
   - `PropagandaCard`: bold condensed type, slight paper shake, red accent from the constant.
   - `Hand`: layered SVG hand with pencil, animated via spring on entry.
3. Stub all eight scene components with correct frame ranges from the script's timing map. Render a gray-boxed animatic and confirm total runtime is exactly 5400 frames before anything else.

**Gate A:** animatic renders end to end at correct duration. Do not proceed until true.

### Phase B — Style bible and draft generation (target spend: under $2)

1. Write `generation/style-bible.md`. Locked suffix for every prompt:
   `"minimalist stick figure illustration, uniform thin black ink lines, textured off-white paper background, hand-drawn imperfect linework, monochrome black and white only, no color, no shading, no gradients, wide 16:9 composition, lots of negative space"`
   Negative prompt: `"color, red, photorealistic, 3d render, gray shading, detailed faces, text, watermark"`.
2. Enumerate every generated shot with an ID (W01–W12 for the twelve War beats in the script, plus H01–H10 hero frames: the mirrored photograph pair, empty chairs, crosses, the two frightened soldiers, etc.). One prompt file per shot in `generation/prompts/`.
3. Generate all drafts on a Schnell-class endpoint (fal-ai/flux/schnell or current cheapest FLUX-family model, roughly $0.003/image). 3–4 variants per shot, approximately 100–150 images total. Log cost per batch in `budget.md`.
4. Curate: pick the best variant per shot. Reject anything that violates the black-and-white rule or drifts in line weight. Rejection is expected; that is what drafts are for.

**Gate B:** cumulative spend under $2.00 and every shot ID has at least one acceptable draft. If a shot fails after 6 variants, redesign the prompt or move the shot to Remotion SVG instead of burning budget.

### Phase C — Hero regeneration (target spend: under $8)

1. Regenerate only shots held on screen longer than one second (hero frames, roughly 20–30 shots) on FLUX.2 [pro] at $0.03 per ~1MP image, using the winning draft's prompt verbatim plus any fixes. Generate at 1920x1080 or 1344x768.
2. Montage shots on screen under 400ms keep their Schnell drafts. Nobody sees draft flaws at 3 frames of exposure.
3. Post-process every kept image: convert to true grayscale (kill any color leak), normalize contrast, confirm consistent paper tone against the Remotion `Paper` component. A simple Python/sharp script, applied uniformly.

**Gate C:** cumulative spend under $10.00. All finals in `generation/finals/`, grayscale-verified programmatically (assert max channel divergence near zero).

### Phase D — Scene assembly (no spend)

Build each scene per `script.md`. Key implementation notes:

- **S2 The line:** animate the red line as an SVG path with `strokeDashoffset` driven by frame, pencil `Hand` leading the tip. Lettering "US"/"THEM" via animated stroke or staggered opacity.
- **S3 Story spreads:** propaganda cards at accelerating rhythm; end on the full-screen ENEMY card exactly as the script demands. The narrator never says the word; the card does. Preserve this.
- **S5 War:** `<Sequence>` per still, cut rate ramping 2/s to 4/s, hard cuts only, no crossfades, subtle 1–2% scale drift per still to keep stills alive. Last 8 seconds: hold the crosses frame, audio only.
- **S8 Ending:** children erase the line (animate `RedLine` mask), tree drawn as animated SVG path, new `Hand` with red pencil enters and eases to a stop above the page, then a hard cut to white 2–3 frames before any contact. The pencil never touches. Then final card, 90 frames hold, fade to white.
- Red compositing: any red glow on destruction stills is an overlay layer in Remotion using the red constant, masked, at low opacity. Never bake red into source images.

**Gate D:** full render with placeholder or real VO plays end to end; every script rule in "Rules that do not bend" passes a manual check.

### Phase E — Audio and final render (no spend)

1. Drop in `VO-01`–`VO-08` at the timing map positions. VO-05 must end by 1:52. If any block overruns its slot, flag to the user for regeneration rather than compressing the edit.
2. Music bed: sparse, low, single instrument preferred. Duck under VO. Silence is a feature: honor the 1:52–2:00 wind-only stretch and the held frames.
3. SFX: paper/pencil scratch for S2 and S8, distant artillery (non-graphic, low), train, crowd murmur for victory. All free-licensed, logged in `CREDITS.md`.
4. Loudness: target roughly -14 LUFS integrated for YouTube.
5. Final render: `npx remotion render Root the-line-final.mp4 --codec h264`. Verify duration is 3:00.000 and frame count 5400.

---

## 3. Budget ledger rules

- `budget.md` is a table: date, endpoint, count, unit price, batch cost, cumulative.
- Check cumulative before every batch. If a batch would push cumulative past $16.00, stop and report; the last $4 is reserve for final fixes only.
- Video-generation endpoints (Wan, Kling, Veo) are **not authorized** in this plan. All motion is Remotion. If a shot truly cannot work as SVG or a still, propose it to the user with cost before generating.

## 4. Quality checklist (run before declaring done)

- [ ] Exactly 5400 frames, 16:9, 30fps
- [ ] No red anywhere except border, propaganda accents, destruction overlay, final pencil (single hex constant)
- [ ] All fal imagery is verified grayscale before compositing
- [ ] Narrator audio never says "enemy"; ENEMY card present at end of S3
- [ ] Pencil never touches the page in S8; cut to white precedes contact
- [ ] Final card holds 3 full seconds
- [ ] War section cut rate ramps and ends with 8 seconds of narration-free audio
- [ ] Total fal spend recorded and under $20.00
- [ ] CREDITS.md complete

## 5. Known risks

- **Style drift across Schnell drafts:** mitigated by the locked suffix and by moving stubborn shots to SVG. Do not chase consistency with money.
- **Paper tone mismatch between generated stills and the Remotion `Paper` background:** fix in post-processing, not by regenerating.
- **VO overruns:** the trimmed script fits, but ElevenLabs pacing varies. Measure each file's duration on arrival and reconcile against the timing map before assembly.
