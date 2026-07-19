import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Still } from "../components/Still";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S5War")!;

// W01-W11, in script.md's exact War-beat order:
// boots marching / two frightened soldiers / artillery flashes / child
// hiding / bridge collapsing / hospital corridor / burning schoolbook /
// soldier with photograph / the same photograph, opposite side / empty
// chairs / medals on empty uniforms. W12 (rows of crosses) is the held
// closer, handled separately below.
const WAR_SHOTS = ["W01", "W02", "W03", "W04", "W05", "W06", "W07", "W08", "W09", "W10", "W11"];

// Shots that read as destruction/loss beats get the low-opacity red glow
// overlay -- composited in Remotion via Still's `destructionGlow`, never
// baked into the source stills (plan.md Phase D red-compositing rule).
const DESTRUCTION_GLOW_SHOTS = new Set(["W03", "W05", "W07", "W11"]);

const MONTAGE_FRAMES = 720; // local frames 0-720: the ramping W01-W11 montage
const HOLD_FRAMES = timing.durationInFrames - MONTAGE_FRAMES; // 240: the W12 hold

type Cut = { shotId: string; from: number; duration: number };

/**
 * Builds the accelerating cut schedule for the montage half of the scene:
 * hard cuts only, ramping from ~2 cuts/second (15 frames @30fps) at the
 * start to ~4 cuts/second (7 frames) by the end, cycling through the
 * eleven W-shots in script order. Computed once at module scope so the
 * schedule is deterministic across renders.
 */
function buildSchedule(): Cut[] {
  const cuts: Cut[] = [];
  let cursor = 0;
  let i = 0;
  while (cursor < MONTAGE_FRAMES) {
    const t = cursor / MONTAGE_FRAMES;
    const duration = Math.max(7, Math.round(15 - t * 8));
    const remaining = MONTAGE_FRAMES - cursor;
    const clamped = Math.min(duration, remaining);
    if (clamped <= 0) break;
    cuts.push({ shotId: WAR_SHOTS[i % WAR_SHOTS.length], from: cursor, duration: clamped });
    cursor += clamped;
    i += 1;
  }
  return cuts;
}

const SCHEDULE = buildSchedule();

/**
 * 1:28-2:00 (frames 2640-3600, 960 local frames). The War montage: hard
 * cuts only (no crossfades) through W01-W11 at an accelerating 2-4
 * cuts/second rate for the first 24s (local frames 0-720), each still
 * with a subtle 1-2% scale drift so nothing reads as frozen. Narration
 * (VO-05) ends by 1:52 -- local frame 720 -- after which the final 8
 * seconds (local frames 720-960) hold W12 (the crosses) in silence: no
 * narration, only music/wind (silent placeholders in this no-spend
 * phase; VO/SFX land in Phase E).
 */
export const S5War: React.FC = () => {
  return (
    <AbsoluteFill>
      {SCHEDULE.map((cut, i) => (
        <Sequence key={i} from={cut.from} durationInFrames={cut.duration}>
          <Still shotId={cut.shotId} drift destructionGlow={DESTRUCTION_GLOW_SHOTS.has(cut.shotId)} />
        </Sequence>
      ))}

      <Sequence from={MONTAGE_FRAMES} durationInFrames={HOLD_FRAMES} name="W12 hold (silent)">
        <Still shotId="W12" drift />
      </Sequence>
    </AbsoluteFill>
  );
};
