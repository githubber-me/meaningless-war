import React from "react";
import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { SCENE_TIMINGS } from "../scenes/timing";

/**
 * Audio bed (plan.md section 2 Phase E, script.md's per-section "Audio"
 * notes). The eight VO files are the REAL narration (split from the
 * user-supplied `voiceover-stick.mp3` continuous read via fal-ai/whisper
 * word-level alignment against script.md -- see the-line/budget.md and
 * CREDITS.md for the transcription cost and exact cut boundaries). The
 * music bed is the user-supplied `bgm.wav` (transcoded to bgm.mp3),
 * played at a 40% volume ceiling per the user's explicit request, with
 * additional ducking under narration layered on top of (never above)
 * that ceiling. Wind and SFX remain synthesized secondary layers -- see
 * `the-line/CREDITS.md` for full provenance.
 *
 * Nothing here is baked into picture; everything lives in the audio-only
 * <AudioBed/> tree so replacing an asset later never touches the scene
 * components.
 */

const scene = (id: (typeof SCENE_TIMINGS)[number]["id"]) => SCENE_TIMINGS.find((s) => s.id === id)!;

// Global frame windows (start, end) where narration is actually speaking,
// measured from the real VO-01..VO-08 clip durations (cut from
// voiceover-stick.mp3 via fal-ai/whisper word alignment -- see
// budget.md/CREDITS.md). These drive music/wind ducking. Each window starts
// at its scene's frame offset (the real read begins essentially on the cut,
// per the whisper alignment) and runs for the clip's own length, which is
// comfortably inside its scene's span in every case:
//  - VO-05 (War): real read is 490 frames (16.34s), well inside the
//    720-frame/24s budget script.md allows before the 1:52 narration
//    deadline (frame 3360) -- leaving the final ~8s+ of the War scene
//    (the crosses hold) to "music and distant wind... alone".
//  - VO-08 (Ending): real read is 192 frames (6.38s), well inside the
//    360-frame budget before the hesitating hand enters (S8Ending.tsx
//    HAND_START), so the hand-hover, hard cut to white, and the
//    three-second final-card hold (script.md rule 5) stay narration-free.
const VO_WINDOWS: { voFile: string; from: number; durationInFrames: number }[] = [
  { voFile: "VO-01", from: scene("S1Before").from, durationInFrames: 487 },
  { voFile: "VO-02", from: scene("S2TheLine").from, durationInFrames: 324 },
  { voFile: "VO-03", from: scene("S3StorySpreads").from, durationInFrames: 445 },
  { voFile: "VO-04", from: scene("S4Machinery").from, durationInFrames: 426 },
  // 490 frames / 16.34s (re-cut with a 0.5s tail pad so the last word's
  // decay isn't clipped) -- ends at frame 3130, well before the frame-3360
  // (1:52.000) hard deadline from script.md.
  { voFile: "VO-05", from: scene("S5War").from, durationInFrames: 490 },
  { voFile: "VO-06", from: scene("S6Victory").from, durationInFrames: 379 },
  { voFile: "VO-07", from: scene("S7TheCost").from, durationInFrames: 364 },
  // 192 frames / 6.38s (re-cut to the source's end plus a fade/pad so
  // "began?" keeps its decay) -- ends at local frame 192, well before
  // HAND_START (local frame 360) in S8Ending.tsx.
  { voFile: "VO-08", from: scene("S8Ending").from, durationInFrames: 192 },
];

const DUCK_ATTACK = 20; // frames to ramp volume in/out at each VO window edge

