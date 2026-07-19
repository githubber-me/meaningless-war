import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

/**
 * The only source of red in the entire film (script.md rule 1).
 * Every red element -- the dividing line, propaganda accents, the
 * destruction glow, and the final pencil -- must import this constant
 * instead of hard-coding a color. This enforces the single-hex rule in
 * code rather than by convention.
 */
export const RED = "#C0392B";

type RedLineProps = {
  /** x position (in px, within the composition's coordinate space) of the vertical line. */
  x: number;
  /** y where the line starts. */
  y1: number;
  /** y where the line ends. */
  y2: number;
  /** stroke width in px. */
  strokeWidth?: number;
  /** frame (relative to the scene) at which the draw-on animation should start. */
  startFrame?: number;
  /** how many frames the draw-on animation should take. Set to 0 to render fully drawn instantly. */
  drawDurationInFrames?: number;
  /**
   * 0 -> 1, how erased the line is (used by S8 Ending, where children erase
   * the line). 0 = fully drawn, 1 = fully erased. Erasing proceeds from the
   * bottom of the line upward, mirroring an eraser working up the page.
   */
  erase?: number;
};

/**
 * RedLine renders the single vertical dividing line that splits the page
 * into "US" and "THEM". It is deliberately the only component in the
 * codebase allowed to paint the locked red hex by default.
 */
export const RedLine: React.FC<RedLineProps> = ({
  x,
  y1,
  y2,
  strokeWidth = 6,
  startFrame = 0,
  drawDurationInFrames = 0,
  erase = 0,
}) => {
  const frame = useCurrentFrame();
  const totalLength = y2 - y1;

  const drawProgress =
    drawDurationInFrames > 0
      ? interpolate(frame, [startFrame, startFrame + drawDurationInFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.ease),
        })
      : 1;

  const drawnLength = totalLength * drawProgress;
  const eraseLength = totalLength * Math.min(Math.max(erase, 0), 1);

  const visibleTop = y1;
  const visibleBottom = y1 + Math.max(drawnLength - eraseLength, 0);

  if (visibleBottom <= visibleTop) {
    return null;
  }

  return (
    <line
      x1={x}
      y1={visibleTop}
      x2={x}
      y2={visibleBottom}
      stroke={RED}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  );
};
