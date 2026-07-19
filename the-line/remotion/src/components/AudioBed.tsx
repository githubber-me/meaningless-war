import React from "react";
import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { SCENE_TIMINGS } from "../scenes/timing";

/**
 * Phase E audio bed (plan.md section 2 Phase E, script.md's per-section
 * "Audio" notes). Everything here is $0: eight silent VO placeholders of
 * the correct duration standing in for the user-supplied ElevenLabs files,
 * plus a programmatically-synthesized music bed, wind, and SFX layer. See
 * `the-line/CREDITS.md` for full provenance -- none of this is a licensed
 * third-party recording; it is ffmpeg-synthesized (sine tones / filtered
 * noise) placeholder audio the user should swap for real assets.
 *
 * Nothing here is baked into picture; everything lives in the audio-only
 * <AudioBed/> tree so replacing a placeholder later never touches the
 * scene components.
 */

const scene = (id: (typeof SCENE_TIMINGS)[number]["id"]) => SCENE_TIMINGS.find((s) => s.id === id)!;

// Global frame windows (start, end) where narration is expected to be
// speaking, per script.md's timing map. These drive music/wind ducking so
// the envelope is already correct the moment real VO-01..VO-08 land --
// nothing about the ducking logic changes when the placeholders are
// replaced. Every window equals its scene's full span EXCEPT:
//  - VO-05 (War): script.md is explicit that narration "ends by 1:52" --
//    24s into the 32s scene -- leaving the final 8s (the crosses hold)
//    "music and distant wind... alone".
//  - VO-08 (Ending): narration covers the erase/tree-draw beats only,
//    finishing before the hesitating hand enters (S8Ending.tsx
//    HAND_START/CARD_START), so the hand-hover, hard cut to white, and the
//    three-second final-card hold (script.md rule 5) are narration-free.
const VO_WINDOWS: { voFile: string; from: number; durationInFrames: number }[] = [
  { voFile: "VO-01", from: scene("S1Before").from, durationInFrames: scene("S1Before").durationInFrames },
  { voFile: "VO-02", from: scene("S2TheLine").from, durationInFrames: scene("S2TheLine").durationInFrames },
  {
    voFile: "VO-03",
    from: scene("S3StorySpreads").from,
    durationInFrames: scene("S3StorySpreads").durationInFrames,
  },
  { voFile: "VO-04", from: scene("S4Machinery").from, durationInFrames: scene("S4Machinery").durationInFrames },
  // ends at frame 3360 == 1:52.000 exactly, per script.md.
  { voFile: "VO-05", from: scene("S5War").from, durationInFrames: 720 },
  { voFile: "VO-06", from: scene("S6Victory").from, durationInFrames: scene("S6Victory").durationInFrames },
  { voFile: "VO-07", from: scene("S7TheCost").from, durationInFrames: scene("S7TheCost").durationInFrames },
  // ends at local frame 330 (S8Ending.tsx HAND_START), well before the
  // hard cut to white at local frame 410.
  { voFile: "VO-08", from: scene("S8Ending").from, durationInFrames: 330 },
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

const MusicBed: React.FC = () => {
  const frame = useCurrentFrame();
  const presence = vocalPresence(frame);
  // Sparse/low/single-instrument bed: ducked well under narration, allowed
  // to breathe (full level) in the narration-free stretches -- the last 8s
  // of War (script.md: "Music and distant wind continue alone") and the
  // Ending's hand/card/fade stretch.
  const volume = interpolate(presence, [0, 1], [0.9, 0.22]);
  return <Audio src={staticFile("audio/music-bed.mp3")} volume={volume} />;
};

const WindBed: React.FC = () => {
  const frame = useCurrentFrame();
  const presence = vocalPresence(frame);
  // Wind is quiet throughout and swells slightly when it's carrying the
  // scene alone (narration-free stretches).
  const volume = interpolate(presence, [0, 1], [1.0, 0.55]);
  return <Audio src={staticFile("audio/wind.mp3")} volume={volume} />;
};

const VoiceOverPlaceholders: React.FC = () => (
  <>
    {VO_WINDOWS.map((w) => (
      <Sequence key={w.voFile} from={w.from} durationInFrames={w.durationInFrames} name={`${w.voFile} (silent placeholder)`}>
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
//   S8Ending.tsx    ERASE_START=25/ERASE_FRAMES=70, TREE_START=150/TREE_FRAMES=140

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

    {/* S8: pencil/eraser scratch for the erase beat and the tree-drawing beat */}
    <Sequence from={s8.from + 25} durationInFrames={70} name="SFX eraser scratch (S8 erase line)">
      <Audio src={staticFile("audio/sfx-pencil-scratch.mp3")} volume={0.45} loop />
    </Sequence>
    <Sequence from={s8.from + 150} durationInFrames={140} name="SFX pencil scratch (S8 draw tree)">
      <Audio src={staticFile("audio/sfx-pencil-scratch.mp3")} volume={0.4} loop />
    </Sequence>
  </>
);

/**
 * Full audio-only layer for the film: wind + music span the whole 5400
 * frames with a ducking envelope keyed to where narration is expected,
 * eight silent VO placeholders sit at their timing-map positions, and a
 * handful of SFX cues land on specific visual beats. Mount once, as a
 * sibling to the picture <Sequence>s in TheLine.tsx.
 */
export const AudioBed: React.FC = () => (
  <>
    <WindBed />
    <MusicBed />
    <VoiceOverPlaceholders />
    <SfxCues />
  </>
);
