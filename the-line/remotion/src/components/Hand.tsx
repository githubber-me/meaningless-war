import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { RED } from "./RedLine";

export type HandProps = {
  /** Frame (relative to the enclosing Sequence) at which the entry spring starts. */
  entryFrame?: number;
  /** Where the hand settles, as a fraction of the composition width/height (0-1). */
  targetX: number;
  targetY: number;
  /** Which direction the hand enters from off-screen. */
  from?: "top" | "left" | "right";
  /** Pencil tip color: black graphite by default, or the locked RED for S8's hesitating hand. */
  pencilColor?: "black" | "red";
  /** Overall scale of the hand+pencil rig. */
  scale?: number;
  /**
   * Optional 0->1 override that replaces the internal spring. When set,
   * the hand's position is driven directly by this value instead of
   * settling once -- used by S2 so the hand can continuously lead the
   * pencil tip along the line as it draws, rather than springing to a
   * single fixed point and stopping.
   */
  progress?: number;
};

/**
 * Hand renders a layered SVG hand holding a pencil, eased in with a spring
 * on entry (per plan.md Phase A step 2). Used for S2 (drawing the line, in
 * black) and S8 (the hesitating hand, in red, that must never touch the
 * page -- script.md rule 4).
 */
export const Hand: React.FC<HandProps> = ({
  entryFrame = 0,
  targetX,
  targetY,
  from = "top",
  pencilColor = "black",
  scale = 1,
  progress: progressOverride,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const springProgress = spring({
    frame: frame - entryFrame,
    fps,
    config: { damping: 200, mass: 0.8, stiffness: 120 },
  });
  const progress = progressOverride ?? springProgress;

  const offscreen = {
    top: { x: targetX, y: -0.3 },
    left: { x: -0.3, y: targetY },
    right: { x: 1.3, y: targetY },
  }[from];

  const x = interpolate(progress, [0, 1], [offscreen.x * width, targetX * width]);
  const y = interpolate(progress, [0, 1], [offscreen.y * height, targetY * height]);

  const tipColor = pencilColor === "red" ? RED : "#1A1A1A";

  return (
    <svg
      width={260 * scale}
      height={260 * scale}
      viewBox="0 0 260 260"
      style={{
        position: "absolute",
        left: x,
        top: y,
        overflow: "visible",
      }}
    >
      {/* Pencil, layered behind the hand, tip pointing down-left toward the page. */}
      <g transform="rotate(-35 170 90)">
        <rect x="60" y="70" width="160" height="18" rx="4" fill="#E8D9A0" stroke="#1A1A1A" strokeWidth={4} />
        <polygon points="40,70 40,88 12,79" fill="#F3EEE4" stroke="#1A1A1A" strokeWidth={4} strokeLinejoin="round" />
        <polygon points="12,79 22,75 22,83" fill={tipColor} stroke={tipColor} strokeWidth={2} />
      </g>

      {/* Hand + forearm, layered in front of the pencil shaft. */}
      <g fill="none" stroke="#1A1A1A" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M 130 240 L 150 150" />
        <path d="M 150 150 C 150 120 170 110 185 118 C 195 105 215 108 218 122 C 232 118 244 130 236 145 C 246 150 246 168 232 172 L 150 175 Z" fill="#F3EEE4" />
      </g>
    </svg>
  );
};
