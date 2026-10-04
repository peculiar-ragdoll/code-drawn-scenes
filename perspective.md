# Perspective: shared vanishing points, consistent depth

## Choose the projection
| view | projection | notes |
|---|---|---|
| facing a wall, stage, shopfront, shelf | one-point | one VP on the horizon; frontal planes don't recede |
| looking at a corner, a building edge-on, a street junction | two-point | two VPs on the horizon, far apart (often outside the frame) |
| looking up a tower or down a well | three-point | add a vertical VP; use sparingly |
| open landscape, sky, sea | atmospheric | horizon plus shrinking scale, lowering contrast, cooling colour with distance; ground objects still sit on lines toward the horizon |
| flat style (isometric, side-scroller) | parallel | a deliberate style: then *nothing* converges, consistently |

Mixing systems by accident (one object converging, its neighbour flat or converging elsewhere) is the most common failure.

## The one-point model (generalises to two-point per axis)
- **Horizon = viewer's eye height.** The VP sits on it. Things above the horizon show their undersides, things below show their tops.
- **Reference plane = scale 1.** Usually the back wall or the frontal plane of the main subject. Elements flat on it (pictures, windows, posters, signs) do not recede.
- **Everything else has depth.** Describe an element by where its front and back touch the ground (screen y). Its back is its front scaled toward the VP: `k = (yBack − VP.y) / (yFront − VP.y)`. Intermediate depth t∈[0,1]: `scale = 1/(1 + t·(1/k − 1))`. Depth is linear in 1/scale, not in scale.
- **Write the ground-contact table first.** Nearer elements have lower contacts. Deeper elements have a bigger gap between their front and back contacts. An element against the reference plane has its back on the base line.

| element | front contact y | back contact y | k | visible side |
|---|---|---|---|---|
| cabinet against the wall, left | 708 | 700 | .98 | right |
| table out in the room | 728 | 706 | .95 | right |
| bench facing the viewer, centred | 770 | 700 | .85 | inner faces |
| crate in the foreground | 856 | 818 | .93 | none |

## What you see of a box
| position | visible |
|---|---|
| top below the horizon | top surface, narrowing toward the VP |
| bottom above the horizon | underside (shelves overhead, ceilings, awnings) |
| entirely left of the VP | right side |
| entirely right of the VP | left side |
| straddling the VP | front only, plus top or underside |

Inner faces flip: an opening (shelf compartment, doorway, drawer, window recess) left of the VP shows its left inner wall and its floor.

## Recipes (scene-kit.js has helpers)
- **Boxes:** buildings, furniture, crates, devices, standing books. Draw the front rect, then the top and the visible side via `toVP`. Thin things still get their side.
- **Lying-flat items:** books, trays, phones, rugs, paving stones. Front edge toward the viewer, top receding, end face on the side away from the VP.
  - **Stacks:** each upper item's foot must fall inside the lower item's top face; otherwise it floats or juts forward.
- **Rounded profiles:** cushions, arms of seats, car bodies, rounded counters. Sweep the profile toward the VP. The silhouette between the front and back copies of a curve is the **tangent from the VP**, not a line between endpoints. Shade the swept curve as its own band (top colour → side colour) or it reads as a crease.
- **Horizontal circles:** table tops, pot rims, wells, fountains, wheels lying flat. These are ellipses whose vertical radius grows with distance from the horizon. Calibrate once from a known element, then stay consistent. Cylinder bases are the lower half of a matching ellipse, never a flat line.
- **Ground patterns:** floorboards, tiles, road markings, rows of crops, rails. Lines parallel to the frontal plane stay horizontal, with spacing that grows toward the viewer. Lines running into depth converge on the VP.
- **Leaning or rotated objects:** project their rotated corners, not the unrotated rectangle.

## Failures to check for
- An element's top shows depth, but its contacts say it stands flush against the back plane.
- One piece in perspective, its neighbour flat.
- Each piece converging to its own private point.
- A top surface implying a steeper view angle than the ground footprints allow.
- Openings (windows, recesses, shelves) drawn with no inner walls.
