# Style bible — "The Line"

This file is the single source of truth for every fal.ai image-generation prompt used
in this production (Phase B drafts and Phase C hero regeneration). Every prompt file in
`generation/prompts/` appends the locked suffix below verbatim and every API call passes
the locked negative prompt verbatim. Do not deviate — style drift across shots is the
main production risk (see plan.md section 5).

## Locked prompt suffix

Appended, verbatim, to the end of every shot-specific prompt:

```
minimalist stick figure illustration, uniform thin black ink lines, textured off-white paper background, hand-drawn imperfect linework, monochrome black and white only, no color, no shading, no gradients, wide 16:9 composition, lots of negative space
```

## Locked negative prompt

Passed, verbatim, on every API call that supports a negative-prompt parameter:

```
color, red, photorealistic, 3d render, gray shading, detailed faces, text, watermark
```

(Schnell-class fal endpoints do not always accept a `negative_prompt` parameter; where
unsupported, the constraint is enforced by the positive prompt language above and by the
curation pass in `drafts/CURATION.md`.)

## Non-negotiable rules (from script.md, "Rules that do not bend")

1. All generated imagery is pure black and white. No red, no color of any kind — red is
   composited later in Remotion, never generated.
2. No detailed/realistic faces — figures stay minimal stick-figure abstractions.
3. No text or watermarks baked into images — all typography (propaganda cards, ENEMY
   card, final card) is rendered in Remotion.
4. No graphic violence (per script.md header: "No graphic violence").

## Shot ID scheme

- `W01`–`W12` — the twelve War montage beats, script.md 1:28–2:00, each on screen well
  under 400ms in the final edit. These stay as Schnell drafts per plan.md Phase C step 2
  ("montage shots on screen under 400ms keep their Schnell drafts").
- `H01`–`H10` — hero frames: single iconic images from the non-War sections that are held
  on screen long enough (>1s) to warrant later regeneration on FLUX.2 [pro] in Phase C.
  Chosen as the single most visually load-bearing beat per remaining section (see
  `prompts/` for the full list and rationale per shot).

## Generation parameters (Phase B, Schnell drafts)

- Endpoint: `fal-ai/flux/schnell`
- `image_size`: `landscape_16_9`
- `num_inference_steps`: 4
- `num_images`: batched per call where the endpoint allows it, otherwise looped
- 3–4 variants generated per shot ID
- Approx. cost: ~$0.003/image (see `budget.md` for actual logged costs)
