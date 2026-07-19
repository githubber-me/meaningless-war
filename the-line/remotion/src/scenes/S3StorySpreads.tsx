import React from "react";
import { SceneStub } from "./SceneStub";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S3StorySpreads")!;

/**
 * 0:40-1:02 (frames 1200-1860). Radios, newspapers, leaders pointing;
 * accelerating propaganda cards; ends on the full-screen "ENEMY" card.
 * The narrator never says the word -- the card does (script.md rule 3).
 * Phase A stub only -- see plan.md Phase D for the real implementation.
 */
export const S3StorySpreads: React.FC = () => <SceneStub timing={timing} />;