/** 1 inside any VO window (with a short ramp at the edges), 0 outside. */
function vocalPresence(frame: number): number {
  let presence = 0;
  for (const w of VO_WINDOWS) {
    const end = w.from + w.durationInFrames;
    const level = interpolate(
      frame,
      [w.from - DUCK_ATTACK, w.from, end, end + DUCK_ATTACK],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    presence = Math.max(presence, level);
  }
  return presence;
}

// User-specified ceiling: bgm.wav must never exceed 40% of full scale at
// any point in the film. Ducking under narration layers on top of (i.e.
// multiplies further below) this ceiling -- it never raises the level
// above it, even in the narration-free stretches, where the bed simply
// swells back up to the full 40% ceiling rather than beyond it.
const BGM_CEILING = 0.4;
const BGM_DUCK_FLOOR = 0.35; // fraction of the 40% ceiling retained under VO

const MusicBed: React.FC = () => {
  const frame = useCurrentFrame();
  const presence = vocalPresence(frame);
  // Full 40% ceiling in narration-free stretches (War's final ~8s+ crosses
  // hold, the Ending's hand/card/fade stretch per script.md); ducked
  // further under narration, but never above the 40% ceiling.
  const volume = interpolate(presence, [0, 1], [BGM_CEILING, BGM_CEILING * BGM_DUCK_FLOOR]);
  return <Audio src={staticFile("audio/bgm.mp3")} volume={volume} />;
};

const WindBed: React.FC = () => {
  const frame = useCurrentFrame();
  const presence = vocalPresence(frame);
  // Wind is quiet throughout and swells slightly when it's carrying the
  // scene alone (narration-free stretches).
  const volume = interpolate(presence, [0, 1], [1.0, 0.55]);
  return <Audio src={staticFile("audio/wind.mp3")} volume={volume} />;
};

const VoiceOverTrack: React.FC = () => (
  <>
    {VO_WINDOWS.map((w) => (
      <Sequence key={w.voFile} from={w.from} durationInFrames={w.durationInFrames} name={`${w.voFile} (real narration)`}>
        <Audio src={staticFile(`audio/${w.voFile}.mp3`)} volume={1} />
      </Sequence>
    ))}
  </>
);

// --- SFX cues -------------------------------------------------------------
// Frame offsets below are LOCAL to each scene's own <Sequence>, mirroring
// the constants already authored in the corresponding scene component, so
// SFX lands exactly on the visual beat it supports:
//   S2TheLine.tsx   LINE_START_FRAME=20, LINE_DRAW_FRAMES=260 (pencil draws the line)
//   S4Machinery.tsx BEAT_FRAMES=195, 4th beat (local 585-780) is the train
//   S5War.tsx       MONTAGE_FRAMES=720 local (the ramping cut montage)
//   S6Victory.tsx   SIGNING_FRAMES=240, HEADLINE_FRAMES=120 (signing + crowd reaction)
//   S8Ending.tsx    ERASE_START=60/ERASE_FRAMES=90, TREE_START=190/TREE_FRAMES=170

const s2 = scene("S2TheLine");
const s4 = scene("S4Machinery");
const s5 = scene("S5War");
const s6 = scene("S6Victory");
const s8 = scene("S8Ending");

const SfxCues: React.FC = () => (
  <>
    {/* S2: pencil scratch while the line is drawn */}
    <Sequence from={s2.from + 20} durationInFrames={260} name="SFX pencil scratch (S2 line draw)">
      <Audio src={staticFile("audio/sfx-pencil-scratch.mp3")} volume={0.5} loop />
    </Sequence>

    {/* S4: train chug under the fourth beat (soldiers depart) */}
    <Sequence from={s4.from + 585} durationInFrames={195} name="SFX train (S4 departure)">
      <Audio src={staticFile("audio/sfx-train.mp3")} volume={0.4} loop />
    </Sequence>

    {/* S5: sparse, distant, non-graphic artillery hits during the montage
        only (not during the narration-free crosses hold, which script.md
        reserves for "music and distant wind... alone"). */}
    {[90, 260, 430, 600].map((localFrame) => (
      <Sequence
        key={localFrame}
        from={s5.from + localFrame}
        durationInFrames={48}
        name={`SFX distant artillery (S5 @${localFrame})`}
      >
        <Audio src={staticFile("audio/sfx-artillery.mp3")} volume={0.3} />
      </Sequence>
    ))}

    {/* S6: crowd murmur under the signing + headline beats, quieter through
        the homecoming beat that follows. */}
    <Sequence from={s6.from} durationInFrames={360} name="SFX crowd murmur (S6 signing/headline)">
      <Audio src={staticFile("audio/sfx-crowd-murmur.mp3")} volume={0.35} loop />
    </Sequence>
    <Sequence from={s6.from + 360} durationInFrames={s6.durationInFrames - 360} name="SFX crowd murmur (S6 homecoming, quieter)">
      <Audio src={staticFile("audio/sfx-crowd-murmur.mp3")} volume={0.15} loop />
    </Sequence>

    {/* S8: pencil/eraser scratch for the erase beat and the tree-drawing
        beat (local frames mirror S8Ending.tsx: ERASE_START=60/ERASE_FRAMES=90,
        TREE_START=190/TREE_FRAMES=170) */}
    <Sequence from={s8.from + 60} durationInFrames={90} name="SFX eraser scratch (S8 erase line)">
      <Audio src={staticFile("audio/sfx-pencil-scratch.mp3")} volume={0.45} loop />
    </Sequence>
    <Sequence from={s8.from + 190} durationInFrames={170} name="SFX pencil scratch (S8 draw tree)">
      <Audio src={staticFile("audio/sfx-pencil-scratch.mp3")} volume={0.4} loop />
    </Sequence>
  </>
);

/**
 * Full audio-only layer for the film: wind + music span the whole 5400
 * frames with a ducking envelope keyed to where narration actually speaks,
 * the eight real VO clips sit at their timing-map positions, and a
 * handful of SFX cues land on specific visual beats. Mount once, as a
 * sibling to the picture <Sequence>s in TheLine.tsx.
 */
export const AudioBed: React.FC = () => (
  <>
    <WindBed />
    <MusicBed />
    <VoiceOverTrack />
    <SfxCues />
  </>
);
