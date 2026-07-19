import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { RedLine } from "../components/RedLine";
import { Still } from "../components/Still";
import { SCENE_TIMINGS } from "./timing";

const timing = SCENE_TIMINGS.find((s) => s.id === "S7TheCost")!;

// Narration-locked boundaries. VO-07's sentences land at these film times
// (whisper-aligned); the scene starts at 142.0s, so local = (t - 142) * 30:
//   142.0-144.4s "The line moved a few centimetres."  -> map + border shift
//   145.6-146.9s "Parents buried children."           -> local ~105-165: a
//                quiet echo of the rows-of-crosses image (W12) breathes
//                over the map, then recedes
//   148.0s "Children inherited medals, debts..."      -> local 180: cross-
//                dissolve into the rebuild still (H09), held to the end.
const PULLBACK_FRAMES = 195; // map (incl. crosses echo) runs local 0-195
const REBUILD_START = 180; // rebuild dissolve begins at 148.0s
const REBUILD_FRAMES = timing.durationInFrames - REBUILD_START;
// "Parents buried children" (145.6-146.9s): the crosses echo fades in just
// ahead of the sentence, peaks under it, and is gone before the rebuild.
const CROSSES_IN = [100, 122] as const;
const CROSSES_OUT = [158, 180] as const;
const CROSSES_PEAK_OPACITY = 0.45;

// A tiny house glyph used at map scale (much smaller than S1's House).
const MapHouse: React.FC<{ x: number; y?: number; s?: number }> = ({ x, y = 560, s = 1 }) => (
  <g
    transform={`translate(${x} ${y}) scale(${s})`}
    fill="none"
    stroke="#1A1A1A"
    strokeWidth={4 / s}
    strokeLinejoin="round"
  >
    <polyline points="-20,20 0,0 20,20" />
    <rect x={-18} y={20} width={36} height={26} />
  </g>
);

// A tiny map-scale tree: trunk + round canopy in plain black ink.
const MapTree: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} fill="none" stroke="#1A1A1A" strokeWidth={3} strokeLinecap="round">
    <line x1={0} y1={30} x2={0} y2={10} />
    <circle cx={0} cy={0} r={13} />
  </g>
);

// Faint contour-ish terrain strokes so the pulled-back page reads as a map
// rather than empty paper.
const MapTerrain: React.FC = () => (
  <g fill="none" stroke="#1A1A1A" strokeWidth={2.5} opacity={0.35} strokeLinecap="round">
    <path d="M 220 260 Q 380 210 540 265 Q 660 305 780 270" />
    <path d="M 1160 780 Q 1320 730 1480 785 Q 1600 825 1720 790" />
    <path d="M 260 840 Q 400 800 540 850" />
    <path d="M 1200 240 Q 1360 200 1540 250" />
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

  // Pull back from a close view to a readable map -- capped at 0.45 so
  // houses, terrain and the border all stay clearly legible at the end
  // (the point of the scene is reading the map, not losing it). Completed
  // within "The line moved a few centimetres" (142.0-144.4s -> local 0-72)
  // so the map is fully readable while the sentence is still playing.
  const zoomOut = interpolate(frame, [0, 84], [1.25, 0.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  // The border has moved "only slightly" -- a handful of pixels, not a
  // dramatic redraw. The shift lands inside sentence 1 as well.
  const lineShift = interpolate(frame, [12, 72], [0, 26], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [REBUILD_START - 10, PULLBACK_FRAMES], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "Parents buried children" (145.6-146.9s): a restrained, non-graphic
  // echo of the rows-of-crosses image (W12) breathing over the map for
  // ~2s, then receding before the rebuild dissolve.
  const crossesOpacity =
    interpolate(frame, [CROSSES_IN[0], CROSSES_IN[1]], [0, CROSSES_PEAK_OPACITY], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.ease),
    }) *
    interpolate(frame, [CROSSES_OUT[0], CROSSES_OUT[1]], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.ease),
    });

  const lineX = width / 2 + lineShift;
  const lineY1 = height * 0.08;
  const lineY2 = height * 0.95;

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
          <MapTerrain />
          {/* The old border position, a faint ghost, so the "few
              centimetres" of movement is visible against it. */}
          <line
            x1={width / 2}
            y1={lineY1}
            x2={width / 2}
            y2={lineY2}
            stroke="#1A1A1A"
            strokeWidth={3}
            strokeDasharray="14 18"
            opacity={0.25}
          />
          {/* Villages on both sides of the border. */}
          <MapHouse x={lineX - 260} y={540} />
          <MapHouse x={lineX - 380} y={620} s={0.85} />
          <MapHouse x={lineX - 300} y={710} s={0.9} />
          <MapHouse x={lineX + 260} y={540} />
          <MapHouse x={lineX + 390} y={620} s={0.85} />
          <MapHouse x={lineX + 310} y={710} s={0.9} />
          <MapTree x={lineX - 480} y={430} />
          <MapTree x={lineX - 180} y={820} />
          <MapTree x={lineX + 470} y={440} />
          <MapTree x={lineX + 190} y={820} />
          {/* The border itself: thick so it stays prominent at 0.45 scale. */}
          <RedLine id="s7" x={lineX} y1={lineY1} y2={lineY2} strokeWidth={14} />
        </svg>
      </div>

      {crossesOpacity > 0 ? (
        <AbsoluteFill style={{ opacity: crossesOpacity, mixBlendMode: "multiply" }}>
          <Still shotId="W12" />
        </AbsoluteFill>
      ) : null}
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

      <Sequence from={REBUILD_START} durationInFrames={REBUILD_FRAMES}>
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
