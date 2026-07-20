/**
 * V2 ("The Red Thread") shot schedule -- derived directly from
 * the-line/v2-treatment.md's shot table (film-time -> seconds -> frames,
 * seconds * 30). Boundaries are chained (each beat's `from` is the exact
 * `duration` sum of everything before it) so the sanity check below can
 * guarantee zero gaps/overlaps across the full 5400-frame runtime, even
 * though a couple of the treatment's own start/end pairs have tiny
 * (<= 6 frame) internal rounding gaps (e.g. R10 ends 54.8s but T1 starts
 * 55.0s) -- chaining absorbs those into the neighboring shot's duration
 * rather than leaving a hole in picture.
 *
 * Audio (VO placement) is unaffected -- see AudioBedV2.tsx, which keeps
 * the v1 placements (VO-01@0 ... VO-08@4860) unchanged per spec.
 */

export const FPS = 30;
export const TOTAL_DURATION_IN_FRAMES = 5400; // 3:00 exactly at 30fps

export type CameraDir =
  | "push-in"
  | "push-in-slow"
  | "drift-left"
  | "drift-right"
  | "drift-up"
  | "drift-down"
  | "static-breathe";

export type RedKind =
  | "none" // R01-R04, R20: absent
  | "map-stroke" // R05
  | "valley-cut" // R06
  | "wire-thread" // R07
  | "broadcast-rings" // R08
  | "door-light" // R09
  | "poster-underline" // R10
  | "sash" // R11
  | "signature-order" // R12
  | "stitch-seam" // R13
  | "railway-track" // R14
  | "trench-scar" // R15
  | "tangled-thread" // R16
  | "trench-wire" // R17
  | "ember-beam" // R18
  | "flicker" // M1-M5
  | "horizon-line" // R19
  | "ink-stroke" // R21
  | "chair-rail" // R22
  | "ghost-line" // R23
  | "rivulet" // R24
  | "ribbon" // R25
  | "slack-rubble" // R26
  | "child-lift" // R27
  | "kite-string"; // R28

export type ImageBeat = {
  kind: "image";
  id: string;
  image: string; // public/v2/{image}.jpg
  from: number;
  duration: number;
  crossfadeIn: number; // frames of dissolve from the previous beat; 0 = hard cut
  camera: CameraDir;
  red: RedKind;
  note?: string;
};

export type TypeBeat = {
  kind: "type";
  id: "T1" | "T2" | "T3";
  from: number;
  duration: number;
  crossfadeIn: number;
};

export type WhiteBeat = {
  kind: "white";
  id: string;
  from: number;
  duration: number;
  crossfadeIn: number;
};

export type Beat = ImageBeat | TypeBeat | WhiteBeat;

const img = (
  id: string,
  duration: number,
  camera: CameraDir,
  red: RedKind,
  crossfadeIn = 10,
  note?: string
): Omit<ImageBeat, "from"> => ({
  kind: "image",
  id,
  image: id,
  duration,
  crossfadeIn,
  camera,
  red,
  note,
});

// Ordered beat list, WITHOUT `from` -- computed by chaining below so the
// tiling guarantee is structural rather than hand-maintained.
const BEATS_NO_FROM: Array<Omit<Beat, "from">> = [
  img("R01", 135, "drift-right", "none"),
  img("R02", 132, "push-in", "none"),
  img("R03", 108, "drift-left", "none"),
  img("R04", 225, "static-breathe", "none"),
  img("R05", 150, "push-in", "map-stroke"),
  img("R06", 168, "push-in", "valley-cut"),
  img("R07", 282, "drift-up", "wire-thread"),
  img("R08", 210, "static-breathe", "broadcast-rings"),
  img("R09", 105, "push-in", "door-light"),
  img("R10", 135, "push-in", "poster-underline"),
  { kind: "type", id: "T1", duration: 210, crossfadeIn: 10 },
  img("R11", 93, "drift-left", "sash"),
  img("R12", 84, "push-in", "signature-order"),
  img("R13", 99, "push-in", "stitch-seam"),
  img("R14", 504, "push-in-slow", "railway-track", 10, "long hold, 71.2-88.0s"),
  img("R15", 120, "drift-down", "trench-scar"),
  img("R16", 111, "push-in", "tangled-thread"),
  img("R17", 126, "drift-right", "trench-wire"),
  img("R18", 123, "push-in", "ember-beam"),
  img("M1", 48, "static-breathe", "flicker", 10, "montage: crossfade in from R18"),
  img("M2", 48, "static-breathe", "flicker", 0, "montage: hard cut"),
  img("M3", 48, "static-breathe", "flicker", 0, "montage: hard cut"),
  img("M4", 48, "static-breathe", "flicker", 0, "montage: hard cut"),
  img("M5", 48, "static-breathe", "flicker", 0, "montage: hard cut"),
  img("R19", 240, "static-breathe", "horizon-line", 10, "8s silence hold, 112-120s"),
  img("R20", 99, "drift-right", "none", 10, "absent, drained"),
  img("R21", 120, "push-in", "ink-stroke"),
  { kind: "type", id: "T2", duration: 93, crossfadeIn: 10 },
  img("R22", 348, "push-in-slow", "chair-rail", 10, "long hold, 130.4-142.0s"),
  img("R23", 108, "push-in", "ghost-line"),
  img("R24", 72, "drift-up", "rivulet"),
  img("R25", 168, "push-in", "ribbon"),
  img("R26", 252, "drift-right", "slack-rubble"),
  img("R27", 183, "push-in", "child-lift"),
  img("R28", 132, "drift-up", "kite-string"),
  { kind: "white", id: "white-cut", duration: 75, crossfadeIn: 0 },
  { kind: "type", id: "T3", duration: 150, crossfadeIn: 0 },
];

function buildBeats(): Beat[] {
  let cursor = 0;
  const beats: Beat[] = BEATS_NO_FROM.map((b) => {
    const beat = { ...b, from: cursor } as Beat;
    cursor += b.duration;
    return beat;
  });
  if (cursor !== TOTAL_DURATION_IN_FRAMES) {
    throw new Error(`v2 beats sum to ${cursor} frames, expected ${TOTAL_DURATION_IN_FRAMES}`);
  }
  return beats;
}

export const BEATS: Beat[] = buildBeats();

// Sanity check (mirrors src/scenes/timing.ts's pattern): beats must tile
// 0 -> 5400 with no gaps or overlaps.
(() => {
  let cursor = 0;
  for (const beat of BEATS) {
    if (beat.from !== cursor) {
      throw new Error(`v2 beat timing gap/overlap: ${beat.id} starts at ${beat.from}, expected ${cursor}`);
    }
    cursor += beat.duration;
  }
  if (cursor !== TOTAL_DURATION_IN_FRAMES) {
    throw new Error(`v2 beats sum to ${cursor} frames, expected ${TOTAL_DURATION_IN_FRAMES}`);
  }
})();

export const beatById = (id: string): Beat => {
  const found = BEATS.find((b) => b.id === id);
  if (!found) throw new Error(`No v2 beat with id ${id}`);
  return found;
};
