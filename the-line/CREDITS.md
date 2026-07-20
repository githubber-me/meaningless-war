# Credits — "The Line"

Audio, imagery, and third-party asset licenses used in this production. Every
freesound.org / free-library asset (Phase E) and every fal.ai-generated image
(Phase B/C) must be logged here before the final render ships.

## Narration

**Real narration, user-supplied.** The user provided one continuous file,
`voiceover-stick.mp3` (44.1kHz mono, 108.12s), containing all eight VO blocks
read back-to-back by a single voice with natural pauses between sentences but
no pre-split markers between blocks. It was split into the eight per-scene
files using `fal-ai/whisper` (word-level timestamps) to transcribe the file,
then fuzzy-matching each transcribed word run against the exact VO-01..VO-08
blockquote text in `script.md` to find each block's precise start/end word
boundary (all eight blocks matched with a perfect word-for-word score — see
`the-line/budget.md` for the transcription cost). Each block was then cut with
ffmpeg at the aligned word boundaries (small silence padding added at head/tail
where the adjacent block's audio didn't already claim it) and passed through a
single `loudnorm` pass (I=-16, TP=-1.5, LRA=11) so the eight blocks are
level-consistent with one another. Source of the narration itself (human
voice vs. TTS, and any license) was not specified by the user; treat as
user-supplied and confirm provenance before public release.

