import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Paper } from "./components/Paper";
import { AudioBed } from "./components/AudioBed";
import { SCENE_TIMINGS } from "./scenes/timing";
import { S1Before } from "./scenes/S1Before";
import { S2TheLine } from "./scenes/S2TheLine";
import { S3StorySpreads } from "./scenes/S3StorySpreads";
import { S4Machinery } from "./scenes/S4Machinery";
import { S5War } from "./scenes/S5War";
import { S6Victory } from "./scenes/S6Victory";
import { S7TheCost } from "./scenes/S7TheCost";
import { S8Ending } from "./scenes/S8Ending";

const SCENE_COMPONENTS = {
  S1Before,
  S2TheLine,
  S3StorySpreads,
  S4Machinery,
  S5War,
  S6Victory,
  S7TheCost,
  S8Ending,
} as const;

/**
 * TheLine is the single top-level Composition component (plan.md Phase A
 * step 4: "Wire it all into Root.tsx as a single Composition"). It places
 * each of the eight scenes into a <Sequence> at the frame offsets defined
 * in scenes/timing.ts, which is itself derived from script.md's timing
 * map. Swapping a scene stub for its real Phase D implementation never
 * requires touching this file.
 */
export const TheLine: React.FC = () => {
  return (
    <AbsoluteFill>
      <Paper />
      <AudioBed />
      {SCENE_TIMINGS.map((timing) => {
        const SceneComponent = SCENE_COMPONENTS[timing.id];
        return (
          <Sequence
            key={timing.id}
            from={timing.from}
            durationInFrames={timing.durationInFrames}
            name={`${timing.id} - ${timing.title}`}
          >
            <SceneComponent />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
