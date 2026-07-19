import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { RedLine } from "../components/RedLine";
import { Hand } from "../components/Hand";

const LINE_START_FRAME = 20;
const LINE_DRAW_FRAMES = 260; // line finishes drawing at local frame 280
const LINE_END_FRAME = LINE_START_FRAME + LINE_DRAW_FRAMES;

// A small pole+pennant, drawn in plain black ink -- flags in this film are
// never red; red is reserved for the border line / propaganda / destruction
// glow / final pencil only (script.md rule 1).
const Flag: React.FC<{ riseProgress: number }> = ({ riseProgress }) => {
  const y = interpolate(riseProgress, [0, 1], [70, 0]);
  const opacity = interpolate(riseProgress, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });
  return (
    <svg width={90} height={140} viewBox="0 0 90 140" style={{ opacity }}>
      <g fill="none" stroke="#1A1A1A" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
        <line x1={10} y1={140} x2={10} y2={y} />
        <path d={`M 10 ${y} L 80 ${y + 16} L 10 ${y + 32} Z`} fill="#F3EEE4" />
      </g>
    </svg>
  );
};

const Letters: React.FC<{ text: string; frame: number; startFrame: number; style?: React.CSSProperties }> = ({
  text,
  frame,
  startFrame,
  style,
}) => (
  <div style={{ display: "flex", ...style }}>
    {text.split("").map((ch, i) => {
      const charStart = startFrame + i * 6;
      const opacity = interpolate(frame, [charStart, charStart + 14], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.ease),
      });
      return (
        <span
          key={i}
          style={{
            opacity,
            fontFamily: "'Arial Narrow', Arial, sans-serif",
            fontWeight: 900,
            letterSpacing: 6,
            fontSize: 96,
            color: "#1A1A1A",
          }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);

/**
 * 0:20-0:40 (frames 600-1200, 600 local frames). A hand enters with the
 * red pencil and draws the vertical dividing line; "US" / "THEM" are
 * lettered on either side in plain black ink (the line itself is the only
 * red thing here, per script.md rule 1 -- the pencil tip is red only
 * because it is actively laying down the red border line, not because
 * lettering or anything else is red); flags rise above both houses.
 */
export const S2TheLine: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const lineX = width / 2;
  const lineY1 = height * 0.12;
  const lineY2 = height * 0.92;

  // The hand leads the pencil tip continuously down the line as it draws,
  // rather than springing once to a fixed point (Hand's `progress` override).
  const drawProgress = interpolate(frame, [LINE_START_FRAME, LINE_END_FRAME], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  const handOpacity = interpolate(frame, [0, 10, LINE_END_FRAME + 20, LINE_END_FRAME + 40], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Before the draw starts, the hand slides in from above to the top of the
  // line; once drawing begins, the pencil tip tracks the line's drawing tip
  // exactly (progress is pinned to 1 so Hand applies no offscreen blend of
  // its own -- targetY alone drives the motion).
  const entryY = interpolate(frame, [0, LINE_START_FRAME], [-0.15, lineY1 / height], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  const handTargetY =
    drawProgress > 0 ? interpolate(drawProgress, [0, 1], [lineY1 / height, lineY2 / height]) : entryY;

  const flagRise = interpolate(frame, [420, 540], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <RedLine
          id="s2"
          x={lineX}
          y1={lineY1}
          y2={lineY2}
          strokeWidth={8}
          startFrame={LINE_START_FRAME}
          drawDurationInFrames={LINE_DRAW_FRAMES}
        />
      </svg>

      <AbsoluteFill style={{ opacity: handOpacity }}>
        <Hand
          targetX={lineX / width}
          targetY={handTargetY}
          from="top"
          pencilColor="red"
          scale={0.9}
          progress={1}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ flexDirection: "row" }}>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Letters text="US" frame={frame} startFrame={300} />
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Letters text="THEM" frame={frame} startFrame={340} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ flexDirection: "row", alignItems: "flex-start", padding: "40px 140px" }}>
        <div style={{ flex: 1 }}>
          <Flag riseProgress={flagRise} />
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <Flag riseProgress={flagRise} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
