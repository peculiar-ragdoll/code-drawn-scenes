# Perspective: shared vanishing points, consistent depth

## Choose the projection
| view | projection | notes |
|---|---|---|
| facing a flat plane head-on | one-point | one VP on the horizon; frontal planes don't recede |
| looking at a corner, edge-on | two-point | two VPs on the horizon, far apart (often outside the frame) |
| looking steeply up or down | three-point | add a vertical VP; use sparingly |
| open distance with no straight edges | atmospheric | horizon plus shrinking scale, lowering contrast, cooling colour with distance; ground objects still sit on lines toward the horizon |
| flat style (isometric, side-scroller) | parallel | a deliberate style: then *nothing* converges, consistently |

Mixing systems by accident (one object converging, its neighbour flat or converging elsewhere) is the most common failure.

## The one-point model (generalises to two-point per axis)
- **Horizon = viewer's eye height.** The VP sits on it. Things above the horizon show their undersides, things below show their tops.
- **Reference plane = scale 1.** Usually the back wall or the frontal plane of the main subject. Elements flat on it do not recede.
- **Everything else has depth.** Describe an element by where its front and back touch the ground (screen y). Its back is its front scaled toward the VP: `k = (yBack − VP.y) / (yFront − VP.y)`. Intermediate depth t∈[0,1]: `scale = 1/(1 + t·(1/k − 1))`. Depth is linear in 1/scale, not in scale.
- **Write the ground-contact table first.** Nearer elements have lower contacts. Deeper elements have a bigger gap between their front and back contacts. An element against the reference plane has its back on the base line.

| element | front contact y | back contact y | k | visible side |
|---|---|---|---|---|
| A: against the reference plane, left of the VP | 708 | 700 | .98 | right |
| B: out in the space, left of the VP | 728 | 706 | .95 | right |
| C: deep, centred on the VP, open toward the viewer | 770 | 700 | .85 | inner faces |
| D: in the foreground, straddling the VP | 856 | 818 | .93 | none |

## What you see of a box
| position | visible |
|---|---|
| top below the horizon | top surface, narrowing toward the VP |
| bottom above the horizon | underside |
| entirely left of the VP | right side |
| entirely right of the VP | left side |
| straddling the VP | front only, plus top or underside |

Inner faces flip: an opening or recess left of the VP shows its left inner wall and its floor.

## Recipes (scene-kit.js has helpers)
- **Boxes:** anything with flat faces. Draw the front rect, then the top and the visible side via `toVP`. Thin things still get their side.
- **Lying-flat items:** anything thin lying on a surface. Front edge toward the viewer, top receding, end face on the side away from the VP.
  - **Stacks:** each upper item's foot must fall inside the lower item's top face; otherwise it floats or juts forward.
- **Rounded profiles:** any edge or body with a curved cross-section. Sweep the profile toward the VP. The silhouette between the front and back copies of a curve is the **tangent from the VP**, not a line between endpoints. Shade the swept curve as its own band (top colour → side colour) or it reads as a crease.
- **Horizontal circles:** any circle lying in a horizontal plane. These are ellipses whose vertical radius grows with distance from the horizon. Calibrate once from a known element, then stay consistent. Cylinder bases are the lower half of a matching ellipse, never a flat line.
- **Ground patterns:** any repeating lines on the ground. Lines parallel to the frontal plane stay horizontal, with spacing that grows toward the viewer. Lines running into depth converge on the VP.
- **Leaning or rotated objects:** project their rotated corners, not the unrotated rectangle.

## World helper (optional): `world-kit.js`
For art directions that want believable depth, `world-kit.js` makes correct perspective the default rather than
something to get right by hand. It is optional: skip it for flat styles, deliberate cheats or a projection of your own.
Nothing else in the skill depends on it.

- **Cameras:** `WorldKit.pinhole(VP, eyeHeight, focal)` for one shared vanishing point; `WorldKit.parallel({...})` or
  `WorldKit.isometric(origin, scale)` for styles where nothing converges. The drawing functions are the same for all
  of them.
- **Drawing in metres:** `box`, `face`, `cylinder`, `circle` and `path` take world points. A box draws only the faces
  turned toward the camera, so the visible sides, tops and undersides are always right. Circles and cylinder rims are
  exact at any height. `px(metres, point)` turns a world size into pixels at that depth.
- **Fills from orientation:** a fill can be a function of the face (`f => …`, with `f.lit` from 0 to 1 for the light's
  direction or position). Pick one of a few flat inks by `f.lit` for print styles, or darken a colour for painterly
  ones.
- **Cast shadows:** `shadowPts(points, h)` and `shadowBox(c, bounds, fill)` project onto the plane y = h, away from a
  point light or along a distant light's direction.
- **Reflections:** `mirror(c, {id, h, outline, tint}, draw)` redraws `draw` through a camera mirrored about the plane
  y = h, clipped to the surface. Hand it the same function that draws the scene, and everything above the surface
  is reflected, including moving elements.
- **Draw queue:** `later(depth, fn)` then `flush()` draws far to near. Shapes that pass through each other still need
  splitting by hand.
- **Checks:** pass `checks: SceneKit.makeChecks(camera)` and every `box`, `face` and `cylinder` with an id registers
  itself in draw order, with its top face; the mirror pass records what it drew (checks.md).
- **Limits:** Canvas2D has no perspective transform, so text and patterns on receding planes are drawn as paths
  through `onPlane(origin, u, v)`. There is no depth buffer: draw order is still yours (or the queue's).

## Failures to check for
- An element's top shows depth, but its contacts say it stands flush against the back plane.
- One piece in perspective, its neighbour flat.
- Each piece converging to its own private point.
- A top surface implying a steeper view angle than the ground footprints allow.
- Openings and recesses drawn with no inner walls.
