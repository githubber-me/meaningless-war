import React from "react";
import { SceneStub } from "./SceneStub";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S4Machinery")!;

/**
 * 1:02-1:28 (frames 1860-2640). Coins fall into a machine and emerge as
 * bullets/helmets/tanks; teachers replace faces with flags; young figures
 * receive uniforms; trains carry soldiers away.
 * Phase A stub only -- see plan.md Phase D for the real implementation.
 */
export const S4Machinery: React.FC = () => <SceneStub timing={timing} />;
