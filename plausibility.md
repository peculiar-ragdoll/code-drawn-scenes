# Plausibility: support, mechanics, construction, layering

Before drawing any element, answer: **what holds it up, what is it made of, how is it built, and what moves and around what?**

## Support and contact
- Everything is supported. An element resting on another sits inside the support's top face, at a depth within it.
  Whatever touches the ground touches it at the element's own depth. Hanging things have a visible attachment.
  Growing things grow from their medium; anything planted goes into the ground.
- Legs and posts attach under the top they hold up, inset from its edges, and the top hides their upper ends. Check
  the back legs after perspective, because they shift toward the VP and can poke out past the sides.
- Soft layers (pads, covers, coverings) are in contact with what they rest on, drawn from the support's top face,
  not floating above it.
- Supports come in the count that would actually hold the object up. Four-cornered things have four, and the back
  ones appear shifted toward the VP and darker.
- Leaning things lean against something able to stop them, and pivot about their bottom contact point.
- Contents go into their containers, behind the container's near rim or wall.

## Mechanics and axes
- Rotations use the real pivot: the mount, axle, hub, hinge, suspension point or base the object actually turns on.
  Anything mounted turns about the axis its mount defines.
- Linkages stay connected: whatever connects two things runs between them, and slack lines sag under gravity.
- Anatomy and creatures: limbs are connected segments with joints in plausible places (figures.md), and hybrid
  creatures have every part their kind needs.
- Built objects follow their real construction: parts fit the parts they belong to, repeated parts are consistent,
  and openings have frames.
- Text on curved or turning surfaces follows the surface. Text that would read upside-down wraps out of view.

## Layering (draw order)
Every element sits at a depth from the camera, and the draw order must follow it. Write the back-to-front list before
coding. A general template:
1. sky and far background
2. distant forms
3. the back plane and anything flat on it
4. elements against the back plane
5. things on those elements
6. mid-ground elements
7. figures and creatures
8. foreground elements
9. light map
10. glows
11. atmosphere and vignette

Within a compound object, the parts are in depth order too: its far faces, then whatever it contains or encloses,
then its near faces and edges. That holds for any enclosure (an element seen through bars, mesh or a frame sits
between the enclosure's far and near parts), any container (its contents sit behind the near rim), and anything
seen through a transparent layer (drawn before the layer). For overlapping limbs, the far limb and its details are
drawn first and never over the near one.

## Overlaps
- Keep bounding boxes for clustered elements. Nothing intersects unless intended, and intended overlaps are drawn
  with the correct occlusion.
- Highlights, outlines and trims follow the shape they belong to and are clipped to it. A straight highlight on a
  rounded edge pokes past the corner.
