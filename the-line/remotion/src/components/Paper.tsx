import React from "react";
import { AbsoluteFill } from "remotion";

/**
 * Off-white paper tone shared by every scene. Kept as a constant so the
 * Remotion background and any post-processed generated stills (Phase C)
 * can be normalized against the same value.
 */
export const PAPER_COLOR = "#F3EEE4";

type PaperProps = {
  children?: React.ReactNode;
};

/**
 * Paper is the full-frame off-white textured background used behind every
 * scene. The texture is procedural (a seeded fractal-noise SVG filter) so
 * the film never depends on a licensed or generated paper photo -- it is
 * free, deterministic, and identical across every render.
 */
export const Paper: React.FC<PaperProps> = ({ children }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER_COLOR }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        preserveAspectRatio="none"
      >
        <filter id="paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={7}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>
      {children}
    </AbsoluteFill>
  );
};
