import React from "react";
import { SceneStub } from "./SceneStub";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S7TheCost")!;

/**
 * 2:22-2:42 (frames 4260-4860). Pull back to reveal the map; the red
 * border has moved only slightly; ruins fade into scaffolding as
 * survivors rebuild the same houses, bridge and school.
 * Phase A stub only -- see plan.md Phase D for the real implementation.
 */
export const S7TheCost: React.FC = () => <SceneStub timing={timing} />;
