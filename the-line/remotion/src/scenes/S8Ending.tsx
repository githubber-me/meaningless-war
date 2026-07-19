import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Easing } from "remotion";
import { RedLine } from "../components/RedLine";
import { StickFigure } from "../components/StickFigure";
import { Hand } from "../components/Hand";
import { Still } from "../components/Still";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S8Ending")!;

// Local-frame budget for the 540-frame (18s) ending, chosen so the final
// card can hold the full 90-frame / 3-second minimum script.md rule 5
// requires, with room left for a fade to white after it.
const APPROACH_FRAMES = 25;
const ERASE_FRAMES = 70;
const FLAGS_FALL_FRAMES = 55;
const TREE_FRAMES = 140;
const PAYOFF_STILL_FRAMES = 40;
const HAND_FRAMES = 80;
const CARD_HOLD_FRAMES = 90; // script.md rule 5: full three seconds
const FADE_FRAMES = 40;

const APPROACH_START = 0;
const ERASE_START = APPROACH_START + APPROACH_FRAMES; // 25
const FLAGS_START = ERASE_START + ERASE_FRAMES; // 95
const TREE_START = FLAGS_START + FLAGS_FALL_FRAMES; // 150
const PAYOFF_START = TREE_START + TREE_FRAMES; // 290
const HAND_START = PAYOFF_START + PAYOFF_STILL_FRAMES; // 330
const WHITE_CUT_FRAME = HAND_START + HAND_FRAMES; // 410 -- hard cut to white
const CARD_START = WHITE_CUT_FRAME; // 410
const FADE_START = CARD_START + CARD_HOLD_FRAMES; // 500

// Sanity check: the budget must exactly tile the scene's 540 frames.
if (FADE_START + FADE_FRAMES !== timing.durationInFrames) {
  throw new Error("S8Ending local frame budget does not sum to the scene's duration");
}

const LINE_X = 960;
const LINE_Y1 = 220;
const LINE_Y2 = 900;

/** Two children approaching the border from either side. */
const ChildrenApproach: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, APPROACH_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  const leftX = interpolate(t, [0, 1], [200, LINE_X - 140]);
  const rightX = interpolate(t, [0, 1], [1720, LINE_X + 140]);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: leftX, top: 620 }}>
        <StickFigure pose="walking" size={140} facing={1} />
      </div>
      <div style={{ position: "absolute", left: rightX, top: 620 }}>
        <StickFigure pose="walking" size={140} facing={-1} />
      </div>
    </AbsoluteFill>
  );
};

/** The line, being erased -- RedLine's `erase` prop drives a literal SVG mask. */
const LineErase: React.FC = () => {
  const frame = useCurrentFrame();
  const erase = interpolate(frame, [0, ERASE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <RedLine id="s8" x={LINE_X} y1={LINE_Y1} y2={LINE_Y2} strokeWidth={8} erase={erase} />
      </svg>
      <div style={{ position: "absolute", left: LINE_X - 200, top: 560 }}>
        <StickFigure pose="standing" size={140} facing={1} />
      </div>
      <div style={{ position: "absolute", left: LINE_X + 60, top: 560 }}>
        <StickFigure pose="standing" size={140} facing={-1} />
      </div>
    </AbsoluteFill>
  );
};

/** A small black-ink pennant falling away and fading -- never red (rule 1). */
const FallingFlag: React.FC<{ x: number; delay: number }> = ({ x, delay }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + FLAGS_FALL_FRAMES - delay], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.ease),
  });
  const y = interpolate(t, [0, 1], [0, 260]);
  const rotate = interpolate(t, [0, 1], [0, 70]);
  const opacity = interpolate(t, [0, 0.7, 1], [1, 1, 0]);
  return (
    <svg
      width={90}
      height={140}
      viewBox="0 0 90 140"
      style={{ position: "absolute", left: x, top: 40 + y, opacity, transform: `rotate(${rotate}deg)` }}
    >
      <g fill="none" stroke="#1A1A1A" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
        <line x1={10} y1={140} x2={10} y2={0} />
        <path d="M 10 0 L 80 16 L 10 32 Z" fill="#F3EEE4" />
      </g>
    </svg>
  );
};

