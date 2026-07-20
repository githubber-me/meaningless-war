# Reproducing `the-line-final.mp4`

This renders deterministically from the assets already committed in this repo — no
fal.ai calls needed to reproduce the final cut (fal was only used earlier to generate
the source imagery and to transcribe the narration for splitting; both outputs are
already committed).

## 1. Prerequisites

- Node 18+ (this project was built/tested on Node 22)
- ~1GB free disk (Remotion's bundled Chrome Headless Shell + render output)

## 2. Install and render

```bash
cd the-line/remotion
npm install
npx remotion browser ensure   # fetches Remotion's bundled Chrome, first run only
npx remotion render TheLine out/the-line-final.mp4 --codec h264
```

Composition id is `TheLine` (registered in `src/Root.tsx`), 1920x1080, 30fps,
`durationInFrames: 5400` — output should be exactly 5400 frames / 180.000s.

## 3. Verify the render

```bash
FF=node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg
FP=node_modules/@remotion/compositor-linux-x64-gnu/ffprobe

# stream info: expect h264 1920x1080 30fps + aac stereo 48kHz
"$FP" -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,channels \
  -of default=noprint_wrappers=1 out/the-line-final.mp4

# frame count: expect exactly 5400
"$FF" -i out/the-line-final.mp4 -map 0:v:0 -c copy -f null - 2>&1 | grep -o "frame=[ ]*[0-9]*" | tail -1
```

## 4. The individual assets, if you want to swap or rebuild pieces

Everything the render depends on lives under `remotion/public/audio/` and
`remotion/src/`. To regenerate any single piece instead of the whole pipeline:

| Asset | Path | How it was made |
|---|---|---|
| Narration (8 blocks) | `remotion/public/audio/VO-01.mp3` … `VO-08.mp3` | Cut from `generation/audio-sources/voiceover-stick.mp3` (the single continuous take you supplied) using fal-ai/whisper word-timestamps matched against the exact blockquotes in `../script.md`, then `ffmpeg -ss <start> -to <end>` + `loudnorm=I=-16:TP=-1.5:LRA=11`. See `budget.md` for the transcription call and `generation/vo-script.md` for the cued script the take was read from. |
| Raw narration take | `generation/audio-sources/voiceover-stick.mp3` | Your original upload, kept unmodified. |
| Music bed | `remotion/public/audio/bgm.mp3` | Transcoded from your `generation/audio-sources/bgm.wav`, trimmed/padded to exactly 180.02s with a 3s fade-out. Played at a **hard 40% volume ceiling** in `AudioBed.tsx` (`BGM_CEILING = 0.4`) — narration-window ducking only ever multiplies further *below* that ceiling, never above it. |
| Raw bgm | `generation/audio-sources/bgm.wav` | Your original upload, kept unmodified. |
| Wind + SFX beds | `remotion/public/audio/wind.mp3`, `sfx-pencil-scratch.mp3`, `sfx-artillery.mp3`, `sfx-train.mp3`, `sfx-crowd-murmur.mp3` | Synthesized placeholders (ffmpeg noise/tone synthesis), **not** real freesound.org assets — see `CREDITS.md`. Swap these for real licensed files by replacing the mp3s in place (same filenames) and re-rendering; no code changes needed. |
| Visual stills (montage) | `generation/drafts/W01-W11/` | fal-ai/flux/schnell drafts, curated — see `generation/drafts/CURATION.md`. |
| Visual stills (hero frames) | `generation/finals/H01-H10.jpg`, `generation/finals/W12.jpg` | fal-ai/flux-pro/v1.1, grayscale-verified — see same curation doc. |
| Audio mix logic | `remotion/src/components/AudioBed.tsx` | Scene start frames come from `remotion/src/scenes/timing.ts`; VO clip lengths are read from the actual file durations, not hardcoded. |

## 5. To re-cut narration from a new single-take recording

If you record a new continuous take (instead of 8 separate files), rerun the same
split approach:

1. Transcribe it with fal-ai/whisper for word-level timestamps (or any ASR that
   gives timestamps).
2. Fuzzy-match the transcript against the 8 blockquotes in `../script.md`.
3. Cut each block with ffmpeg at the matched word boundaries.
4. Confirm VO-05 fits before frame 3360 (1:52.000, S5's hard deadline) and VO-08
   fits before `HAND_START` in `S8Ending.tsx` — both must leave the scripted
   silent tail intact. If a take runs long, tighten inter-sentence pauses first;
   never cut mid-word/mid-sentence to force the deadline.
5. Drop the 8 cuts into `remotion/public/audio/VO-0N.mp3` and re-render — no
   code changes required, `AudioBed.tsx` reads real clip durations at render time.

## Current cumulative fal.ai spend: $0.646 of the $12.00 cap

Full ledger in `budget.md`. Nothing in this repro flow spends money — it's all
local ffmpeg/Remotion once the assets exist.

---

# Reproducing `the-line-v2-final.mp4` ("The Red Thread" cut)

V2 is a complete visual revamp: 33 new charcoal/ink FLUX.2 pro finals
(`generation/v2/finals/`), a living red-line overlay drawn in Remotion (never
baked into the images), and three Remotion type moments. Only the narration
(`VO-01..08.mp3`, same placements as v1) and `bgm.mp3` survive from v1's audio
bed — **v2 drops wind and all SFX** per the user's explicit instruction. This
also renders deterministically from committed assets; no fal.ai calls needed.

## 1. Install and render

```bash
cd the-line/remotion
npm install
npx remotion browser ensure   # first run only
npx remotion render TheLineV2 out/the-line-v2-final.mp4 --codec h264
```

Composition id is `TheLineV2` (registered in `src/Root.tsx` alongside the v1
`TheLine` composition), 1920x1080, 30fps, `durationInFrames: 5400` — output
should be exactly 5400 frames / 180.05s (h264 GOP rounding adds ~0.05s to the
container `Duration` field; the video stream itself is exactly 5400 frames).

## 2. Verify the render

```bash
FF=node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg

# frame count: expect exactly 5400
"$FF" -i out/the-line-v2-final.mp4 -map 0:v:0 -c copy -f null - 2>&1 | grep -o "frame=[ ]*[0-9]*" | tail -1

# audio: confirm non-silent overall, and confirm the 112-120s scripted
# silence hold (script.md rule 3) is near-silent (VO track has no clip
# there; bgm dips to ~12% of its own ceiling rather than dropping out
# completely, so the hold doesn't read as a technical dropout)
"$FF" -y -i out/the-line-v2-final.mp4 -vn -acodec pcm_s16le /tmp/v2.wav
"$FF" -ss 105 -to 125 -i /tmp/v2.wav -af silencedetect=noise=-25dB:d=1 -f null - 2>&1 | grep silence
```

## 3. Source tree

| Path | Contents |
|---|---|
| `remotion/src/v2/timing.ts` | The full shot schedule (33 image beats + T1/T2/T3 type beats + 1 white-cut beat), derived frame-for-frame from `the-line/v2-treatment.md`'s shot table. Includes a startup sanity check that beats tile 0→5400 with no gaps. |
| `remotion/src/v2/Shot.tsx` | Full-bleed image + cinematic camera (push-in/drift, 1.04→1.12 scale range) + film grain + vignette for one image beat. |
| `remotion/src/v2/RedOverlay.tsx` | Per-shot SVG red-line paths (imports `RED` from `src/components/RedLine.tsx` — the only source of red in the whole codebase), authored in each image's own 1344x768 pixel space and rendered with `preserveAspectRatio="xMidYMid slice"` so they land on the same feature the `object-fit: cover` image crop shows. |
| `remotion/src/v2/TypeMoments.tsx` | T1 (`ENEMY`), T2 (mirrored `VICTORY`), T3 (final card) — bold condensed letterpress type over darkened-final charcoal texture (T1/T2) or plain white (T3, per the treatment's hard-cut-to-white lead-in). |
| `remotion/src/v2/AudioBedV2.tsx` | VO-01..08 + bgm.mp3 only. Same VO placements/durations as v1's `AudioBed.tsx`. Adds a silence-hold dip (frames 3360-3600 / 112-120s) on top of the normal 40%-ceiling ducking envelope. |
| `remotion/src/v2/TheLineV2.tsx` | Top-level composition: lays out every beat from `timing.ts` with an 8-12 frame opacity crossfade between chapter shots (hard cuts inside the M1-M5 montage and at the white-cut/final-card boundary, per the treatment). |
| `remotion/public/v2/*.jpg` | The 33 finals, copied verbatim from `generation/v2/finals/`. |

## 4. Known deviations carried from CURATION.md

- **R14** (station platform): the train faces the camera rather than
  receding, but the rails still converge to a center vanishing point, so the
  red-line "receding track" overlay still reads correctly.
- **R22** (empty chair): the red thread is traced along the chair's **back
  rail** (the crest rail across the top of the chair back), not the seat —
  no candidate draft ever put the folded uniform on the seat itself.
- **R21** (fountain pen), **M1** (helmet), **M5** (medal): all slightly more
  photographic than the charcoal norm; kept short (R21: 4s, M1/M5: 1.6s each)
  and under normal grain/vignette per CURATION.md's guidance.
