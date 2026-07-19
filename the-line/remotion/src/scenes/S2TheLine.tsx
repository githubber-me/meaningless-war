import React from "react";
import { SceneStub } from "./SceneStub";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S2TheLine")!;

/**
 * 0:20-0:40 (frames 600-1200). A hand with a red pencil draws the
 * dividing line and writes "US" / "THEM"; flags rise above both houses.
 * Phase A stub only -- see plan.md Phase D for the real implementation
 * (RedLine strokeDashoffset draw-on, Hand leading the tip).
 */
export const S2TheLine: React.FC = () => <SceneStub timing={timing} />;
