---
name: code-drawn-scenes
description: Use when building a code-drawn illustrated scene (Canvas2D, SVG, WebGL-2D) from references or a description, such as an interior, street, landscape, still life, game or hero illustration, or an ambient animated loop, especially when it must look finished, believable and detailed on the first pass rather than after many rounds of corrections.
---

# Code-drawn scenes

## Overview
A scene that looks good is mostly a scene with no wrong things in it. **Decide the camera, the light, the layout and the draw order as data before drawing, and prove the geometry with checks in code.** Build every element finished, then review zoomed-in until a whole pass finds nothing.

First-pass scenes rarely fail for lack of drawing skill. They fail because of:
- receding edges with no shared vanishing point
- floating or physically impossible objects
- wrong overlaps
- placeholder elements
- crammed or arbitrary placement

## Workflow
For a one-shot result, run this workflow in an **independent subagent** with a complete brief, and stay the reviewer yourself (briefing.md: brief shape, keeping it neutral, isolation). When the builder reports, run an **adversarial reviewer** with its own persona and checklist (reviewer.md), send its findings back to the builder, and repeat with a fresh reviewer until a round finds no blocker or major, or for three rounds.

0. **Art direction** (art-direction.md). Before building, offer the person the choice: with their references (images of the elements they want, images of the style and mood, pose references, a description of what matters), you compose them into a scene built to their vision; without them, you source openly licensed references (Wikimedia Commons, with credits) and define a clear art direction yourself, which will be more generic but still well directed. Suggest a voice brain dump for speed. Condense what they send into a short art-direction note and inventory, and confirm it with them before briefing the build.
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
4. **Light plan** (lighting.md). List every light source, natural and artificial. Give each one its cast light and its visible glow. Note the shadowed zones and how surfaces turn away from light.
5. **Draw order** (plausibility.md). Every element sits at a depth from the camera. Write a back-to-front list for the scene and for every compound object, including anything enclosed, contained or seen through something.
6. **Build.** Start from `scene-kit.js`: the world camera, projection helpers, boxes, lying-flat items, cylinders, tangent silhouettes, the lighting pipeline, scene checks, the mount loop.
   - Every point and size comes from one camera, so every receding edge shares the VP. For styles that want believable depth, the optional `world-kit.js` draws boxes, faces, cylinders, shadows and reflections from world coordinates and registers them with the checks (perspective.md). Skip it for flat or deliberately cheated perspective.
   - Register each element with the checks as you draw it: its bounds, what it rests on, what it joins, what it's inside, what each reflection draws (checks.md).
   - Every element is finished: specific subject, material, construction, attachment and story detail (detail.md).
   - Build figures from a skeleton before adding volume (figures.md). Use deterministic randomness only.
7. **Review loop** (review.md). What you report is the finished deliverable, so review it as if nobody else will. Run the checks at several animation times after every change, and fix every failure; use images for what code can't judge. Render over http and take a full-frame screenshot, then zoom region by region with the checklist. List every defect before fixing any. Re-render and re-check touched regions and their neighbours until a full pass is clean. Then do a final pass for anything plain, generic or duplicated.
8. **Report** what was verified, which taste choices were made, and the weak spots you tried and couldn't fix (with what you tried). Fix every defect you can before reporting; a known defect is not a compromise. Report this way so feedback goes to taste rather than correctness.

## Quick reference
| concern | rule |
|---|---|
| checks | register every element as drawn; `run()` asserts support, joins, depth order, reflections, text fit; run after every change, at several times |
| projection | one shared VP per axis family; back = front scaled toward VP; `k = (yBack−VP.y)/(yFront−VP.y)` |
| visible faces | an object left of the VP shows its right side, right of it its left; tops show below the horizon, undersides above |
| depth consistency | a deep top needs a deep ground footprint; nearer objects have lower ground contacts and larger scale |
| circles | horizontal circles become ellipses that open up the further they are from the horizon; cylinder bases are curved |
| rounded forms | silhouette = tangent from the VP to the profile curve; shade the swept curve as a band |
| contact | every element rests inside its support's top face, hangs from a visible attachment, or is planted in the ground |
| motion | about the real axis or pivot; gentle; independent phases |
| light | each source = cast light (light map, multiply) + visible glow (additive); faces turned away = own colour darkened |
| order | far → near from the camera; within an object: far faces → contents or enclosed elements → near faces and rims |
| spacing | focal points get clear margins; fill dead zones at eye level before the edges |
| finish | no placeholders, no duplicated motifs; every element specific |

## Common mistakes
- **Drawing first and adding perspective later.** Retrofitting depth moves everything. Write the ground-contact table first.
- **Applying perspective to the big pieces only.** Small items need it too: anything with a top, a side or a thickness, and every opening or recess.
- **Checking geometry by eye.** Contacts, attachments, depth order and reflections are class properties: a check finds every case, and finds the regressions a fix introduces. Images miss some cases every round.
- **Judging only the full frame.** Floating elements, outlines poking past rounded corners and back-limb lines drawn over front limbs only show at 4–5× zoom.
- **Fixing one defect and declaring done.** Every fix moves something; re-check the neighbours.
- **Placeholders.** Coloured blobs standing in for a real element, or the same drawing reused.
- **Light as decoration.** Glows with no cast light, cast light with no source, or neutral grey in shadows that should be the surface's own colour darkened.
