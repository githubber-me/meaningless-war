import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Still } from "../components/Still";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S4Machinery")!;

const BEAT_FRAMES = 195; // 780 / 4

const CrossFadeLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20, BEAT_FRAMES - 30, BEAT_FRAMES - 10], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 60 }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Coins fall into the machine: a handful of small black-ink circles
// dropping in on staggered delays over the first ~90 frames of the beat.
const FallingCoins: React.FC = () => {
  const frame = useCurrentFrame();
  const coins = [0, 12, 24, 36, 48];
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      {coins.map((delay, i) => {
        const y = interpolate(frame, [delay, delay + 40], [-40, 420], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const x = 860 + i * 45;
        const opacity = interpolate(frame, [delay, delay + 5, delay + 55, delay + 65], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return <circle key={i} cx={x} cy={y} r={14} fill="none" stroke="#1A1A1A" strokeWidth={4} opacity={opacity} />;
      })}
    </svg>
  );
};

// Chalk being drawn across the blackboard, replacing a face outline with a
// simple flag shape -- reinforced with a sweeping "chalk" line.
const ChalkSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [20, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
 * 1:02-1:28 (frames 1860-2640, 780 local frames). Four hero-frame beats,
 * ~6.5s each: the coin machine (H03), the blackboard (H04), uniforms
 * (H05), and the train departure (H06) -- each a FLUX.2 pro final held on
 * screen with subtle scale drift plus a small foreground animation so the
 * still never reads as static.
 */
export const S4Machinery: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence  durationInFrames={BEAT_FRAMES}>
        <AbsoluteFill>
          <Still shotId="H03" drift />
          <FallingCoins />
          <CrossFadeLabel>
            <Caption text="Coins become bullets, helmets, tanks." />
          </CrossFadeLabel>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={BEAT_FRAMES} durationInFrames={BEAT_FRAMES}>
        <AbsoluteFill>
          <Still shotId="H04" drift />
          <ChalkSweep />
          <CrossFadeLabel>
            <Caption text="Teachers replace faces with flags." />
          </CrossFadeLabel>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={BEAT_FRAMES * 2} durationInFrames={BEAT_FRAMES}>
        <AbsoluteFill>
          <Still shotId="H05" drift />
          <CrossFadeLabel>
            <Caption text="Young figures receive uniforms." />
          </CrossFadeLabel>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={BEAT_FRAMES * 3} durationInFrames={timing.durationInFrames - BEAT_FRAMES * 3}>
        <AbsoluteFill>
          <Still shotId="H06" drift />
          <CrossFadeLabel>
            <Caption text="Families wave as trains carry soldiers away." />
          </CrossFadeLabel>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// A quiet on-page caption, not narration -- purely a visual anchor so each
// beat reads clearly even without VO in this phase (Phase E adds VO-04).
const Caption: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      fontSize: 30,
      color: "#1A1A1A",
      opacity: 0.75,
      background: "rgba(243,238,228,0.85)",
      padding: "10px 22px",
    }}
  >
    {text}
  </div>
);
