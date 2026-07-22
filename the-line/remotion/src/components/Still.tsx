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

  // Deterministic per-shot glow placement so the accent sits near the
  // shot's destruction point-ish area rather than dead center every time.
  const glowCx = 40 + random(`glow-x-${shotId}`) * 20; // 40-60%
  const glowCy = 40 + random(`glow-y-${shotId}`) * 20; // 40-60%

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
          // Multiply the still over the paper background: the stills'
          // stark-white paper is generated, not the shared Paper tone, so
          // multiplying lets the off-white backing show through and every
          // still sits in the same paper world as the SVG scenes
          // (plan.md known risk: "paper tone mismatch... fix in post").
          mixBlendMode: "multiply",
        }}
      />
      {destructionGlow ? (
        // A localized, masked, low-opacity red radial accent near the
        // destruction point only -- never a full-frame wash. Opacity peaks
        // at 0.12 and reaches zero well before the frame edges.
        <svg
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0 }}
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id={`glow-${shotId}`} cx={`${glowCx}%`} cy={`${glowCy}%`} r="28%">
              <stop offset="0%" stopColor={RED} stopOpacity={0.12} />
              <stop offset="55%" stopColor={RED} stopOpacity={0.05} />
              <stop offset="100%" stopColor={RED} stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#glow-${shotId})`} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};
