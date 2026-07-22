import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Easing } from "remotion";
import { RedLine } from "../components/RedLine";
import { StickFigure } from "../components/StickFigure";
import { Hand } from "../components/Hand";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S8Ending")!;

// Local-frame choreography for the 540-frame (18s) ending. Unlike the
// earlier draft (which mounted each beat in its own short-lived Sequence,
// so children/line/flags vanished between beats), the whole page is one
// continuous scene: elements persist and each beat layers onto the last.
//   0-60     children walk in from both sides toward the visible red line
//   60-150   they erase the line together (RedLine `erase` mask, bottom-up)
//   140-200  the two flags fall away
//   190-360  the tree draws itself where the border stood
//   360-410  the red-pencil hand enters from above and hesitates
//   410      HARD CUT to white -- before the pencil ever touches (rule 4)
//   410-500  final card holds 90 frames / three full seconds (rule 5)
//   500-540  fade to white
const APPROACH_FRAMES = 60;
const ERASE_START = 60;
const ERASE_FRAMES = 90;
const FLAGS_START = 140;
const FLAGS_FALL_FRAMES = 60;
const TREE_START = 190; // tree strokes stagger over ~170 frames (see Tree below)
const HAND_START = 360;
const WHITE_CUT_FRAME = 410; // hard cut to white
const CARD_HOLD_FRAMES = 90; // script.md rule 5: full three seconds
const FADE_FRAMES = 40;
const CARD_START = WHITE_CUT_FRAME; // 410
const FADE_START = CARD_START + CARD_HOLD_FRAMES; // 500

// Sanity check: the card + fade must exactly close out the scene's 540 frames.
if (FADE_START + FADE_FRAMES !== timing.durationInFrames) {
  throw new Error("S8Ending local frame budget does not sum to the scene's duration");
}

const LINE_X = 960;
const LINE_Y1 = 250;
const GROUND_Y = 830;
const LINE_Y2 = GROUND_Y;
const CHILD_SIZE = 130;
const CHILD_TOP = GROUND_Y - CHILD_SIZE;

const INK = "#1A1A1A";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** A small black-ink pennant standing beside the line, falling away after FLAGS_START. */
const EndFlag: React.FC<{ x: number; delay: number; frame: number }> = ({ x, delay, frame }) => {
  const t = interpolate(frame, [FLAGS_START + delay, FLAGS_START + FLAGS_FALL_FRAMES], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.ease),
  });
  const y = interpolate(t, [0, 1], [0, 300]);
  const rotate = interpolate(t, [0, 1], [0, 75]);
  const opacity = interpolate(t, [0, 0.7, 1], [1, 1, 0]);
  return (
    <svg
      width={90}
      height={150}
      viewBox="0 0 90 150"
      style={{
        position: "absolute",
        left: x,
        top: GROUND_Y - 150 + y,
        opacity,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "10px 150px",
      }}
    >
      <g fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
        <line x1={10} y1={150} x2={10} y2={0} />
        <path d="M 10 0 L 80 16 L 10 32 Z" fill="#F3EEE4" />
      </g>
    </svg>
  );
};

/** A stroke that draws itself over [start, start+duration] local frames. */
const DrawnPath: React.FC<{
  d: string;
  frame: number;
  start: number;
  duration: number;
  strokeWidth?: number;
}> = ({ d, frame, start, duration, strokeWidth = 8 }) => {
  const progress = interpolate(frame, [start, start + duration], [0, 1], clamp);
  if (progress <= 0) return null;
  return (
    <path
      d={d}
      fill="none"
      stroke={INK}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
  );
};

/**
 * A recognizable simple tree -- vertical trunk, two main branches forking
 * up-left and up-right, smaller twigs off each, and short leaf arcs at the
 * tips -- drawn stroke by stroke where the border stood, in plain black
 * ink (never red).
 */
const Tree: React.FC<{ frame: number }> = ({ frame }) => {
  const t0 = TREE_START;
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      {/* trunk */}
      <DrawnPath d={`M ${LINE_X} ${GROUND_Y} L ${LINE_X} 590`} frame={frame} start={t0} duration={50} strokeWidth={10} />
      {/* main branches */}
      <DrawnPath d={`M ${LINE_X} 660 L ${LINE_X - 105} 545`} frame={frame} start={t0 + 40} duration={35} />
      <DrawnPath d={`M ${LINE_X} 620 L ${LINE_X + 110} 520`} frame={frame} start={t0 + 55} duration={35} />
      <DrawnPath d={`M ${LINE_X} 590 L ${LINE_X - 40} 480`} frame={frame} start={t0 + 70} duration={30} />
      {/* twigs */}
      <DrawnPath d={`M ${LINE_X - 60} 595 L ${LINE_X - 125} 505`} frame={frame} start={t0 + 75} duration={25} strokeWidth={6} />
      <DrawnPath d={`M ${LINE_X + 62} 564 L ${LINE_X + 128} 485`} frame={frame} start={t0 + 85} duration={25} strokeWidth={6} />
      <DrawnPath d={`M ${LINE_X - 40} 480 L ${LINE_X + 15} 430`} frame={frame} start={t0 + 95} duration={25} strokeWidth={6} />
      {/* leaf arcs at the branch tips */}
      <DrawnPath d={`M ${LINE_X - 150} 520 Q ${LINE_X - 110} 460 ${LINE_X - 55} 495`} frame={frame} start={t0 + 105} duration={30} strokeWidth={5} />
      <DrawnPath d={`M ${LINE_X + 55} 500 Q ${LINE_X + 115} 440 ${LINE_X + 160} 500`} frame={frame} start={t0 + 115} duration={30} strokeWidth={5} />
      <DrawnPath d={`M ${LINE_X - 55} 445 Q ${LINE_X - 5} 385 ${LINE_X + 55} 445`} frame={frame} start={t0 + 125} duration={30} strokeWidth={5} />
    </svg>
  );
};

