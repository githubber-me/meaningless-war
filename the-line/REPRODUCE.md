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