const FlagsFall: React.FC = () => (
  <AbsoluteFill>
    <FallingFlag x={LINE_X - 300} delay={0} />
    <FallingFlag x={LINE_X + 220} delay={10} />
  </AbsoluteFill>
);

/**
 * The tree, drawn as an animated SVG path -- the same pathLength /
 * strokeDashoffset draw-on technique used by RedLine in S2, reused here in
 * plain black ink (never red) where the border used to stand.
 */
const TreeDraw: React.FC = () => {
  const frame = useCurrentFrame();
  const trunkProgress = interpolate(frame, [0, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const canopyProgress = interpolate(frame, [50, TREE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <path
          d={`M ${LINE_X} 900 L ${LINE_X} 620`}
          fill="none"
          stroke="#1A1A1A"
          strokeWidth={10}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - trunkProgress}
        />
        <path
          d={`M ${LINE_X} 640 C ${LINE_X - 160} 600 ${LINE_X - 140} 460 ${LINE_X} 440
              C ${LINE_X + 140} 460 ${LINE_X + 160} 600 ${LINE_X} 640 Z`}
          fill="none"
          stroke="#1A1A1A"
          strokeWidth={6}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - canopyProgress}
        />
      </svg>
    </AbsoluteFill>
  );
};

/** A brief crossfade into H10, the illustrated payoff of the finished scene. */
const PayoffStill: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 25, PAYOFF_STILL_FRAMES - 10, PAYOFF_STILL_FRAMES], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity }}>
      <Still shotId="H10" />
    </AbsoluteFill>
  );
};

/**
 * The hesitating hand: a fresh red-pencil Hand entering from above,
 * settling at a point that is deliberately well clear of the page surface
 * -- the target itself never reaches contact, so no amount of spring
 * settle time can cause a touch. The scene cuts to white before the
 * spring even finishes settling, adding a second layer of safety margin
 * on top of the geometric one.
 */
const HesitatingHand: React.FC = () => {
  return (
    <AbsoluteFill>
      <Hand entryFrame={0} targetX={0.5} targetY={0.32} from="top" pencilColor="red" scale={1.1} />
    </AbsoluteFill>
  );
};

const FinalCard: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeToWhite = interpolate(frame, [CARD_HOLD_FRAMES, CARD_HOLD_FRAMES + FADE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
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
            color: "#1A1A1A",
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
 * 2:42-3:00 (frames 4860-5400, 540 local frames). Children erase the red
 * line (a literal RedLine mask animation), draw a tree where it stood,
 * then a new red-pencil hand enters and hesitates above the page. The
 * scene hard-cuts to white before any contact -- the hand's resting point
 * is geometrically above the page surface regardless of animation
 * progress, and the cut lands before the spring even finishes settling
 * (script.md rule 4). The final card then holds a full three seconds
 * (90 frames, script.md rule 5) before fading to white.
 */
export const S8Ending: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={APPROACH_START} durationInFrames={APPROACH_FRAMES}>
        <ChildrenApproach />
      </Sequence>
      <Sequence from={ERASE_START} durationInFrames={ERASE_FRAMES}>
        <LineErase />
      </Sequence>
      <Sequence from={FLAGS_START} durationInFrames={FLAGS_FALL_FRAMES}>
        <FlagsFall />
      </Sequence>
      <Sequence from={TREE_START} durationInFrames={TREE_FRAMES}>
        <TreeDraw />
      </Sequence>
      <Sequence from={PAYOFF_START} durationInFrames={PAYOFF_STILL_FRAMES}>
        <PayoffStill />
      </Sequence>
      <Sequence from={HAND_START} durationInFrames={HAND_FRAMES}>
        <HesitatingHand />
      </Sequence>
      {/* Hard cut to white: FinalCard's own solid white background begins
          instantly at this Sequence boundary -- a hard cut, not a
          crossfade -- unambiguously before any possibility of contact. */}
      <Sequence from={CARD_START} durationInFrames={CARD_HOLD_FRAMES + FADE_FRAMES}>
        <FinalCard />
      </Sequence>
    </AbsoluteFill>
  );
};