const FinalCard: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeToWhite = interpolate(frame, [CARD_HOLD_FRAMES, CARD_HOLD_FRAMES + FADE_FRAMES], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFFFFF" }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: 1 - fadeToWhite,
        }}
      >
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 900,
            fontSize: 84,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: INK,
            textAlign: "center",
            maxWidth: 1400,
            lineHeight: 1.3,
          }}
        >
          No line is worth a generation.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * 2:42-3:00 (frames 4860-5400, 540 local frames). Two children approach
 * the visible red line from either side, erase it together (RedLine's
 * literal SVG mask, bottom-up), the flags fall, and a simple recognizable
 * tree draws itself where the border stood. A new red-pencil hand enters
 * from above and hesitates -- the scene hard-cuts to white before any
 * contact (script.md rule 4), then the final card holds three full
 * seconds (rule 5) before fading to white.
 */
export const S8Ending: React.FC = () => {
  const frame = useCurrentFrame();

  // -- Children -----------------------------------------------------------
  const approach = interpolate(frame, [0, APPROACH_FRAMES], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.ease),
  });
  const leftChildX = interpolate(approach, [0, 1], [140, LINE_X - 180]);
  const rightChildX = interpolate(approach, [0, 1], [1720, LINE_X + 100]);
  const walking = approach < 1;

  // -- Line erase ---------------------------------------------------------
  const erase = interpolate(frame, [ERASE_START, ERASE_START + ERASE_FRAMES], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.ease),
  });
  // The erase front (where the eraser "is"), moving up the line.
  const eraseFrontY = interpolate(erase, [0, 1], [LINE_Y2, LINE_Y1]);
  const eraserVisible = frame >= ERASE_START && erase < 1;

  return (
    <AbsoluteFill>
      {frame < WHITE_CUT_FRAME ? (
        <AbsoluteFill>
          {/* ground stroke the whole beat stands on */}
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <line
              x1={260}
              y1={GROUND_Y}
              x2={1660}
              y2={GROUND_Y}
              stroke={INK}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.5}
            />
          </svg>

          {/* the red border line, fully drawn at scene start, then erased */}
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <RedLine id="s8" x={LINE_X} y1={LINE_Y1} y2={LINE_Y2} strokeWidth={8} erase={erase} />
            {/* the children's eraser, riding the erase front */}
            {eraserVisible ? (
              <rect
                x={LINE_X - 26}
                y={eraseFrontY - 16}
                width={52}
                height={32}
                rx={6}
                fill="#F3EEE4"
                stroke={INK}
                strokeWidth={4}
                transform={`rotate(-12 ${LINE_X} ${eraseFrontY})`}
              />
            ) : null}
          </svg>

          {/* flags on both sides; they fall after the line is erased */}
          <EndFlag x={LINE_X - 330} delay={0} frame={frame} />
          <EndFlag x={LINE_X + 250} delay={10} frame={frame} />

          {/* the tree, drawn where the border stood */}
          <Tree frame={frame} />

          {/* the two children, persistent throughout */}
          <div style={{ position: "absolute", left: leftChildX, top: CHILD_TOP }}>
            <StickFigure pose={walking ? "walking" : "standing"} size={CHILD_SIZE} facing={1} />
          </div>
          <div style={{ position: "absolute", left: rightChildX, top: CHILD_TOP }}>
            <StickFigure pose={walking ? "walking" : "standing"} size={CHILD_SIZE} facing={-1} />
          </div>

          {/* the hesitating red-pencil hand: spring-eases to a stop with its
              tip well above the page; the hard cut below lands before any
              possible contact */}
          {frame >= HAND_START ? (
            <Hand entryFrame={HAND_START} targetX={0.5} targetY={0.3} from="top" pencilColor="red" scale={1.1} />
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* Hard cut to white: FinalCard's own solid white background begins
          instantly at this Sequence boundary -- a hard cut, not a
          crossfade -- unambiguously before any possibility of contact. */}
      <Sequence from={CARD_START} durationInFrames={CARD_HOLD_FRAMES + FADE_FRAMES}>
        <FinalCard />
      </Sequence>
    </AbsoluteFill>
  );
};
