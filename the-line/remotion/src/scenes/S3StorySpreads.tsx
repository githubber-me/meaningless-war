import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { StickFigure } from "../components/StickFigure";
import { PropagandaCard } from "../components/PropagandaCard";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S3StorySpreads")!;

// The four propaganda beats from script.md, cycled at an accelerating
// rhythm (each pass through the list gets faster than the last).
const MESSAGES = ["THEY WANT WHAT IS OURS", "THEY CANNOT BE TRUSTED", "WE MUST STRIKE FIRST", "WE HAVE NO CHOICE"];

const CARDS_START = 150;
const CARDS_END = 600; // fullscreen ENEMY card takes over at 600
const ENEMY_START = 600;

type CardBeat = { text: string; from: number; duration: number };

// Build the accelerating card schedule once, at module scope, so it is
// deterministic across renders: duration per card shrinks from 55 frames
// down to a floor of 14 frames as the sequence progresses.
function buildSchedule(): CardBeat[] {
  const beats: CardBeat[] = [];
  let cursor = CARDS_START;
  let i = 0;
  while (cursor < CARDS_END) {
    const duration = Math.max(14, 55 - i * 4);
    const remaining = CARDS_END - cursor;
    beats.push({ text: MESSAGES[i % MESSAGES.length], from: cursor, duration: Math.min(duration, remaining) });
    cursor += duration;
    i += 1;
  }
  return beats;
}

const SCHEDULE = buildSchedule();

/**
 * A single propaganda beat, shown as mirrored half-size copies on both
 * sides of the page simultaneously -- script.md's "reveal that both sides
 * are receiving the same messages," made literal.
 */
const MirroredCardBeat: React.FC<{ text: string; seed: string }> = ({ text, seed }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", transform: "scale(0.62)", transformOrigin: "center" }}>
      <PropagandaCard text={text} seed={`${seed}-l`} />
    </div>
    <div style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", transform: "scale(0.62)", transformOrigin: "center" }}>
      <PropagandaCard text={text} seed={`${seed}-r`} />
    </div>
  </AbsoluteFill>
);

const RadiosAndLeaders: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30, 120, 150], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 320 }}>
        <StickFigure pose="pointing" size={240} facing={1} />
        <StickFigure pose="pointing" size={240} facing={-1} />
      </div>
      <div style={{ position: "absolute", bottom: 90, display: "flex", width: "100%", justifyContent: "space-around" }}>
        {/* radios / podiums: simple black-ink rectangles with an antenna line */}
        {[0, 1].map((i) => (
          <svg key={i} width={120} height={100} viewBox="0 0 120 100">
            <g fill="none" stroke="#1A1A1A" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
              <rect x={20} y={40} width={80} height={50} />
              <line x1={60} y1={40} x2={80} y2={5} />
              <circle cx={80} cy={5} r={4} fill="#1A1A1A" />
            </g>
          </svg>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/**
 * 0:40-1:02 (frames 1200-1860, 660 local frames). Leaders and radios first,
 * then propaganda cards at an accelerating rhythm revealing both sides
 * receive the same messages, ending on the full-screen ENEMY card. The
 * narrator audio track (silent placeholder in this phase) never contains
 * the word "enemy" -- only the card says it (script.md rule 3).
 */
export const S3StorySpreads: React.FC = () => {
  return (
    <AbsoluteFill>
      <RadiosAndLeaders />

      {SCHEDULE.map((beat, i) => (
        <Sequence key={i} from={beat.from} durationInFrames={beat.duration}>
          <MirroredCardBeat text={beat.text} seed={`${beat.text}-${i}`} />
        </Sequence>
      ))}

      <Sequence from={ENEMY_START} durationInFrames={timing.durationInFrames - ENEMY_START}>
        <PropagandaCard text="ENEMY" variant="fullscreen" seed="enemy" />
      </Sequence>
    </AbsoluteFill>
  );
};
