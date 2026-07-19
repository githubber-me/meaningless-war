import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { TheLine } from "./TheLine";
import { FPS, TOTAL_DURATION_IN_FRAMES } from "./scenes/timing";

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
    </>
  );
};
