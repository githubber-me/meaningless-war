# V2 Curation — per-shot verdicts (all drafts VIEWED with the Read tool)

Winner = variant whose composition the hero regen targets. Heroes are regenerated
from the prompt file (revised where noted), then viewed again; draft-level corner
signatures/scrawls do not carry into heroes automatically and were re-checked there.

| Shot | Winner | Verdict |
|---|---|---|
| R01 | v1 | Clean mist corridor down valley center between two villages; v2 lacked the two-village structure. Strong. |
| R02 | v1 | Lamplit window, silhouette, steam; v2 too flat/graphic with cartoon lamp orb. |
| R03 | v1 | Long shadow, dusk smudge sun, aged paper tone; v2 figure pose awkward. |
| R04 | v1 | True mirrored twin-family composition with central divide; warm-sepia paper tone (grayscale post normalizes). |
| R05 | v1 | Hands + descending pencil over map, clean band for line stroke; v2 had legible-ish map text. |
| R06 | v3 (re-draft) | v1 lacked corridor, v2 had watermark. Revised prompt: symmetric aerial, central road to vanishing point echoing R01. Excellent. |
| R07 | v1 | Top wire clean full-width, scattering birds, dusk. One of the strongest. |
| R08 | v1 | Concentric drawn broadcast rings dominate night sky over rooftops. |
| R09 | v1 | Looming wall shadows over family at radio; v2 had signature artifact. Slightly comic-ink but works. |
| R10 | v1 | Huge blank poster, crowd silhouettes; v2 too photographic. Perfect canvas for ENEMY type. |
| R11 | v1 | Orator with actual diagonal sash (red overlay target); v2 had no sash. Pen-ink lighter than the charcoal norm — weakest style match of the keepers. |
| R12 | v1 | Typewriter, stamp, towers of orders, doc front-center; pseudo-text illegible per style bible. v2 had corner scrawl. |
| R13 | v1 | Mother's hands at collar + mirror; tiny warm speck at collar in draft (killed by grayscale post). v2 missed the mother beat. |
| R14 | v2 | Symmetric station arches, track receding to center vanishing point (clean bed for the red rails). Train faces camera rather than receding — acceptable; tiny edge scrawl noted. |
| R15 | v1 | Night trench scar with flares; v2 read as farmland. |
| R16 | v3 (re-draft) | Originals had pseudo-writing + signatures. Revision: tags pile + ledger with illegible tally-ish marks, bold ink chiaroscuro. |
| R17 | v2 | Mirrored bowed soldiers in facing trenches, single wire crossing the gap — exactly the treatment. Corner scrawl in draft; hero checked. |
| R18 | v1 | Burning farmhouse mirrored in puddle, child's shoe foreground. Corner signature in draft only. v2's fire too weak. |
| R19 | v1 | Endless crosses, dawn glow, clean straight horizon band for the line. Very strong (the 8s silence hold). |
| R20 | v2 | Two tiny figures, vast drained hall, blank flags; v1 had a full delegation (wrong beat). |
| R21 | v3 (re-draft) | Originals full of printed fake text. Revision: nib on blank paper with one thin trailing ink line — the line IS the stroke. Macro-photographic texture, acceptable as an insert shot. |
| R22 | v4 (re-draft) | Deviation: no draft ever put the folded uniform ON the chair seat. v4: centered empty chair in raking window light, folded cloth on table — thread should lie along the chair's BACK RAIL instead of the seat. Emotionally the strongest of six candidates. |
| R23 | v4 (re-draft) | Near-unlabeled world map, magnifier, clean central region for ghost+new line; tiny corner scrawls only. v1 had giant fake words (reject). |
| R24 | v2 | Two figures under one umbrella, cross + headstone, rivulet running from their feet to viewer — matches treatment beat exactly. Corner signature in draft. |
| R25 | v2 | Child's hands, open medal box, ribbon clear, letters with illegible cursive (diegetic). v1 was an adult hand + emblem book. |
| R26 | v1 | Crane + scaffolding, sunrise haze, open foreground rubble patch for the slack thread. v2 too dark for the lifting-light beat. |
| R27 | v1 | Two children at fence gap, one reaching down; v2 generated a deformed creature (hard reject). Corner scrawl in draft. |
| R28 | v2 | ~65% clean pale sky over the whole valley — ideal for the vertical kite-string rise. Minimal, luminous. |
| M1 | v2 | Helmet in mud; photographic-leaning but heavy and dark, reads fine at 1.6s flash-cut speed. |
| M2 | v2 | Crow on one continuous sagging wire, near-empty sky; v1's wire was visibly broken. Strongest M shot. |
| M3 | v2 | Symmetric severed bridge, center gap, mist; no artifacts. |
| M4 | v5 (2nd re-draft) | v1/v2 semi-legible cursive; REV2 produced a giant legible "hell" (reject) and a dated letter. REV3 (fully charred, zero writing): clean. |
| M5 | v4 (re-draft) | v1/v2/v3 all photographic; REV2 prompt ("rough charcoal sketch") produced proper expressive charcoal medal + ribbon. |

