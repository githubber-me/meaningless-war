import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, random } from "remotion";
import { Still } from "../components/Still";
import { PropagandaCard } from "../components/PropagandaCard";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S6Victory")!;

const SIGNING_FRAMES = 240;
const HEADLINE_FRAMES = 120;
const HOMECOMING_FRAMES = timing.durationInFrames - SIGNING_FRAMES - HEADLINE_FRAMES;

const CONFETTI_COUNT = 26;

/**
 * Confetti, strictly black-and-white ink shapes (small squares/circles),
 * because "the red rule holds even here" (script.md): red is never used
 * for celebration, only for the border / propaganda accents / destruction
 * glow / final pencil.
 */
const Confetti: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const seed = `confetti-${i}`;
        const xStart = random(`${seed}-x`) * 1920;
        const delay = random(`${seed}-d`) * 60;
        const speed = 4 + random(`${seed}-s`) * 3;
        const y = -40 + Math.max(0, frame - delay) * speed;
        const isCircle = random(`${seed}-shape`) > 0.5;
        const opacity = y > 1080 ? 0 : 1;
        const size = 10 + random(`${seed}-size`) * 10;
        const fill = random(`${seed}-fill`) > 0.5 ? "#1A1A1A" : "#F3EEE4";
        return isCircle ? (
          <circle key={i} cx={xStart} cy={y} r={size / 2} fill={fill} stroke="#1A1A1A" strokeWidth={2} opacity={opacity} />
        ) : (
          <rect
            key={i}
            x={xStart}
            y={y}
            width={size}
            height={size}
            fill={fill}
            stroke="#1A1A1A"
            strokeWidth={2}
            opacity={opacity}
            transform={`rotate(${(frame + i * 13) * 4} ${xStart + size / 2} ${y + size / 2})`}
          />
        );
      })}
    </svg>
  );
};

const VictoryHeadlines: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", transform: "scale(0.62)" }}>
      <PropagandaCard text="VICTORY" seed="victory-l" />
    </div>
    <div style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", transform: "scale(0.62)" }}>
      <PropagandaCard text="VICTORY" seed="victory-r" />
    </div>
  </AbsoluteFill>
);

/**
 * 2:00-2:22 (frames 3600-4260, 660 local frames). Leaders sign and shake
 * hands (H07) under black-and-white confetti, "VICTORY" printed on both
 * sides' newspapers, then the homecoming diptych (H08) -- embraces on one
 * side of the frame, an empty chair on the other.
 */
export const S6Victory: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence  durationInFrames={SIGNING_FRAMES}>
        <AbsoluteFill>
          <Still shotId="H07" drift />
          <Confetti />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={SIGNING_FRAMES} durationInFrames={HEADLINE_FRAMES}>
        <VictoryHeadlines />
      </Sequence>

      <Sequence from={SIGNING_FRAMES + HEADLINE_FRAMES} durationInFrames={HOMECOMING_FRAMES}>
        <Still shotId="H08" drift />
      </Sequence>
    </AbsoluteFill>
  );
};
