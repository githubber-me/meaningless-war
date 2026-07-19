/**
 * Single source of truth for scene frame ranges, derived from script.md's
 * "Timing map (for edit reference)" table at 30fps. Root.tsx wires each
 * scene into a <Sequence> using these values; nothing should hard-code a
 * frame number outside this file.
 *
 * script.md block -> seconds -> frames (seconds * 30):
 *   1  Before             0:00 - 0:20    0    -  600
 *   2  The line           0:20 - 0:40    600  - 1200
 *   3  The story spreads  0:40 - 1:02    1200 - 1860
 *   4  The machinery      1:02 - 1:28    1860 - 2640
 *   5  War                1:28 - 2:00    2640 - 3600
 *   6  Victory            2:00 - 2:22    3600 - 4260
 *   7  The cost           2:22 - 2:42    4260 - 4860
 *   8  Ending             2:42 - 3:00    4860 - 5400
 */

export const FPS = 30;
export const TOTAL_DURATION_IN_FRAMES = 5400; // 3:00 exactly at 30fps

export type SceneId =
  | "S1Before"
  | "S2TheLine"
  | "S3StorySpreads"
  | "S4Machinery"
  | "S5War"
  | "S6Victory"
  | "S7TheCost"
  | "S8Ending";

export type SceneTiming = {
  id: SceneId;
  title: string;
  voFile: string;
  from: number;
  durationInFrames: number;
};

export const SCENE_TIMINGS: SceneTiming[] = [
  { id: "S1Before", title: "Before", voFile: "VO-01", from: 0, durationInFrames: 600 },
  { id: "S2TheLine", title: "The line", voFile: "VO-02", from: 600, durationInFrames: 600 },
  { id: "S3StorySpreads", title: "The story spreads", voFile: "VO-03", from: 1200, durationInFrames: 660 },
  { id: "S4Machinery", title: "The machinery", voFile: "VO-04", from: 1860, durationInFrames: 780 },
  { id: "S5War", title: "War", voFile: "VO-05", from: 2640, durationInFrames: 960 },
  { id: "S6Victory", title: "Victory", voFile: "VO-06", from: 3600, durationInFrames: 660 },
  { id: "S7TheCost", title: "The cost", voFile: "VO-07", from: 4260, durationInFrames: 600 },
  { id: "S8Ending", title: "Ending", voFile: "VO-08", from: 4860, durationInFrames: 540 },
];

// Sanity check evaluated at module load: the scenes must tile the full
// 5400-frame runtime with no gaps or overlaps.
(() => {
  let cursor = 0;
  for (const scene of SCENE_TIMINGS) {
    if (scene.from !== cursor) {
      throw new Error(
        `Scene timing gap/overlap: ${scene.id} starts at ${scene.from}, expected ${cursor}`
      );
    }
    cursor += scene.durationInFrames;
  }
  if (cursor !== TOTAL_DURATION_IN_FRAMES) {
    throw new Error(
      `Scene timings sum to ${cursor} frames, expected ${TOTAL_DURATION_IN_FRAMES}`
    );
  }
})();
