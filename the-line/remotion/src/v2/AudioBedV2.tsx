import React from "react";
import { Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";

/**
 * V2 audio bed: per the user's explicit instruction, ONLY the eight VO
 * clips and bgm.mp3 survive the revamp -- no wind, no SFX. Placements are
 * unchanged from v1 (the-line/remotion/src/components/AudioBed.tsx):
 * VO-01@0, VO-02@600, VO-03@1200, VO-04@1860, VO-05@2640, VO-06@3600,
 * VO-07@4260, VO-08@4860 -- same VO files, same real (whisper-aligned)
 * clip durations, so the narration lands exactly where v1 placed it.
 */

const VO_WINDOWS: { voFile: string; from: number; durationInFrames: number }[] = [
  { voFile: "VO-01", from: 0, durationInFrames: 487 },
  { voFile: "VO-02", from: 600, durationInFrames: 324 },
  { voFile: "VO-03", from: 1200, durationInFrames: 445 },
  { voFile: "VO-04", from: 1860, durationInFrames: 426 },
  // Ends at frame 3130 (104.3s) -- well before R19's 112s (frame 3360)
  // silence hold begins, per v2-treatment.md rule 3 (8s of silence).
  { voFile: "VO-05", from: 2640, durationInFrames: 490 },
  { voFile: "VO-06", from: 3600, durationInFrames: 379 },
  { voFile: "VO-07", from: 4260, durationInFrames: 364 },
  { voFile: "VO-08", from: 4860, durationInFrames: 192 },
];

const DUCK_ATTACK = 20;

function vocalPresence(frame: number): number {
  let presence = 0;
  for (const w of VO_WINDOWS) {
    const end = w.from + w.durationInFrames;
    const level = interpolate(frame, [w.from - DUCK_ATTACK, w.from, end, end + DUCK_ATTACK], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    presence = Math.max(presence, level);
  }
  return presence;
}

// R19's scripted silence hold: frames 3360-3600 (112-120s). bgm dips very
// low here (not fully silent -- "8 seconds of silence" in script.md
// refers to the VO track; music continues at a bare-minimum level so the
// hold doesn't feel like a technical dropout) rather than the normal 40%
// ceiling.
const SILENCE_FROM = 3360;
const SILENCE_TO = 3600;
const SILENCE_RAMP = 30;

function silenceDip(frame: number): number {
  // 1 = normal ceiling applies, ~0.12 = deep dip during the hold.
  return interpolate(
    frame,
    [SILENCE_FROM - SILENCE_RAMP, SILENCE_FROM, SILENCE_TO, SILENCE_TO + SILENCE_RAMP],
    [1, 0.12, 0.12, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

const BGM_CEILING = 0.4; // hard ceiling, never exceeded
const BGM_DUCK_FLOOR = 0.35; // fraction of ceiling retained under VO

const MusicBed: React.FC = () => {
  const frame = useCurrentFrame();
  const presence = vocalPresence(frame);
  const duckedCeiling = interpolate(presence, [0, 1], [BGM_CEILING, BGM_CEILING * BGM_DUCK_FLOOR]);
  const volume = duckedCeiling * silenceDip(frame);
  return <Audio src={staticFile("audio/bgm.mp3")} volume={volume} />;
};

const VoiceOverTrack: React.FC = () => (
  <>
    {VO_WINDOWS.map((w) => (
      <Sequence key={w.voFile} from={w.from} durationInFrames={w.durationInFrames} name={`${w.voFile} (v2)`}>
        <Audio src={staticFile(`audio/${w.voFile}.mp3`)} volume={1} />
      </Sequence>
    ))}
  </>
);

export const AudioBedV2: React.FC = () => (
  <>
    <MusicBed />
    <VoiceOverTrack />
  </>
);
