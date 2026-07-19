import React from "react";

/**
 * Uniform stroke weight for every stick figure in the film. Every
 * StickFigure draws with this value so line weight never drifts between
 * scenes -- per plan.md Phase A step 2.
 */
export const STICK_FIGURE_STROKE_WIDTH = 4;

export type StickFigurePose =
  | "standing"
  | "walking"
  | "waving"
  | "sitting"
  | "cowering"
  | "marching"
  | "embracing"
  | "pointing";

export type StickFigureProps = {
  /** Pose determines the limb geometry. */
  pose?: StickFigurePose;
  /** Overall height in px; the figure scales uniformly from this. */
  size?: number;
  /** Ink color. Must never be the locked red constant -- figures are always black. */
  color?: string;
  /** Optional uniform scale/flip, e.g. -1 to face the opposite direction. */
  facing?: 1 | -1;
  /** Extra props spread onto the wrapping <svg>, e.g. for positioning. */
  style?: React.CSSProperties;
  className?: string;
};

const HEAD_RADIUS_RATIO = 0.12;

/**
 * StickFigure is the single source of truth for every human figure drawn
 * in the film. It is a parameterized SVG so every figure -- family
 * members, soldiers, leaders, children -- shares identical line weight
 * and proportions regardless of which scene renders it.
 */
export const StickFigure: React.FC<StickFigureProps> = ({
  pose = "standing",
  size = 200,
  color = "#1A1A1A",
  facing = 1,
  style,
  className,
}) => {
  const w = size * 0.6;
  const h = size;
  const headR = size * HEAD_RADIUS_RATIO;
  const headCx = w / 2;
  const headCy = headR + STICK_FIGURE_STROKE_WIDTH;
  const neckY = headCy + headR;
  const hipY = neckY + size * 0.32;
  const footY = h - STICK_FIGURE_STROKE_WIDTH;

  const limbs = getLimbPaths(pose, { w, neckY, hipY, footY, headCy });

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ transform: `scaleX(${facing})`, ...style }}
      className={className}
    >
      <g
        fill="none"
        stroke={color}
        strokeWidth={STICK_FIGURE_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={headCx} cy={headCy} r={headR} />
        <line x1={headCx} y1={neckY} x2={headCx} y2={hipY} />
        {limbs.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
};

function getLimbPaths(
  pose: StickFigurePose,
  m: { w: number; neckY: number; hipY: number; footY: number; headCy: number }
): string[] {
  const { w, neckY, hipY, footY } = m;
  const cx = w / 2;
  const armY = neckY + (hipY - neckY) * 0.3;

  switch (pose) {
    case "waving":
      return [
        `M ${cx} ${armY} L ${cx - w * 0.35} ${armY + 20}`,
        `M ${cx} ${armY} L ${cx + w * 0.3} ${armY - 30}`,
        `M ${cx} ${hipY} L ${cx - w * 0.25} ${footY}`,
        `M ${cx} ${hipY} L ${cx + w * 0.25} ${footY}`,
      ];
    case "walking":
      return [
        `M ${cx} ${armY} L ${cx - w * 0.3} ${armY + 30}`,
        `M ${cx} ${armY} L ${cx + w * 0.3} ${armY - 10}`,
        `M ${cx} ${hipY} L ${cx - w * 0.3} ${footY}`,
        `M ${cx} ${hipY} L ${cx + w * 0.3} ${footY - 20}`,
      ];
    case "marching":
      return [
        `M ${cx} ${armY} L ${cx - w * 0.3} ${armY - 25}`,
        `M ${cx} ${armY} L ${cx + w * 0.3} ${armY + 25}`,
        `M ${cx} ${hipY} L ${cx - w * 0.3} ${footY - 25}`,
        `M ${cx} ${hipY} L ${cx + w * 0.3} ${footY}`,
      ];
    case "sitting":
      return [
        `M ${cx} ${armY} L ${cx - w * 0.3} ${armY + 25}`,
        `M ${cx} ${armY} L ${cx + w * 0.3} ${armY + 25}`,
        `M ${cx} ${hipY} L ${cx - w * 0.35} ${hipY}`,
        `M ${cx - w * 0.35} ${hipY} L ${cx - w * 0.35} ${footY}`,
        `M ${cx} ${hipY} L ${cx + w * 0.35} ${hipY}`,
        `M ${cx + w * 0.35} ${hipY} L ${cx + w * 0.35} ${footY}`,
      ];
    case "cowering":
      return [
        `M ${cx} ${armY} L ${cx - w * 0.2} ${m.headCy}`,
        `M ${cx} ${armY} L ${cx + w * 0.2} ${m.headCy}`,
        `M ${cx} ${hipY} L ${cx - w * 0.2} ${footY - 30}`,
        `M ${cx} ${hipY} L ${cx + w * 0.2} ${footY - 30}`,
      ];
    case "embracing":
      return [
        `M ${cx} ${armY} L ${cx - w * 0.45} ${armY + 10}`,
        `M ${cx} ${armY} L ${cx - w * 0.1} ${armY + 5}`,
        `M ${cx} ${hipY} L ${cx - w * 0.25} ${footY}`,
        `M ${cx} ${hipY} L ${cx + w * 0.25} ${footY}`,
      ];
    case "pointing":
      return [
        `M ${cx} ${armY} L ${cx + w * 0.5} ${armY - 5}`,
        `M ${cx} ${armY} L ${cx - w * 0.25} ${armY + 25}`,
        `M ${cx} ${hipY} L ${cx - w * 0.25} ${footY}`,
        `M ${cx} ${hipY} L ${cx + w * 0.25} ${footY}`,
      ];
    case "standing":
    default:
      return [
        `M ${cx} ${armY} L ${cx - w * 0.3} ${armY + 25}`,
        `M ${cx} ${armY} L ${cx + w * 0.3} ${armY + 25}`,
        `M ${cx} ${hipY} L ${cx - w * 0.25} ${footY}`,
        `M ${cx} ${hipY} L ${cx + w * 0.25} ${footY}`,
      ];
  }
}
