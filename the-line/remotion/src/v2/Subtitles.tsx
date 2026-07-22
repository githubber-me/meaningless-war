import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FPS } from "./timing";

/**
 * Small, subtle burned-in subtitles -- understated captions, not
 * TV-subtitle-style bold white-on-black bars. Timestamps below are the
 * whisper-verified VO segment transcript (seconds, from v2-treatment.md's
 * companion transcript pass -- NOT re-run here), converted to frames at
 * FPS (30).
 */
const RAW_SEGMENTS: { from: number; to: number; text: string }[] = [
  { from: 0.0, to: 8.3, text: "Before the war, there were no heroes, no enemies, just people who woke too early, worked too long," },
  { from: 8.9, to: 16.0, text: "and tried to get home before dinner. On both sides, life was ordinary, and that was enough." },
  { from: 20.0, to: 30.6, text: "Then someone drew a line. No mountain stood there, no river, just a line and a story about the people beyond it." },
  { from: 40.0, to: 54.8, text: "The story was repeated until fear felt like knowledge. Questions became disloyalty, and the people across the line stopped being people. They became one word." },
  { from: 62.0, to: 64.1, text: "Fear became a speech." },
  { from: 65.1, to: 66.7, text: "The speech became an order." },
  { from: 67.9, to: 69.9, text: "The order became a uniform." },
  { from: 71.2, to: 75.3, text: "And frightened people were sent to kill other frightened people." },
  { from: 88.0, to: 92.0, text: "The line swallowed names and returned numbers." },
  { from: 93.3, to: 95.7, text: "Each death justified the next." },
  { from: 97.1, to: 99.9, text: "Soon, no one remembered how it began," },
  { from: 101.0, to: 103.8, text: "only that too many had died to stop." },
  { from: 120.0, to: 122.2, text: "Eventually, the leaders met." },
  { from: 123.3, to: 125.9, text: "They used words that had been available from the beginning." },
  { from: 127.3, to: 129.3, text: "Both sides announced victory." },
  { from: 130.6, to: 132.4, text: "The dead did not object." },
  { from: 142.0, to: 144.4, text: "The line moved a few centimetres." },
  { from: 145.6, to: 146.9, text: "Parents buried children." },
  { from: 148.0, to: 150.6, text: "Children inherited medals, debts," },
  { from: 151.2, to: 153.6, text: "and stories about people they had never met." },
  { from: 162.0, to: 168.1, text: "If peace was always how it would end, why could it not have been how it began?" },
];

const CROSSFADE = 8; // frames, gentle fade in/out per line

type FrameSegment = { fromF: number; toF: number; text: string };

const SEGMENTS: FrameSegment[] = RAW_SEGMENTS.map((s) => ({
  fromF: Math.round(s.from * FPS),
  toF: Math.round(s.to * FPS),
  text: s.text,
}));

/**
 * T1 (ENEMY, frames 1650-1860 / 55.0-62.0s) and T2 (VICTORY, frames
 * 3819-3912 / 127.3-130.4s) are silent type moments -- nothing should
 * caption over them. None of the transcript segments above land inside
 * T1's window, but "Both sides announced victory" (127.3-129.3s) DOES
 * fall entirely inside T2's window (127.3-130.4s) -- the VO for that
 * line plays under/around the VICTORY card rather than in silence, so
 * without an explicit mask that line would otherwise render on top of
 * the type moment. Hard-suppressed here per the "no subtitles over type
 * moments" rule, which takes priority over the segment data.
 */
const TYPE_MOMENT_RANGES: [number, number][] = [
  [1650, 1860], // T1
  [3819, 3912], // T2
];

function inTypeMoment(frame: number): boolean {
  return TYPE_MOMENT_RANGES.some(([a, b]) => frame >= a && frame < b);
}

const SubtitleLine: React.FC<{ seg: FrameSegment; frame: number }> = ({ seg, frame }) => {
  const opacity = interpolate(
    frame,
    [seg.fromF - CROSSFADE, seg.fromF, seg.toF, seg.toF + CROSSFADE],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  if (opacity <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 88,
        transform: "translateX(-50%)",
        maxWidth: "72%",
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(8,8,8,0.32)",
          borderRadius: 6,
          padding: "8px 18px",
          textAlign: "center",
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontWeight: 400,
          fontSize: 30,
          lineHeight: 1.35,
          letterSpacing: "0.01em",
          color: "rgba(246,243,236,0.92)",
          textShadow: "0 1px 3px rgba(0,0,0,0.55)",
        }}
      >
        {seg.text}
      </div>
    </div>
  );
};

/**
 * Top-level overlay across the whole timeline -- mounted once in
 * TheLineV2.tsx above every beat, using the GLOBAL frame (not a nested
 * Sequence's local frame) since the timestamps are already absolute
 * film-time.
 */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  if (inTypeMoment(frame)) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {SEGMENTS.map((seg) => {
        if (frame < seg.fromF - CROSSFADE || frame > seg.toF + CROSSFADE) return null;
        return <SubtitleLine key={seg.fromF} seg={seg} frame={frame} />;
      })}
    </AbsoluteFill>
  );
};