## Weak shots (for the composition agent)

- **Strongest anchors:** R01, R05, R07, R14, R19, R20, R28, M2, M3 — lean on these for holds and slow push-ins.
- **Style outliers (photographic-leaning):** R21, M1, and to a lesser degree R23 macro texture. Keep them short or under heavier grain/vignette.
- **Style outlier (lighter pen-ink):** R11, R09 — sit slightly lighter than the charcoal norm; grade darker in Remotion if they pop out.
- **Known deviations:** R14 train faces camera (not receding); R22 thread belongs on the chair BACK RAIL, not the seat; R25 contains illegible cursive letters (diegetic, allowed).
- **Never fully worked:** none — all 33 shots have a usable winner.

Spend for curation phase: 80 schnell images (66 initial + 14 re-drafts) = $0.240.

## Hero pass (flux-pro v1.1, 1344x768 — every hero VIEWED)

27/33 heroes passed on the first roll. Six re-rolled once with minimally adjusted
prompts (adjustment logged in each prompt file header as HERO-FIX); all six re-rolls
were accepted:

- R09: first roll turned wall shadows into literal monster faces (too horror) -> r2 has plain human parent-shadows looming over children at the radio.
- R10: first roll drifted to an indoor cinema screen -> r2 is the blank poster on a brick wall over an outdoor crowd.
- R11: first roll lost the sash (figure from behind) + faint warm tint on flags -> r2 shows the diagonal sash facing viewer, blank banners.
- R23: first roll generated an ORANGE candle flame (color leak, hard reject) -> r2 unlabeled map, monochrome candle, clean central border region.
- R25: first roll had elderly adult hands -> r2 younger hands (teen-ish; closest achieved).
- M5: draft winner was charcoal but hero regressed to photoreal macro; r2 still photographic despite forced-charcoal wording — ACCEPTED as a style outlier consistent with M1 (both flash at ~1.6s).

Other hero notes: R05 has a baked BLACK stroke across the map (gives the red overlay an exact path to trace); R16's ledger shows semi-legible NUMBERS — thematically apt for "returned numbers"; R20 has three tiny figures not two (push-in can crop); R22 uniform folded on the table beside the empty chair (thread target: chair back rail or folded uniform); M4 retains faint ember specks in the hero, neutralized to grey by grayscale post.

## Post-processing (v2_postprocess.py)

All 33 finals collapsed to exact R=G=B grayscale + autocontrast (1% cutoff), saved to
`finals/`, programmatically verified: max channel divergence = 0/255 on every file.
Spot-VIEWED after post: R04 (was sepia), R23 (had candle color), M4 (embers), R19
(lightest) — no washout, blacks intact.

Total v2 spend: $1.455 (cumulative project $2.181 of $12.00 hard cap).
