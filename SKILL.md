---
name: code-drawn-scenes
description: Use when building a code-drawn illustrated scene (Canvas2D, SVG, WebGL-2D) from references or a description, such as an interior, street, landscape, still life, game or hero illustration, or an ambient animated loop, especially when it must look finished, believable and detailed on the first pass rather than after many rounds of corrections.
---

# Code-drawn scenes

## Overview
A scene that looks good is mostly a scene with no wrong things in it. **Decide the camera, the light, the layout and the draw order as data before drawing.** Build every element finished, then review zoomed-in until a whole pass finds nothing.

First-pass scenes rarely fail for lack of drawing skill. They fail because of:
- receding edges with no shared vanishing point
- floating or physically impossible objects
- wrong overlaps
- placeholder elements
- crammed or arbitrary placement

## Workflow
For a one-shot result, run this workflow in an **independent subagent** with a complete brief, and stay the reviewer yourself (briefing.md: brief shape, a verbatim example, isolation).

0. **Art direction** (art-direction.md). Before building, offer the person the choice: with their references (photos of the real place and objects, style and mood images, pose references, a description of what matters), you build to their vision; without them, you build a best-effort interpretation that will be more generic. Turn what they send into a short art-direction note and confirm it with them.
1. **Inventory.** List every element the brief and references imply. For each one, note:
   - what it is and what it's made of
   - what supports it
   - what light it emits or receives
   - what moves, and about which axis
   - one specific, characterful detail

   Use references for structure, palette and mood, not for tracing.
2. **Camera.** Fix the frame and aspect for its destination. Choose the projection (perspective.md):
   - one-point for frontal views
   - two-point for corner views
   - atmospheric depth for open landscapes

   Place the horizon at eye height and the vanishing point(s) on it. Write a **ground-contact table**: for every standing element, its front and back ground-contact heights. That table gives its depth scale and which sides are visible.
3. **Layout** (composition.md). Place elements where they would really be, in sensible relationships, with breathing room. Keep focal elements clear. Record bounding boxes and check them for unintended collisions.
4. **Light plan** (lighting.md). List the sources: sun, sky, lamps, screens, fire, signage. Give each one its cast light and its visible glow. Note the shadowed zones and how surfaces turn away from light.
5. **Draw order** (plausibility.md). Write a back-to-front list for the scene and for every compound object.
6. **Build.** Start from `scene-kit.js`: projection helpers, boxes, lying-flat items, cylinders, tangent silhouettes, the lighting pipeline, the mount loop.
   - Every receding edge comes from the shared projection.
   - Every element is finished: specific subject, material, construction, attachment and story detail (detail.md).
   - Use deterministic randomness only.
7. **Review loop** (review.md). Render over http and take a full-frame screenshot, then zoom region by region with the checklist. List every defect before fixing any. Re-render and re-check touched regions and their neighbours until a full pass is clean. Then do a final pass for anything plain, generic or duplicated.
8. **Report** what was verified, which taste choices were made, and the known weak spots, so feedback goes to taste rather than correctness.

## Quick reference
| concern | rule |
|---|---|
| projection | one shared VP per axis family; back = front scaled toward VP; `k = (yBack−VP.y)/(yFront−VP.y)` |
| visible faces | an object left of the VP shows its right side, right of it its left; tops show below the horizon, undersides above |
| depth consistency | a deep top needs a deep ground footprint; nearer objects have lower ground contacts and larger scale |
| circles | horizontal circles become ellipses that open up the further they are from the horizon; cylinder bases are curved |
| rounded forms | silhouette = tangent from the VP to the profile curve; shade the swept curve as a band |
| contact | every element rests inside its support's top face, hangs from a visible attachment, or is planted in the ground |
| motion | about the real axis or pivot; gentle; independent phases |
| light | each source = cast light (light map, multiply) + visible glow (additive); faces turned away = own colour darkened |
| order | far → near; within an object: back faces → contents → front faces/lips |
| spacing | focal points get clear margins; fill dead zones at eye level before the edges |
| finish | no placeholders, no duplicated motifs; every element specific |

## Common mistakes
- **Drawing first and adding perspective later.** Retrofitting depth moves everything. Write the ground-contact table first.
- **Applying perspective to the big pieces only.** Small items need it too: books, devices, pots, steps, signs, windows set into walls.
- **Judging only the full frame.** Floating props, outlines poking past rounded corners and back-limb lines drawn over front limbs only show at 4–5× zoom.
- **Fixing one defect and declaring done.** Every fix moves something; re-check the neighbours.
- **Placeholders.** Coloured blobs standing in for art, signage, plants or faces, or the same drawing reused.
- **Light as decoration.** Glows with no cast light, cast light with no source, or neutral grey in shadows that should be the surface's own colour darkened.
