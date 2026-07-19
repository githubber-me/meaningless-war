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
  /**
   * Unique id for this line's internal SVG mask. Required whenever more
   * than one RedLine could be present in the DOM at once (defaults are
   * fine for the common single-line case), so masks never collide.
   */
  id?: string;
};

/**
 * RedLine renders the single vertical dividing line that splits the page
 * into "US" and "THEM". It is deliberately the only component in the
 * codebase allowed to paint the locked red hex by default.
 *
 * Draw-on (S2) is implemented as an SVG `<path>` with `pathLength=1` so
 * `strokeDasharray`/`strokeDashoffset` can be driven directly by frame --
 * the classic "line draws itself" technique -- rather than by trimming
 * coordinates. Erasing (S8) is implemented as a literal SVG `<mask>`: a
 * white "keep" rect covering the full line, painted over by a black
 * "erased" rect that grows upward from the bottom as `erase` increases.
 * Must be rendered inside an enclosing `<svg>`.
 */
export const RedLine: React.FC<RedLineProps> = ({
  x,
  y1,
  y2,
  strokeWidth = 6,
  startFrame = 0,
  drawDurationInFrames = 0,
  erase = 0,
  id = "redline",
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

  if (drawProgress <= 0) {
    return null;
  }

  const eraseProgress = Math.min(Math.max(erase, 0), 1);
  const eraseHeight = totalLength * eraseProgress;
  const maskId = `redline-mask-${id}`;

  return (
    <>
      <mask id={maskId}>
        <rect x={x - strokeWidth} y={y1} width={strokeWidth * 2} height={totalLength} fill="white" />
        {eraseHeight > 0 ? (
          <rect
            x={x - strokeWidth}
            y={y2 - eraseHeight}
            width={strokeWidth * 2}
            height={eraseHeight}
            fill="black"
          />
        ) : null}
      </mask>
      <path
        d={`M ${x} ${y1} L ${x} ${y2}`}
        fill="none"
        stroke={RED}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - drawProgress}
        mask={`url(#${maskId})`}
      />
    </>
  );
};
