import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { TheLine } from "./TheLine";
import { FPS, TOTAL_DURATION_IN_FRAMES } from "./scenes/timing";
import { TheLineV2 } from "./v2/TheLineV2";
import { TOTAL_DURATION_IN_FRAMES as V2_TOTAL_DURATION_IN_FRAMES, FPS as V2_FPS } from "./v2/timing";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TheLine"
        component={TheLine}
        durationInFrames={TOTAL_DURATION_IN_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="TheLineV2"
        component={TheLineV2}
        durationInFrames={V2_TOTAL_DURATION_IN_FRAMES}
        fps={V2_FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
