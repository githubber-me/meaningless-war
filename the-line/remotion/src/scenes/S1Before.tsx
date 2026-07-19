import React from "react";
import { SceneStub } from "./SceneStub";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S1Before")!;

/**
 * 0:00-0:20 (frames 0-600). Blank page; a family appears, then a near
 * -identical family across the page; quick glimpses of ordinary life.
 * Phase A stub only -- see plan.md Phase D for the real implementation.
 */
export const S1Before: React.FC = () => <SceneStub timing={timing} />;
