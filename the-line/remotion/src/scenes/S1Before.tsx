import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Sequence, Easing } from "remotion";
import { StickFigure } from "../components/StickFigure";
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
export const Family: React.FC<{ side: "left" | "right"; frame: number; appearAt: number }> = ({
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

type VignetteLabel = "cooking" | "working" | "playing" | "arguing" | "sleeping";

// "Quick images of cooking, working, playing, arguing and sleeping" --
// script.md's five ordinary-life beats, each shown as a small grounded
// mini-scene mirrored on both sides of the (not-yet-drawn) page to
// reinforce "on both sides, life was ordinary."
const VIGNETTES: VignetteLabel[] = ["cooking", "working", "playing", "arguing", "sleeping"];

const INK = "#1A1A1A";

/**
 * One grounded mini-scene, 480x320: every vignette stands on an explicit
 * ground line and has the minimal prop that makes its activity read --
 * a stove+pot for cooking, a workbench for working, a ball for playing,
 * face-to-face pointing for arguing, a bed for sleeping.
 */
const VignetteScene: React.FC<{ label: VignetteLabel }> = ({ label }) => {
  const ground = (
    <line x1={10} y1={306} x2={470} y2={306} stroke={INK} strokeWidth={4} strokeLinecap="round" />
  );

  switch (label) {
    case "cooking":
      return (
        <div style={{ position: "relative", width: 480, height: 320 }}>
          <div style={{ position: "absolute", left: 70, top: 126 }}>
            <StickFigure pose="standing" size={180} facing={1} />
          </div>
          <svg width={480} height={320} viewBox="0 0 480 320" style={{ position: "absolute", inset: 0 }}>
            {ground}
            <g fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
              {/* stove */}
              <rect x={270} y={232} width={130} height={74} />
              {/* pot on top */}
              <path d="M 300 232 L 300 206 Q 335 224 370 206 L 370 232 Z" />
              {/* steam */}
              <path d="M 322 192 Q 316 178 324 164" />
              <path d="M 348 192 Q 342 178 350 164" />
            </g>
          </svg>
        </div>
      );
    case "working":
      return (
        <div style={{ position: "relative", width: 480, height: 320 }}>
          <div style={{ position: "absolute", left: 70, top: 126 }}>
            <StickFigure pose="pointing" size={180} facing={1} />
          </div>
          <svg width={480} height={320} viewBox="0 0 480 320" style={{ position: "absolute", inset: 0 }}>
            {ground}
            <g fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
              {/* workbench */}
              <line x1={250} y1={236} x2={430} y2={236} />
              <line x1={262} y1={236} x2={262} y2={306} />
              <line x1={418} y1={236} x2={418} y2={306} />
              {/* tools/box on the bench */}
              <rect x={300} y={204} width={52} height={32} />
              <line x1={376} y1={236} x2={396} y2={202} />
              <rect x={388} y={192} width={20} height={12} />
            </g>
          </svg>
        </div>
      );
    case "playing":
      return (
        <div style={{ position: "relative", width: 480, height: 320 }}>
          <div style={{ position: "absolute", left: 70, top: 186 }}>
            <StickFigure pose="waving" size={120} facing={1} />
          </div>
          <div style={{ position: "absolute", left: 320, top: 186 }}>
            <StickFigure pose="walking" size={120} facing={-1} />
          </div>
          <svg width={480} height={320} viewBox="0 0 480 320" style={{ position: "absolute", inset: 0 }}>
            {ground}
            {/* ball on the ground between them */}
            <circle cx={240} cy={288} r={18} fill="none" stroke={INK} strokeWidth={4} />
            <path d="M 226 276 Q 240 290 254 276" fill="none" stroke={INK} strokeWidth={3} />
          </svg>
        </div>
      );
    case "arguing":
      return (
        <div style={{ position: "relative", width: 480, height: 320 }}>
          <div style={{ position: "absolute", left: 80, top: 146 }}>
            <StickFigure pose="pointing" size={160} facing={1} />
          </div>
          <div style={{ position: "absolute", left: 300, top: 146 }}>
            <StickFigure pose="pointing" size={160} facing={-1} />
          </div>
          <svg width={480} height={320} viewBox="0 0 480 320" style={{ position: "absolute", inset: 0 }}>
            {ground}
            {/* agitation burst between the two */}
            <g stroke={INK} strokeWidth={3} strokeLinecap="round">
              <line x1={240} y1={120} x2={240} y2={100} />
              <line x1={220} y1={128} x2={208} y2={112} />
              <line x1={260} y1={128} x2={272} y2={112} />
            </g>
          </svg>
        </div>
      );
    case "sleeping":
      return (
        <div style={{ position: "relative", width: 480, height: 320 }}>
          {/* lying figure, rotated to horizontal above the bed frame */}
          <div
            style={{
              position: "absolute",
              left: 170,
              top: 148,
              transform: "rotate(-90deg)",
              transformOrigin: "center",
            }}
          >
            <StickFigure pose="standing" size={150} facing={1} />
          </div>
          <svg width={480} height={320} viewBox="0 0 480 320" style={{ position: "absolute", inset: 0 }}>
            {ground}
            <g fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
              {/* bed frame */}
              <line x1={120} y1={252} x2={370} y2={252} />
              <line x1={128} y1={252} x2={128} y2={306} />
              <line x1={362} y1={252} x2={362} y2={306} />
              {/* headboard + pillow */}
              <line x1={128} y1={252} x2={128} y2={210} />
              <rect x={136} y={226} width={54} height={22} rx={8} />
            </g>
          </svg>
        </div>
      );
  }
};

const VignetteBeat: React.FC<{ v: VignetteLabel }> = ({ v }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, 50, 66], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        opacity,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 120px",
      }}
    >
      {/* The same small scene on both sides of the page; the right copy is
          mirrored, per script.md's nearly identical families. */}
      <div style={{ transform: "scale(0.9)" }}>
        <VignetteScene label={v} />
      </div>
      <div style={{ transform: "scale(-0.9, 0.9)" }}>
        <VignetteScene label={v} />
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
          <Sequence key={v} from={i * 34} durationInFrames={34}>
            <VignetteBeat v={v} />
          </Sequence>
        ))}
      </Sequence>
    </AbsoluteFill>
  );
};
