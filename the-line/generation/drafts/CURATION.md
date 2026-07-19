# Curation notes — Phase B drafts

Generated on `fal-ai/flux/schnell`, 4 variants per shot, 22 shots (W01–W12, H01–H10),
88 images total. Cumulative spend: **$0.264** (well under the $2.00 Phase B target).

## Method

1. Automated heuristic pass (`generation/scripts/curate.py`) on every variant:
   - file opens and decodes (catches broken/truncated downloads)
   - minimum dimensions (catches degenerate/empty generations)
   - mean per-pixel saturation (`max(R,G,B) - min(R,G,B)`, downsampled) — flags
     variants that drifted toward color, which the style bible forbids
   - grayscale pixel stddev — flags near-uniform/blank frames
   - red-leak fraction (pixels where R meaningfully exceeds G and B) — direct
     check against "Rules that do not bend" rule 1/2 (no red, ever, in generated
     imagery)
2. Manual visual spot-check of a representative sample (W02, W03, W09, W12, H01, H07)
   to confirm the heuristic pass wasn't fooled by e.g. sparse ink linework reading as
   "blank." All sampled images matched the intended style: thin black ink lines,
   off-white paper, no color, no red, appropriately minimal faces.

## Result: every shot has an acceptable draft

All 22 shots produced at least one PASS variant with **zero red-leak** across all 88
images. No shot needs to fall back to Remotion SVG. Picks below are the recommended
draft to carry forward into Phase C (hero regeneration) or directly into the edit
(montage shots under 400ms).

| Shot | Picked variant | Notes |
|------|-----------------|-------|
| W01 | `W01/W01_v1.jpg` | Boots + marching figures from both directions, clean silhouette read. |
| W02 | `W02/W02_v3.jpg` | Two frightened soldiers facing off. v1 flagged (slightly warmer/off-gray tone); v3 is neutral and reads clearly at a glance. |
| W03 | `W03/W03_v4.jpg` | Artillery flash silhouette composition; strong for a sub-400ms cut. |
| W04 | `W04/W04_v1.jpg` | Child hiding under table, clean minimal linework. |
| W05 | `W05/W05_v3.jpg` | Bridge mid-collapse, clear silhouette. |
| W06 | `W06/W06_v2.jpg` | Hospital corridor, simple perspective lines as intended. |
| W07 | `W07/W07_v4.jpg` | Burning schoolbook; v3 flagged for slightly higher saturation, v4 preferred. |
| W08 | `W08/W08_v3.jpg` | Soldier clutching photograph (grief pose), see W09 for its mirrored pair. |
| W09 | `W09/W09_v1.jpg` | Mirrored soldier clutching the same photograph from the opposite side — reads as an intentional visual rhyme with W08 when cut back-to-back. |
| W10 | `W10/W10_v2.jpg` | Dinner table with empty chairs, clear composition. |
| W11 | `W11/W11_v2.jpg` | Medals on empty uniforms, grid layout reads well even at a glance. |
| W12 | `W12/W12_v4.jpg` | Rows of crosses — this is the 8-second held silent frame, so it got extra scrutiny; clean, evenly spaced, plenty of negative space, no drift. |
| H01 | `H01/H01_v1.jpg` | Opening mirrored families — clean, both families legibly mirrored, faces stay simple. |
| H02 | `H02/H02_v2.jpg` | Leaders/podium/media scene; v4 flagged (mild saturation), v2 clean. |
| H03 | `H03/H03_v4.jpg` | Coin machine → bullets/tank, mechanism reads clearly. |
| H04 | `H04/H04_v1.jpg` | Blackboard/teacher/flag scene. |
| H05 | `H05/H05_v1.jpg` | Uniform line-up sequence, good left-to-right read. |
| H06 | `H06/H06_v4.jpg` | Train departure/waving families; v2 flagged (saturation), v4 clean. |
| H07 | `H07/H07_v4.jpg` | Leaders signing + handshake; strongest composition of the batch, confident linework, no red anywhere despite a "document" motif that could tempt a red stamp. |
| H08 | `H08/H08_v1.jpg` | Split composition: homecoming embrace vs. empty chair — reads clearly as the intended diptych. |
| H09 | `H09/H09_v2.jpg` | Ruins-to-scaffolding rebuild scene. |
| H10 | `H10/H10_v4.jpg` | Children at the erased border, tree beginning — calm, hopeful, minimal, matches the ending tone well. |

## Flagged-but-unused variants (kept on disk, not deleted)

A few variants per shot scored worse on the heuristic pass (marginally warmer
grayscale, or busier linework than the style bible calls for) but were not broken or
off-style — they're left in `drafts/` as backup options in case a scene needs a
second angle later. None were red or color; none needed rejection outright. Flagged:
`W02_v1`, `W07_v3`, `H02_v4`, `H06_v2`.

## Shots recommended for Remotion SVG instead

**None.** All 22 shots cleared the bar on the first Schnell batch — no shot needed a
second batch of variants, and none is being punted to Remotion SVG per the Gate B
fallback rule in plan.md.

## Carrying forward to Phase C

Per plan.md Phase C, only shots held on screen longer than ~1 second are candidates
for FLUX.2 [pro] regeneration. That is the full H01–H10 set (each is a hero frame
held during a slower section) plus, potentially, W12 (the crosses frame, held 8
seconds in silence at the end of the War montage). W01–W11 are montage cuts under
400ms and, per plan.md Phase C step 2, keep their Schnell drafts as-is — nobody sees
draft-level flaws at 3 frames of exposure.
