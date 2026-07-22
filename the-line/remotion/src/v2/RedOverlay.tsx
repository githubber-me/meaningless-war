import React from "react";
import { interpolate, Easing } from "remotion";
import { RED } from "../components/RedLine";
import type { RedKind } from "./timing";

/**
 * V2's "living red line": every shot's overlay is authored as an SVG path
 * (or set of paths) in the SOURCE IMAGE's own pixel space (1344x768, the
 * FLUX.2 pro hero resolution -- see the-line/generation/v2/CURATION.md).
 * The enclosing <svg> uses viewBox="0 0 1344 768" with
 * preserveAspectRatio="xMidYMid slice" -- the exact same crop/scale
 * behavior as the shot's <Img style={{objectFit: "cover"}}>, so a
 * coordinate chosen by eyeballing the still lands on the same feature in
 * the rendered frame regardless of the 1920x1080 canvas.
 *
 * Coordinates below were chosen by viewing every one of the 33 finals
 * with the Read tool (see the composition agent's report for the
 * per-shot reasoning). Known deviations carried over from CURATION.md:
 *  - R14: track traced center-receding (train faces camera, not
 *    receding, but the rails still converge centrally).
 *  - R22: thread traced along the chair's BACK RAIL (top crest rail),
 *    not the seat, per CURATION.md's explicit correction.
 */

const VB_W = 1344;
const VB_H = 768;

type OverlayProps = {
  red: RedKind;
  /** frame local to this shot's own Sequence (0 at shot start). */
  localFrame: number;
  /** total duration of this shot's Sequence, in frames. */
  duration: number;
};

// Generic "draw itself on" path: pathLength=1 trick driven by
// strokeDasharray/strokeDashoffset, ramping over `drawFrames` starting at
// `startFrame`, then holding fully drawn.
const DrawPath: React.FC<{
  d: string;
  startFrame?: number;
  drawFrames?: number;
  strokeWidth?: number;
  opacity?: number;
  pulse?: boolean;
  localFrame: number;
}> = ({ d, startFrame = 0, drawFrames = 26, strokeWidth = 5, opacity = 0.92, pulse = false, localFrame }) => {
  const progress = interpolate(localFrame, [startFrame, startFrame + drawFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });
  if (progress <= 0) return null;
  const pulseMul = pulse
    ? 0.75 + 0.25 * Math.sin(((localFrame - startFrame) / 40) * Math.PI * 2)
    : 1;
  return (
    <path
      d={d}
      fill="none"
      stroke={RED}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
      opacity={opacity * pulseMul}
    />
  );
};

export const RedOverlay: React.FC<OverlayProps> = ({ red, localFrame, duration }) => {
  if (red === "none") return null;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <RedOverlayInner red={red} localFrame={localFrame} duration={duration} />
    </svg>
  );
};

