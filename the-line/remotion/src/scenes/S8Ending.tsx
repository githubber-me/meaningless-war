import React from "react";
import { SceneStub } from "./SceneStub";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S8Ending")!;

/**
 * 2:42-3:00 (frames 4860-5400). Children erase the red line and draw a
 * tree in its place; a new hand with a red pencil enters and hesitates;
 * hard cut to white precedes any contact (script.md rule 4 -- the pencil
 * never touches). Final card holds a full 3 seconds (90 frames), then
 * fades to white.
 * Phase A stub only -- see plan.md Phase D for the real implementation.
 */
export const S8Ending: React.FC = () => <SceneStub timing={timing} />;
