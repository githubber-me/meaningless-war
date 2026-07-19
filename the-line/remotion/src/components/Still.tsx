import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, random } from "remotion";
import { RED } from "./RedLine";

export type StillProps = {
  /** Shot id, e.g. "W03" or "H07" -- resolves to public/stills/{id}.jpg. */
  shotId: string;
  /**
   * Subtle continuous scale drift (1-2%) so held/repeated stills don't read
   * as static images, per plan.md Phase D's S5 note. Off by default for
   * shots so brief the drift would never be perceived.
   */
  drift?: boolean;
  /**
   * Renders a low-opacity red glow above the still, masked to a soft
   * vignette. Per plan.md/script.md: any red on a destruction still is a
   * separate Remotion overlay using the RED constant -- never baked into
   * the generated image itself.
   */
  destructionGlow?: boolean;
};

/**
 * Still renders one full-bleed generated shot (a Schnell draft or a FLUX.2
 * pro final, per generation/drafts and generation/finals) as a Remotion
 * <Img>. Every W/H shot in S5/S6/S7 goes through this component so scale
 * drift and the destruction-glow overlay stay consistent and are never
 * baked into the source images.
 */
export const Still: React.FC<StillProps> = ({ shotId, drift = false, destructionGlow = false }) => {
  const frame = useCurrentFrame();

  // Deterministic per-shot drift direction/speed so stills don't all pulse
  // in lockstep; 1-2% scale range as specified.
  const driftSeed = random(`still-drift-${shotId}`);
  const driftPeriod = 90 + driftSeed * 60; // frames per cycle, varies per shot
  const driftPhase = driftSeed * Math.PI * 2;
  const scale = drift
    ? 1 + 0.015 + 0.01 * Math.sin((frame / driftPeriod) * Math.PI * 2 + driftPhase)
    : 1;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#F3EEE4" }}>
      <Img
        src={staticFile(`stills/${shotId}.jpg`)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      {destructionGlow ? (
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0 }}
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id={`glow-${shotId}`} cx="50%" cy="55%" r="65%">
              <stop offset="0%" stopColor={RED} stopOpacity={0.22} />
              <stop offset="60%" stopColor={RED} stopOpacity={0.1} />
              <stop offset="100%" stopColor={RED} stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#glow-${shotId})`} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
