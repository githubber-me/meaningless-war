import React from "react";
import { SceneStub } from "./SceneStub";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S5War")!;

/**
 * 1:28-2:00 (frames 2640-3600). Rapid stills ramping 2-4/s, hard cuts
 * only. Narration ends by 1:52 (frame 3360 relative to comp, i.e. local
 * frame 720); the final 8 seconds (local frames 720-960) hold the crosses
 * frame in silence -- script.md rule and the S5 audio note in plan.md.
 * Phase A stub only -- see plan.md Phase D for the real implementation.
 */
export const S5War: React.FC = () => <SceneStub timing={timing} />;