Real cut files: `VO-01.mp3` (0.00–16.20s of source) · `VO-02.mp3`
(17.65–28.42s) · `VO-03.mp3` (28.42–43.21s) · `VO-04.mp3` (43.99–58.13s) ·
`VO-05.mp3` (58.15–73.99s, 15.86s long — well inside the 24s budget before
script.md's 1:52 hard deadline) · `VO-06.mp3` (75.28–87.86s) · `VO-07.mp3`
(89.02–100.64s) · `VO-08.mp3` (101.99–107.92s, 5.88s long — well inside the
11s budget before S8's hesitating-hand beat). The original continuous source
file is preserved at `the-line/generation/audio-sources/voiceover-stick.mp3`.

## Music

**Real music, user-supplied — provenance/license not specified, confirm
before public release.** `the-line/remotion/public/audio/bgm.mp3` is
transcoded from the user-supplied `bgm.wav` (48kHz stereo PCM, 178.8s). The
source file's own embedded metadata reads `made with suno`, suggesting
AI-generated (Suno) music, but this was not explicitly confirmed by the user
and no license/attribution was supplied — **do not treat this as cleared for
public release without the user confirming provenance and license.** It was
trimmed/padded (a 3s fade-out from 175.8s, then silence-padded) to exactly
match the film's 180s runtime and played in Remotion at a **40% volume
ceiling** (`AudioBed.tsx`'s `BGM_CEILING`) per the user's explicit request,
with additional ducking under narration layered on top of (never above) that
ceiling — see `AudioBed.tsx` for the envelope. The original source file is
preserved at `the-line/generation/audio-sources/bgm.wav`.

The previous synthesized sine-pluck placeholder bed (`music-bed.mp3`) has
been removed now that real music is in place.

## Sound effects

**Placeholder only, same caveat as Music above** — synthesized with ffmpeg noise
generators and filters, not sourced from freesound.org:

| File | Used for | Synthesis |
|------|----------|-----------|
| `sfx-pencil-scratch.mp3` | S2 (line drawn), S8 (line erased / tree drawn) | White noise, bandpassed ~1.8-6.5kHz, fast tremolo (14Hz) for a scratchy texture, ~1.8s loop |
| `sfx-artillery.mp3` | S5 War (sparse, non-graphic, low; montage only, not the narration-free hold) | Brown noise, low-passed at 180Hz, fast attack / ~1.2s decay, single low thump |
| `sfx-train.mp3` | S4 Machinery (soldiers depart by train) | Pink noise, low-passed at 500Hz, slow tremolo (2.2Hz) for a rhythmic chug, ~4s loop |
| `sfx-crowd-murmur.mp3` | S6 Victory (signing / headline reaction) | Pink noise, bandpassed around the vocal range, very slow tremolo (0.6Hz), ~5s loop |
| `wind.mp3` | Continuous low bed throughout, swells in narration-free stretches | Brown noise, band-limited 60-900Hz, very slow tremolo (0.5Hz), 180s |

**Action needed:** replace each with a real freesound.org / free-library recording
(paper/pencil scratch, distant artillery, train, crowd murmur, wind) before this
ships publicly, and log title/author/license/URL here per asset.

## Generated imagery (fal.ai)

All Phase B/C stills (`the-line/remotion/public/stills/`, shots W01-W12 and H01-H10)
are original-prompt output from fal.ai FLUX-family endpoints
(`fal-ai/flux/schnell` for Phase B drafts, `fal-ai/flux-pro/v1.1` for the 11 Phase C
hero regenerations: H01-H10 + W12). This is model-generated original imagery from
prompts written for this production (`generation/prompts/`, style bible in
`generation/style-bible.md`), not third-party licensed stock — there is no
external license to attribute beyond fal.ai's standard API terms of service for
generated output. See `the-line/budget.md` for the full per-call cost ledger and
`the-line/generation/drafts/CURATION.md` for the shot-by-shot picks and Phase C
notes.

## Fonts

_None logged yet. (Phase D — condensed display font used in `PropagandaCard`,
if a non-system font is adopted.)_

---

# V2 ("The Red Thread" cut) — imagery, audio, and font provenance

V2 is a complete visual revamp of the film — see `the-line/v2-treatment.md`
for the full shot-by-shot treatment and `the-line/generation/v2/CURATION.md`
for the per-shot draft/hero curation notes. It reuses none of v1's stills.

## Generated imagery (fal.ai)

All 33 finals in `the-line/remotion/public/v2/` (`R01`-`R28`, `M1`-`M5`) are
original-prompt output from fal.ai's FLUX-family endpoints: `fal-ai/flux/schnell`
for the curation-phase drafts (80 images across initial + re-drafted variants),
and `fal-ai/flux-pro/v1.1` (1344x768) for the hero pass, with six shots
(R09, R10, R11, R23, R25, M5) re-rolled once against a minimally adjusted
prompt. Every draft and every hero was viewed with the Read tool before being
locked as the winner — see `generation/v2/CURATION.md` for the shot-by-shot
verdicts and known deviations. This is model-generated original imagery from
prompts written for this production (`generation/v2/prompts/`, style bible
noted in `v2-treatment.md`'s "Art direction" section) — no external license to
attribute beyond fal.ai's standard API terms of service for generated output.
All 33 finals were post-processed to exact R=G=B grayscale + autocontrast
(programmatically verified: 0/255 max channel divergence on every file) —
see `generation/v2/CURATION.md`'s "Post-processing" section. Total v2
generation spend: $1.455 (cumulative project spend $2.181 of the $12.00 hard
cap) — see `budget.md`.

## The red line

Exactly as in v1: the single hex `RED = "#C0392B"` constant in
`remotion/src/components/RedLine.tsx` is the only source of red anywhere in
the film. V2 does not bake red into any generated image; every red pixel is a
Remotion-composited SVG path or rect, positioned per-shot in
`remotion/src/v2/RedOverlay.tsx`.

## Narration and music

**Unchanged from v1** (see the Narration and Music sections above for full
provenance/license caveats) — `VO-01.mp3`..`VO-08.mp3` and `bgm.mp3` are
reused verbatim, same files, same placements. bgm.mp3 is played at the same
40%-ceiling with narration ducking as v1, plus an additional dip during the
112-120s scripted silence hold (script.md rule 3 / v2-treatment.md rule 3) so
that stretch reads as an intentional quiet hold rather than a dropout.

## Sound effects and wind — REMOVED in v2

Per the user's explicit instruction, v2's audio bed is narration + music
**only**. `wind.mp3` and all `sfx-*.mp3` beds from v1's `AudioBed.tsx` are
not used anywhere in `AudioBedV2.tsx` / `TheLineV2.tsx`. This also sidesteps
the "action needed" placeholder-SFX caveat noted above for v1 — v2 simply
doesn't ship any SFX to license.

## Fonts

V2's type moments (`remotion/src/v2/TypeMoments.tsx`) use a system font stack
(`"Arial Narrow", Arial, sans-serif`) at `font-weight: 900` with a
`transform: scaleX(0.82)` condensation applied in CSS, rather than a licensed
display font — no font file is bundled or attributed.
