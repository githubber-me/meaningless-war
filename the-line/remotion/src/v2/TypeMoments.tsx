import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing } from "remotion";
import { RED } from "../components/RedLine";
import { Grain } from "./Grain";

const CONDENSED: React.CSSProperties = {
  fontFamily: '"Arial Narrow", Arial, sans-serif',
  fontWeight: 900,
  letterSpacing: "0.02em",
  transform: "scaleX(0.82)",
  textTransform: "uppercase",
};

/** Darkened charcoal-final texture backdrop shared by T1/T2. */
const CharcoalTexture: React.FC<{ image: string }> = ({ image }) => (
  <AbsoluteFill style={{ backgroundColor: "#050505" }}>
    <Img
      src={staticFile(`v2/${image}.jpg`)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "brightness(0.28) contrast(1.15)",
      }}
    />
    <Grain />
  </AbsoluteFill>
);

/** T1: ENEMY letterpress slam (55.0-62.0s / local frames 0-210), over
 * R10's blank poster wall -- the "canvas" CURATION.md calls out. Red
 * underline is the line itself, per the treatment. */
export const T1Enemy: React.FC = () => {
  const frame = useCurrentFrame();
  const slam = interpolate(frame, [10, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2)),
  });
  const scale = interpolate(slam, [0, 1], [1.4, 1]);
  const opacity = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const underline = interpolate(frame, [26, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const holdOut = interpolate(frame, [190, 210], [1, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <CharcoalTexture image="R10" />
      <div
        style={{
          position: "relative",
          color: "#EDEAE2",
          fontSize: 220,
          opacity: opacity * holdOut,
          transform: `scale(${scale})`,
          ...CONDENSED,
        }}
      >
        ENEMY
        <div
          style={{
            position: "absolute",
            left: "6%",
            right: "6%",
            bottom: -18,
            height: 10,
            background: RED,
            transformOrigin: "left center",
            transform: `scaleX(${underline})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

/** T2: mirrored VICTORY newspaper front pages (127.3-130.4s / local
 * frames 0-93), red rules on both mastheads. */
export const T2Victory: React.FC = () => {
  const frame = useCurrentFrame();
  const inL = interpolate(frame, [0, 18], [-100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const inR = interpolate(frame, [0, 18], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rule = interpolate(frame, [18, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const Masthead: React.FC<{ side: "left" | "right"; x: number }> = ({ side, x }) => (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: side === "left" ? "8%" : "auto",
        right: side === "right" ? "8%" : "auto",
        transform: `translateY(-50%) translateX(${x}%)`,
        color: "#EDEAE2",
        fontSize: 100,
        textAlign: side === "left" ? "left" : "right",
        ...CONDENSED,
      }}
    >
      VICTORY
      <div
        style={{
          height: 6,
          background: RED,
          marginTop: 10,
          transformOrigin: side === "left" ? "left center" : "right center",
          transform: `scaleX(${rule})`,
        }}
      />
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity }}>
      <CharcoalTexture image="R12" />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          bottom: 0,
          width: 2,
          background: "rgba(237,234,226,0.25)",
          transform: "translateX(-1px)",
        }}
      />
      <Masthead side="left" x={inL} />
      <Masthead side="right" x={inR} />
    </AbsoluteFill>
  );
};

/** T3: final card. Local frames 0-150 (5s): holds the full card 0-90
 * (3s, per script.md rule 5 / v2-treatment rule 4), then fades the card
 * out to pure white over 90-150 (the last 2s, landing exactly on 180.0s
 * total runtime). Sits on the white-cut background already in picture
 * from the preceding beat. */
export const T3FinalCard: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeToWhite = interpolate(frame, [90, 150], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#F7F4EC", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity: opacity * fadeToWhite,
          color: "#141210",
          fontSize: 88,
          lineHeight: 1.25,
          textAlign: "center",
          maxWidth: "70%",
          ...CONDENSED,
        }}
      >
        NO LINE IS WORTH A GENERATION
        <span style={{ color: RED }}>.</span>
      </div>
    </AbsoluteFill>
  );
};
