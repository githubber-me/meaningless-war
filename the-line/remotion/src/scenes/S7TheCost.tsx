import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { RedLine } from "../components/RedLine";
import { Still } from "../components/Still";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S7TheCost")!;

const PULLBACK_FRAMES = 300;
const REBUILD_FRAMES = timing.durationInFrames - PULLBACK_FRAMES;

// A tiny house glyph used at map scale (much smaller than S1's House).
const MapHouse: React.FC<{ x: number }> = ({ x }) => (
  <g transform={`translate(${x} 560)`} fill="none" stroke="#1A1A1A" strokeWidth={4} strokeLinejoin="round">
    <polyline points="-20,20 0,0 20,20" />
    <rect x={-18} y={20} width={36} height={26} />
  </g>
);

/**
 * The map pullback: the page zooms out from the drawn border to reveal
 * more of the surrounding page (a stand-in "map"), while the border
 * itself shifts only a few pixels -- "the line moved a few centimetres"
 * (script.md), made literal rather than a large redraw.
 */
const MapPullback: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const zoomOut = interpolate(frame, [0, PULLBACK_FRAMES], [1.35, 0.62], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  // The border has moved "only slightly" -- a handful of pixels, not a
  // dramatic redraw.
  const lineShift = interpolate(frame, [0, PULLBACK_FRAMES], [0, 14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [PULLBACK_FRAMES - 40, PULLBACK_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineX = width / 2 + lineShift;
  const lineY1 = height * 0.2;
  const lineY2 = height * 0.85;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoomOut})`,
          transformOrigin: "center",
        }}
      >
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <RedLine id="s7" x={lineX} y1={lineY1} y2={lineY2} strokeWidth={6} />
          <MapHouse x={lineX - 260} />
          <MapHouse x={lineX + 260} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/**
 * 2:22-2:42 (frames 4260-4860, 600 local frames). Pull back to reveal the
 * map -- the red border has moved only slightly -- then the ruins fade
 * into scaffolding as survivors rebuild the same houses, bridge and
 * school (H09).
 */
export const S7TheCost: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence  durationInFrames={PULLBACK_FRAMES}>
        <MapPullback />
      </Sequence>

      <Sequence from={PULLBACK_FRAMES} durationInFrames={REBUILD_FRAMES}>
        <RebuildFade />
      </Sequence>
    </AbsoluteFill>
  );
};

// A short cross-dissolve into the rebuild still (this scene, unlike S5, has
// no "hard cuts only" constraint in script.md).
const RebuildFade: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity }}>
      <Still shotId="H09" drift />
    </AbsoluteFill>
  );
};
