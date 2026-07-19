import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Sequence, Easing } from "remotion";
import { StickFigure, StickFigurePose } from "../components/StickFigure";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S1Before")!;

/**
 * A minimal house: a triangular roof over a square, drawn with the same
 * stroke weight as StickFigure so the two families' houses read as part of
 * one consistent line-drawing world.
 */
const House: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg width={180} height={150} viewBox="0 0 180 150" style={style}>
    <g fill="none" stroke="#1A1A1A" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <polyline points="10,70 90,10 170,70" />
      <rect x={30} y={70} width={120} height={70} />
      <rect x={82} y={100} width={30} height={40} />
    </g>
  </svg>
);

const fadeIn = (frame: number, start: number, duration = 40) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

/**
 * A "family unit": two adults, two children and a house, built entirely
 * from the shared StickFigure component so line weight never drifts.
 * `side="right"` mirrors the whole unit for the opposite side of the page,
 * so the two families read as nearly identical (script.md: "another
 * nearly identical family").
 */
const Family: React.FC<{ side: "left" | "right"; frame: number; appearAt: number }> = ({
  side,
  frame,
  appearAt,
}) => {
  const facing = side === "left" ? 1 : -1;
  const opacity = fadeIn(frame, appearAt);
  const memberOpacity = (delay: number) => fadeIn(frame, appearAt + delay);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: side === "left" ? "flex-start" : "flex-end",
        padding: "0 90px 60px",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: side === "left" ? "row" : "row-reverse",
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        <House />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, opacity: memberOpacity(20) }}>
          <StickFigure pose="standing" size={150} facing={facing} />
          <StickFigure pose="waving" size={150} facing={facing} />
          <StickFigure pose="standing" size={90} facing={facing} style={{ opacity: memberOpacity(45) }} />
          <StickFigure pose="standing" size={90} facing={facing} style={{ opacity: memberOpacity(45) }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

type Vignette = { label: string; poseA: StickFigurePose; poseB: StickFigurePose };

// "Quick images of cooking, working, playing, arguing and sleeping" --
// script.md's five ordinary-life beats, each mirrored on both sides of the
// (not-yet-drawn) page to reinforce "on both sides, life was ordinary."
const VIGNETTES: Vignette[] = [
  { label: "cooking", poseA: "standing", poseB: "sitting" },
  { label: "working", poseA: "pointing", poseB: "standing" },
  { label: "playing", poseA: "waving", poseB: "walking" },
  { label: "arguing", poseA: "pointing", poseB: "pointing" },
  { label: "sleeping", poseA: "sitting", poseB: "sitting" },
];

const VignetteBeat: React.FC<{ v: Vignette }> = ({ v }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, 50, 66], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
      <div style={{ display: "flex", gap: 260 }}>
        <StickFigure pose={v.poseA} size={220} facing={1} />
        <StickFigure pose={v.poseB} size={220} facing={-1} />
      </div>
    </AbsoluteFill>
  );
};

/**
 * 0:00-0:20 (frames 0-600). Blank page; a family appears, then a near
 * -identical family across the page; quick glimpses of ordinary life.
 * No red anywhere -- the line has not been drawn yet (script.md rule 1).
 */
export const S1Before: React.FC = () => {
  const frame = useCurrentFrame();

  // Blank page hold, then both families appear, then the montage of daily
  // life takes over for the back half of the block.
  const familiesOpacity = interpolate(frame, [430, 470], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: familiesOpacity }}>
        <Family side="left" frame={frame} appearAt={60} />
        <Family side="right" frame={frame} appearAt={150} />
      </AbsoluteFill>

      <Sequence from={430} durationInFrames={timing.durationInFrames - 430}>
        {VIGNETTES.map((v, i) => (
          <Sequence key={v.label} from={i * 34} durationInFrames={34}>
            <VignetteBeat v={v} />
          </Sequence>
        ))}
      </Sequence>
    </AbsoluteFill>
  );
};
