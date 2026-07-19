import React from "react";
import { AbsoluteFill, useCurrentFrame, random } from "remotion";
import { RED } from "./RedLine";

type PropagandaCardProps = {
  /** The card's message, e.g. "THEY WANT WHAT IS OURS" or the S3 payoff "ENEMY". */
  text: string;
  /** Distinguishes the final full-screen payoff card so it can render larger / centered. */
  variant?: "beat" | "fullscreen";
  /** Seed for the paper-shake jitter so each card shakes slightly differently. */
  seed?: string;
};

/**
 * PropagandaCard renders the bold condensed-type cards used across S3 (The
 * story spreads). It has a subtle paper-shake (a few px of jitter, seeded
 * per-card so cards don't all shake in lockstep) and a red accent rule
 * drawn from the single locked RED constant -- never a hard-coded color.
 */
export const PropagandaCard: React.FC<PropagandaCardProps> = ({
  text,
  variant = "beat",
  seed = text,
}) => {
  const frame = useCurrentFrame();

  // Small, fast jitter to suggest a card being slapped down / shaken into
  // place, not a smooth animated move.
  const jitterX = (random(`${seed}-x-${Math.floor(frame / 2)}`) - 0.5) * 4;
  const jitterY = (random(`${seed}-y-${Math.floor(frame / 2)}`) - 0.5) * 4;

  const isFullscreen = variant === "fullscreen";

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: `translate(${jitterX}px, ${jitterY}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: isFullscreen ? "80px 120px" : "40px 64px",
          border: `${isFullscreen ? 10 : 6}px solid ${RED}`,
          backgroundColor: "#F3EEE4",
        }}
      >
        <span
          style={{
            fontFamily: "'Arial Narrow', Arial, sans-serif",
            fontWeight: 900,
            fontStretch: "condensed",
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#1A1A1A",
            fontSize: isFullscreen ? 160 : 72,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {text}
        </span>
        <div
          style={{
            width: isFullscreen ? 240 : 120,
            height: isFullscreen ? 8 : 5,
            backgroundColor: RED,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
