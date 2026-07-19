import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { SceneTiming } from "./timing";

/**
 * Placeholder content shared by every Phase A scene stub: a gray box plus
 * the scene's label, id, and frame range, so the gray-boxed animatic makes
 * it obvious at a glance which scene is on screen and whether the cut
 * points land where script.md's timing map says they should. Phase D
 * replaces each stub's body with the real scene implementation; the
 * <Sequence> wiring in Root.tsx does not change.
 */
export const SceneStub: React.FC<{ timing: SceneTiming }> = ({ timing }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#8C8C8C",
        border: "4px solid #4A4A4A",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        color: "#1A1A1A",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, fontWeight: 700 }}>
          {timing.id} — {timing.title}
        </div>
        <div style={{ fontSize: 28, marginTop: 16 }}>
          frames {timing.from}–{timing.from + timing.durationInFrames} ({timing.voFile})
        </div>
        <div style={{ fontSize: 22, marginTop: 8, opacity: 0.7 }}>
          scene-local frame {frame} / {timing.durationInFrames}
        </div>
      </div>
    </AbsoluteFill>
  );
};
