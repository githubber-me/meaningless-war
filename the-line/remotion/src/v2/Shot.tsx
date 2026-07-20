import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { Grain } from "./Grain";
import { RedOverlay } from "./RedOverlay";
import type { CameraDir, RedKind } from "./timing";

type ShotProps = {
  image: string;
  camera: CameraDir;
  red: RedKind;
  /** nominal (non-extended) duration of this shot, in frames. */
  duration: number;
};

// Per-direction start/end transforms. All scales stay within the
// spec'd 1.04 -> 1.12 push-in range (or equivalent drift), applied over
// the shot's own nominal duration so pace matches its length.
function cameraTransform(camera: CameraDir, t: number): string {
  // t: 0 -> 1 progress through the shot's nominal duration.
  switch (camera) {
    case "push-in": {
      const s = interpolate(t, [0, 1], [1.04, 1.12]);
      return `scale(${s})`;
    }
    case "push-in-slow": {
      const s = interpolate(t, [0, 1], [1.04, 1.1]);
      return `scale(${s})`;
    }
    case "drift-left": {
      const s = interpolate(t, [0, 1], [1.06, 1.1]);
      const x = interpolate(t, [0, 1], [1.5, -1.5]);
      return `scale(${s}) translateX(${x}%)`;
    }
    case "drift-right": {
      const s = interpolate(t, [0, 1], [1.06, 1.1]);
      const x = interpolate(t, [0, 1], [-1.5, 1.5]);
      return `scale(${s}) translateX(${x}%)`;
    }
    case "drift-up": {
      const s = interpolate(t, [0, 1], [1.06, 1.1]);
      const y = interpolate(t, [0, 1], [1.2, -1.2]);
      return `scale(${s}) translateY(${y}%)`;
    }
    case "drift-down": {
      const s = interpolate(t, [0, 1], [1.06, 1.1]);
      const y = interpolate(t, [0, 1], [-1.2, 1.2]);
      return `scale(${s}) translateY(${y}%)`;
    }
    case "static-breathe": {
      // Very slow, near-static push -- for holds/montage flashes where a
      // visible push-in would be too much movement.
      const s = interpolate(t, [0, 1], [1.04, 1.06]);
      return `scale(${s})`;
    }
    default:
      return "scale(1.04)";
  }
}

/**
 * One full-bleed shot: cinematic camera drift/push-in, film grain +
 * vignette, and the living red-line overlay positioned to sit on the
 * image's own feature (see RedOverlay.tsx).
 *
 * Mounted inside a nested, nominal-duration <Sequence> by TheLineV2.tsx's
 * CrossfadeLayer, so `useCurrentFrame()` here is always 0 at the shot's
 * real (treatment-table) start regardless of how far the outer Sequence
 * was extended for a crossfade -- the outer layer owns opacity, this
 * component owns everything else.
 */
export const Shot: React.FC<ShotProps> = ({ image, camera, red, duration }) => {
  const localFrame = useCurrentFrame();
  const t = interpolate(localFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <Img
        src={staticFile(`v2/${image}.jpg`)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: cameraTransform(camera, t),
          transformOrigin: "center center",
        }}
      />
      <RedOverlay red={red} localFrame={localFrame} duration={duration} />
      <Grain />
    </AbsoluteFill>
  );
};
