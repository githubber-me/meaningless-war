import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { AudioBedV2 } from "./AudioBedV2";
import { Shot } from "./Shot";
import { T1Enemy, T2Victory, T3FinalCard } from "./TypeMoments";
import { BEATS, TOTAL_DURATION_IN_FRAMES, type Beat } from "./timing";

/**
 * Wraps one beat in an opacity-crossfade envelope. The OUTER Sequence is
 * extended backward by `fadeInFrames` (this beat's own crossfadeIn) and
 * forward by `fadeOutFrames` (the NEXT beat's crossfadeIn -- a dissolve
 * needs both the outgoing and incoming layer to overlap for the same
 * span, so the outgoing layer's fade-out window is dictated by whatever
 * the following beat asked for). The INNER Sequence is the beat's real,
 * nominal, non-extended span, so content components (<Shot/>, the type
 * moments) always see local frame 0 at the treatment-table start.
 *
 * Later beats render later in the JSX tree and therefore sit on top of
 * the DOM stack, so an incoming dissolve is the new layer fading in over
 * the old one -- rather than the old one fading out to reveal a static
 * layer beneath (which would flash black/transparent).
 */
const CrossfadeLayer: React.FC<{
  from: number;
  duration: number;
  fadeInFrames: number;
  fadeOutFrames: number;
  children: React.ReactNode;
}> = ({ from, duration, fadeInFrames, fadeOutFrames, children }) => {
  const extendedFrom = Math.max(0, from - fadeInFrames);
  const actualFadeIn = from - extendedFrom; // clamped at timeline start
  const extendedEnd = Math.min(TOTAL_DURATION_IN_FRAMES, from + duration + fadeOutFrames);
  const actualFadeOut = extendedEnd - (from + duration); // clamped at timeline end
  const extendedDuration = extendedEnd - extendedFrom;

  return (
    <Sequence from={extendedFrom} durationInFrames={extendedDuration} layout="none">
      <FadeOpacity fadeIn={actualFadeIn} hold={duration} fadeOut={actualFadeOut}>
        <Sequence from={actualFadeIn} durationInFrames={duration} layout="none">
          {children}
        </Sequence>
      </FadeOpacity>
    </Sequence>
  );
};

const FadeOpacity: React.FC<{
  fadeIn: number;
  hold: number;
  fadeOut: number;
  children: React.ReactNode;
}> = ({ fadeIn, hold, fadeOut, children }) => {
  const frame = useCurrentFrame();
  // Build strictly-increasing breakpoints; fadeIn/fadeOut of 0 (timeline
  // start/end, or a hard cut) would otherwise produce a duplicate 0-width
  // segment, which `interpolate` rejects.
  const points: { at: number; v: number }[] = [{ at: 0, v: fadeIn > 0 ? 0 : 1 }];
  if (fadeIn > 0) points.push({ at: fadeIn, v: 1 });
  points.push({ at: fadeIn + hold, v: 1 });
  if (fadeOut > 0) points.push({ at: fadeIn + hold + fadeOut, v: 0 });
  const opacity = interpolate(
    frame,
    points.map((p) => p.at),
    points.map((p) => p.v),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

function nextCrossfadeIn(beats: Beat[], index: number): number {
  const next = beats[index + 1];
  return next ? next.crossfadeIn : 0;
}

const BeatContent: React.FC<{ beat: Beat }> = ({ beat }) => {
  if (beat.kind === "image") {
    return <Shot image={beat.image} camera={beat.camera} red={beat.red} duration={beat.duration} />;
  }
  if (beat.kind === "white") {
    return <AbsoluteFill style={{ backgroundColor: "#F7F4EC" }} />;
  }
  // type
  switch (beat.id) {
    case "T1":
      return <T1Enemy />;
    case "T2":
      return <T2Victory />;
    case "T3":
      return <T3FinalCard />;
    default:
      return null;
  }
};

/**
 * TheLineV2 -- "The Red Thread" cut. 33 charcoal/ink finals + 3 type
 * moments + 1 hard white cut, laid out per v2-treatment.md's shot table
 * (see timing.ts), with 8-12 frame cross-dissolves between chapter shots
 * and hard cuts inside the M1-M5 montage (and into/out of the white
 * cut/final card, per the treatment). Audio is VO + bgm only (no wind,
 * no SFX) per the user's explicit instruction -- see AudioBedV2.tsx.
 */
export const TheLineV2: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AudioBedV2 />
      {BEATS.map((beat, i) => (
        <CrossfadeLayer
          key={beat.id}
          from={beat.from}
          duration={beat.duration}
          fadeInFrames={beat.crossfadeIn}
          fadeOutFrames={nextCrossfadeIn(BEATS, i)}
        >
          <BeatContent beat={beat} />
        </CrossfadeLayer>
      ))}
    </AbsoluteFill>
  );
};