const RedOverlayInner: React.FC<OverlayProps> = ({ red, localFrame, duration }) => {
  switch (red) {
    case "map-stroke":
      // R05: the hero has a baked BLACK stroke across the map -- trace it
      // exactly as the sentence "someone drew a line" lands (draw-on
      // starts a beat into the shot, finishes well before the shot ends).
      return (
        <DrawPath
          d="M 210 367 Q 500 352 700 367 T 1150 363"
          startFrame={20}
          drawFrames={70}
          strokeWidth={7}
          localFrame={localFrame}
        />
      );

    case "valley-cut":
      // R06: line cuts across the valley floor, tracing the central
      // road/terrain (echoes R01's corridor).
      return (
        <DrawPath
          d="M 690 232 C 665 340 640 470 650 610 C 654 670 648 715 645 760"
          startFrame={6}
          drawFrames={60}
          strokeWidth={6}
          localFrame={localFrame}
        />
      );

    case "wire-thread":
      // R07: thread woven along the TOP wire of the barbed-wire fence.
      return (
        <DrawPath
          d="M 55 650 C 300 560 560 430 800 280 C 1000 165 1180 70 1330 12"
          startFrame={10}
          drawFrames={90}
          strokeWidth={4.5}
          localFrame={localFrame}
        />
      );

    case "broadcast-rings": {
      // R08: concentric rings pulse red, centered on the radio towers'
      // shared vanishing point in the sky.
      const cx = 672;
      const cy = 232;
      const rings = [70, 130, 190, 250];
      return (
        <>
          {rings.map((r, i) => {
            const phase = (localFrame / 55 + i * 0.22) % 1;
            const radius = r + phase * 60;
            const opacity = interpolate(phase, [0, 0.15, 0.8, 1], [0, 0.55, 0.2, 0]);
            return (
              <circle key={i} cx={cx} cy={cy} r={radius} fill="none" stroke={RED} strokeWidth={3} opacity={opacity} />
            );
          })}
        </>
      );
    }

    case "door-light":
      // R09: thin red light under the door.
      return (
        <DrawPath
          d="M 22 538 L 292 538"
          startFrame={8}
          drawFrames={30}
          strokeWidth={4}
          opacity={0.85}
          localFrame={localFrame}
        />
      );

    case "poster-underline":
      // R10: line underlines the empty poster (canvas for T1's ENEMY).
      return (
        <DrawPath
          d="M 285 512 L 1110 512"
          startFrame={15}
          drawFrames={55}
          strokeWidth={6}
          localFrame={localFrame}
        />
      );

    case "sash":
      // R11: the orator's diagonal sash, shoulder to opposite hip.
      return (
        <DrawPath
          d="M 893 178 C 905 220 925 270 940 332"
          startFrame={10}
          drawFrames={40}
          strokeWidth={10}
          opacity={0.8}
          localFrame={localFrame}
        />
      );

    case "signature-order":
      // R12: the signature stroke on the order sitting on the desk.
      return (
        <DrawPath
          d="M 560 662 Q 600 640 645 656 T 730 650 Q 770 645 805 655"
          startFrame={30}
          drawFrames={35}
          strokeWidth={3.5}
          localFrame={localFrame}
        />
      );

    case "stitch-seam":
      // R13: glowing stitch-seam down the jacket's center placket.
      return (
        <DrawPath
          d="M 951 345 C 954 420 949 500 953 580 C 955 605 952 625 954 642"
          startFrame={12}
          drawFrames={45}
          strokeWidth={3}
          pulse
          localFrame={localFrame}
        />
      );

    case "railway-track":
      // R14: the railway track itself, receding to the vanishing point --
      // long hold (504 frames), so the draw-on is slow and the line then
      // pulses gently for the rest of the hold.
      return (
        <DrawPath
          d="M 672 768 L 667 600 L 661 470 L 658 425"
          startFrame={20}
          drawFrames={140}
          strokeWidth={6}
          pulse
          localFrame={localFrame}
        />
      );

    case "trench-scar":
      // R15: the (already-baked bright) trench scar glows red -- trace
      // its winding path.
      return (
        <DrawPath
          d="M 30 610 C 140 570 260 500 360 460 C 470 415 560 390 620 345 C 700 285 800 235 880 175 C 915 145 940 115 955 70"
          startFrame={5}
          drawFrames={60}
          strokeWidth={5}
          opacity={0.75}
          pulse
          localFrame={localFrame}
        />
      );

    case "tangled-thread":
      // R16: one red thread tangled among the dog tags.
      return (
        <DrawPath
          d="M 345 185 Q 400 150 445 175 Q 490 200 465 235 Q 440 260 400 235 Q 375 218 345 185"
          startFrame={10}
          drawFrames={45}
          strokeWidth={3.5}
          localFrame={localFrame}
        />
      );

    case "trench-wire":
      // R17: the wire strung between the two soldiers.
      return (
        <DrawPath
          d="M 432 366 Q 660 335 894 366"
          startFrame={8}
          drawFrames={35}
          strokeWidth={3}
          localFrame={localFrame}
        />
      );

    case "ember-beam":
      // R18: ember line along the burning house's roof beam.
      return (
        <DrawPath
          d="M 632 271 L 900 240"
          startFrame={10}
          drawFrames={30}
          strokeWidth={5}
          pulse
          opacity={0.85}
          localFrame={localFrame}
        />
      );

    case "flicker": {
      // M1-M5: brief full-frame red flickers rather than a feature path --
      // the montage cuts too fast (48 frames/shot) for a drawn path to
      // read; a flash sells "the line is still there, just faster" better.
      const flickerAt = Math.round(duration * 0.4);
      const flick = interpolate(
        localFrame,
        [flickerAt - 3, flickerAt, flickerAt + 3, flickerAt + 10],
        [0, 0.35, 0.12, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      if (flick <= 0) return null;
      return <rect x={0} y={0} width={VB_W} height={VB_H} fill={RED} opacity={flick} />;
    }

    case "horizon-line":
      // R19: lies along the horizon behind the crosses -- the 8s silence
      // hold, so this draws in slowly and then simply sits, breathing.
      return (
        <DrawPath
          d="M 0 197 Q 340 188 672 200 T 1344 205"
          startFrame={20}
          drawFrames={110}
          strokeWidth={4}
          opacity={0.7}
          pulse
          localFrame={localFrame}
        />
      );

    case "ink-stroke":
      // R21: the signature ink IS the line -- trace the pen's own trail.
      return (
        <DrawPath
          d="M 758 397 Q 500 470 250 542 L 60 588"
          startFrame={6}
          drawFrames={70}
          strokeWidth={3}
          localFrame={localFrame}
        />
      );

    case "chair-rail":
      // R22: thread lies across the chair's BACK RAIL (crest rail across
      // the top of the near chair's back) -- CURATION.md's explicit
      // correction away from the seat. Long hold (348 frames): draws on
      // slowly, then a gentle drift/pulse for the remainder.
      return (
        <DrawPath
          d="M 262 302 Q 300 278 362 270 Q 420 264 458 296"
          startFrame={25}
          drawFrames={90}
          strokeWidth={4}
          pulse
          localFrame={localFrame}
        />
      );

    case "ghost-line": {
      // R23: dashed ghost line (the old border) + solid new line, ~2cm
      // (here: a consistent ~18px) apart, tracing the map's existing
      // central crease.
      const mainD = "M 650 148 C 600 250 480 350 460 460 C 442 542 480 600 520 652";
      const ghostD = "M 668 148 C 618 250 498 350 478 460 C 460 542 498 600 538 652";
      const progress = interpolate(localFrame, [15, 75], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.ease),
      });
      if (progress <= 0) return null;
      return (
        <>
          <path
            d={ghostD}
            fill="none"
            stroke={RED}
            strokeWidth={3}
            strokeDasharray="10 8"
            pathLength={1}
            strokeDashoffset={1 - progress}
            opacity={0.45}
          />
          <path
            d={mainD}
            fill="none"
            stroke={RED}
            strokeWidth={4}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress}
            opacity={0.95}
          />
        </>
      );
    }

    case "rivulet":
      // R24: thin line of rainwater at their feet, running to the grave.
      return (
        <DrawPath
          d="M 700 760 C 692 690 680 630 690 570 C 698 528 700 502 700 480"
          startFrame={8}
          drawFrames={45}
          strokeWidth={4}
          opacity={0.7}
          localFrame={localFrame}
        />
      );

    case "ribbon":
      // R25: the medal's ribbon.
      return (
        <DrawPath
          d="M 690 368 C 672 388 672 408 692 428 C 706 440 706 452 692 462"
          startFrame={12}
          drawFrames={40}
          strokeWidth={5}
          localFrame={localFrame}
        />
      );

    case "slack-rubble":
      // R26: the thread lies slack in the foreground rubble.
      return (
        <DrawPath
          d="M 100 700 Q 280 730 460 705 Q 620 684 700 695 Q 830 712 950 690"
          startFrame={15}
          drawFrames={70}
          strokeWidth={4}
          opacity={0.75}
          localFrame={localFrame}
        />
      );

    case "child-lift":
      // R27: the child lifts the slack thread from the ground.
      return (
        <DrawPath
          d="M 330 636 Q 470 665 560 648 Q 640 632 690 610 Q 750 585 800 578"
          startFrame={30}
          drawFrames={70}
          strokeWidth={4}
          localFrame={localFrame}
        />
      );

    case "kite-string":
      // R28: the line rises VERTICAL -- a kite string into the sky.
      return (
        <DrawPath
          d="M 950 562 C 946 420 960 240 950 20"
          startFrame={20}
          drawFrames={100}
          strokeWidth={4}
          localFrame={localFrame}
        />
      );

    default:
      return null;
  }
};
