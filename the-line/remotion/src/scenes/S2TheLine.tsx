import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { RedLine } from "../components/RedLine";
import { Hand } from "../components/Hand";
import { Family } from "./S1Before";

// Narration-locked timings (VO-02 plays 20.0-30.6s film time; this scene is
// frames 600-1200, so local frame = (t - 20s) * 30):
//   ~20.2s  hand enters                     -> local 6
//   ~21.3s  "Then someone drew a line" has  -> local 39: line draw starts
//           landed; pencil touches down
//   ~26.5s  line finished, hand withdraws   -> local 195
//   ~27.5s  "...a story about the people    -> local 225: "US" letters
//           beyond it"                         local 250: "THEM" letters
//   ~31-34s (after the sentence)            -> local 330-420: flags rise
const HAND_ENTER_FRAME = 6;
const LINE_START_FRAME = 39;
const LINE_DRAW_FRAMES = 156; // line finishes drawing at local frame 195
const LINE_END_FRAME = LINE_START_FRAME + LINE_DRAW_FRAMES;
const US_START_FRAME = 225;
const THEM_START_FRAME = 250;
const FLAGS_RISE = [330, 420] as const;

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
 * 0:20-0:40 (frames 600-1200, 600 local frames). The two nearly identical
 * families from S1 are still on the page (same components, same positions
 * -- the line must be drawn BETWEEN people, or the drawing means nothing).
 * A hand enters with the red pencil as "Then someone drew a line" begins,
 * and the line goes down between the families; they stay visible on both
 * sides through "no mountain stood there, no river". "US" / "THEM" are
 * lettered during "...a story about the people beyond it", and the flags
 * rise only after the sentence ends. The line itself is the only red thing
 * here, per script.md rule 1 -- the pencil tip is red only because it is
 * actively laying down the red border line.
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
  const handOpacity = interpolate(
    frame,
    [HAND_ENTER_FRAME, HAND_ENTER_FRAME + 10, LINE_END_FRAME + 20, LINE_END_FRAME + 40],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  // Before the draw starts, the hand slides in from above to the top of the
  // line; once drawing begins, the pencil tip tracks the line's drawing tip
  // exactly (progress is pinned to 1 so Hand applies no offscreen blend of
  // its own -- targetY alone drives the motion).
  const entryY = interpolate(frame, [HAND_ENTER_FRAME, LINE_START_FRAME], [-0.15, lineY1 / height], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  const handTargetY =
    drawProgress > 0 ? interpolate(drawProgress, [0, 1], [lineY1 / height, lineY2 / height]) : entryY;

  const flagRise = interpolate(frame, [FLAGS_RISE[0], FLAGS_RISE[1]], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });

  // The families carried over from S1: a very quick fade-in softens the cut
  // from S1's closing vignette, then they hold for the whole scene.
  const familiesOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Both mirrored families + houses, exactly as S1 laid them out
          (appearAt is far in the past so every member is fully drawn). */}
      <AbsoluteFill style={{ opacity: familiesOpacity }}>
        <Family side="left" frame={frame} appearAt={-200} />
        <Family side="right" frame={frame} appearAt={-200} />
      </AbsoluteFill>

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
          <Letters text="US" frame={frame} startFrame={US_START_FRAME} />
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Letters text="THEM" frame={frame} startFrame={THEM_START_FRAME} />
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
