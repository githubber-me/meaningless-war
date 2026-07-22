# V2 Style Bible — "The Line" (Red Thread cut)

Every prompt in `prompts/` ends with the LOCKED SUFFIX below, verbatim. Do not vary it
per shot — it is what makes 33 images read as frames from one film.

## Locked suffix (append to every prompt, verbatim)

```
expressive charcoal and ink illustration, smudged graphite texture, dramatic soft lighting, deep blacks, aged warm grey paper tone, cinematic wide composition, hand-drawn animation still, monochrome black and white only, no color
```

## Negative concept list (curation checklist)

```
color, red, photorealistic, 3d render, photograph, text, watermark, flat vector, cartoon
```

FLUX endpoints (schnell, pro v1.1) take no `negative_prompt` parameter, so these are
enforced two ways: (1) the suffix's explicit "monochrome black and white only, no color"
and "hand-drawn animation still" language; (2) mandatory human curation — every draft
and every final is VIEWED, and any image showing a color leak, legible text, watermark,
vector/cartoon flatness, or photographic rendering is rejected and re-rolled.

**ABSOLUTE RULE: no red in any generated image.** The red line is the `RED` constant,
composited in Remotion only. Any red pixel in a generated image is an automatic reject.
(Post-processing collapses finals to true grayscale as a belt-and-braces guarantee, but
curation still rejects color leaks at draft stage — a color-leaked composition often has
other tonal problems.)

## Light logic (one world, one light)

- Exteriors: low sun or dawn/dusk — long shadows, mist as soft grey wash, sky as smudged
  graphite gradient. Deep blacks in foreground silhouettes.
- Interiors: a single practical source (lamp, window, radio dial glow rendered as pale
  grey) throwing large soft-edged shadows. Backgrounds fall to charcoal black.
- War chapter (R15–R19, M1–M5): light goes harder and colder — flare-light, fire-glow
  rendered as white-grey bloom, higher contrast, heavier smudging.
- Resolution chapter (R26–R28): light softens and lifts — morning haze, more paper tone
  showing through, lighter charcoal handling.

## Composition rules

1. Wide and cinematic; 16:9. Subjects placed for camera moves (push-ins, drifts) —
   leave breathing room at frame edges.
2. **Red-line clearance:** wherever the treatment gives the line a future position
   (map stroke, valley cut, top wire, track bed, trench scar, horizon, chair seat,
   ribbon, thread in rubble, kite string), the composition keeps that path CLEAN and
   readable — uncluttered, tonally quiet, ideally a continuous edge or band the
   Remotion overlay can trace. The per-shot prompts call this out explicitly.
3. No legible text anywhere (posters, newspapers, documents are blank or illegibly
   textured). Type moments (ENEMY, VICTORY, final card) are Remotion typography.
4. Faces indistinct or turned away — this is a film about everyone, not someone.

## Generation parameters

- Drafts: `fal-ai/flux/schnell`, `landscape_16_9`, 4 steps, 2 variants/shot.
- Heroes: `fal-ai/flux-pro/v1.1`, 1344x768, 1 image, winner prompt verbatim.
- Post: true grayscale collapse (R=G=B exact), autocontrast cutoff 1%, verify zero
  channel divergence programmatically, then spot-view for washout.
