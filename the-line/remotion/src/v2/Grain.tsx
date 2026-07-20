import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

/**
 * Subtle full-bleed film grain + vignette, shared by every <Shot/>. Kept
 * as one component so grain intensity/vignette strength stay consistent
 * across all 33 images rather than drifting per-shot.
 */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  // Cheap animated grain: shift a static SVG turbulence pattern's tile
  // offset a few px per frame so it doesn't read as a locked-in texture.
  const dx = (frame * 7) % 97;
  const dy = (frame * 5) % 89;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <filter id="v2-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0" />
        </filter>
        <rect
          x={-dx}
          y={-dy}
          width="110%"
          height="110%"
          filter="url(#v2-grain)"
          style={{ mixBlendMode: "overlay" }}
        />
      </svg>
      {/* Soft vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
