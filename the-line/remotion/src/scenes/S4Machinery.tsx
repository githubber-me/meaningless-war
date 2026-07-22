import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Still } from "../components/Still";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S4Machinery")!;

// Narration-locked beat boundaries. VO-04's four sentences land at these
// film times (whisper-aligned); the scene starts at 62.0s, so local frame
// = (t - 62.0s) * 30:
//   62.0s "Fear became a speech."        -> local 0:   blackboard/classroom (H04)
//   65.1s "The speech became an order."  -> local 93:  coin machine (H03)
//   67.9s "The order became a uniform."  -> local 177: uniforms (H05)
//   71.2s "And frightened people were    -> local 276: train departure (H06)
//         sent to kill..."
//   75.3s narration ends                 -> local 399: the train holds, slow
//         drift only, as the silent coda into War (to local 780 / 88.0s).
export const SPEECH_START = 0; // H04 blackboard -- "Fear became a speech."
export const ORDER_START = 93; // H03 coin machine -- "The speech became an order."
export const UNIFORM_START = 177; // H05 uniforms -- "The order became a uniform."
export const TRAIN_START = 276; // H06 train -- "...sent to kill other frightened people."

// Coins fall into the machine: a handful of small black-ink circles
// dropping in on staggered delays over the first ~60 frames of the beat.
const FallingCoins: React.FC = () => {
  const frame = useCurrentFrame();
  const coins = [0, 8, 16, 24, 32];
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      {coins.map((delay, i) => {
        const y = interpolate(frame, [delay, delay + 32], [-40, 420], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const x = 860 + i * 45;
        const opacity = interpolate(frame, [delay, delay + 5, delay + 44, delay + 52], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return <circle key={i} cx={x} cy={y} r={14} fill="none" stroke="#1A1A1A" strokeWidth={4} opacity={opacity} />;
      })}
    </svg>
  );
};

// Chalk being drawn across the blackboard, replacing a face outline with a
// simple flag shape -- reinforced with a sweeping "chalk" line. Timed to
// fit the 93-frame speech beat.
const ChalkSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <path
        d="M 780 300 Q 960 260 1140 320"
        fill="none"
        stroke="#F3EEE4"
        strokeWidth={10}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
      />
    </svg>
  );
};

/**
 * 1:02-1:28 (frames 1860-2640, 780 local frames). Four hero-frame beats
 * cut exactly on VO-04's four sentences (see the constants above): the
 * blackboard lecture (H04) under "Fear became a speech", the coin machine
 * (H03) under "The speech became an order", uniforms (H05) under "The
 * order became a uniform", and the train departure (H06) under "And
 * frightened people were sent to kill other frightened people" -- then the
 * train holds with slow drift only as the silent coda into War.
 */
export const S4Machinery: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={ORDER_START}>
        <AbsoluteFill>
          <Still shotId="H04" drift />
          <ChalkSweep />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={ORDER_START} durationInFrames={UNIFORM_START - ORDER_START}>
        <AbsoluteFill>
          <Still shotId="H03" drift />
          <FallingCoins />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={UNIFORM_START} durationInFrames={TRAIN_START - UNIFORM_START}>
        <AbsoluteFill>
          <Still shotId="H05" drift />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={TRAIN_START} durationInFrames={timing.durationInFrames - TRAIN_START}>
        <AbsoluteFill>
          <Still shotId="H06" drift />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
