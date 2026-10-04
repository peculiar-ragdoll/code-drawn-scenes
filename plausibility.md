# Plausibility: support, mechanics, construction, layering

Before drawing any element, answer: **what holds it up, what is it made of, how is it built, and what moves and around what?**

## Support and contact
- Everything is supported. Objects rest inside the top face of their support, at a depth within it. Feet touch the ground at the element's depth. Hanging things have a visible hook, cord, chain, nail, tape, pin or clip. Plants grow from soil; posts go into the ground.
- Legs attach under the top they hold up, inset from its edges, and the top or apron covers their upper ends. Check the back legs after perspective, because they shift toward the VP and can poke out past the sides.
- Cushions, pads and covers sit in contact with what they rest on, drawn from the support's top face, not floating above it.
- Real leg and support counts: tables have 4 legs (3 or a pedestal if round), chairs and stools 4, cabinets and benches 4 corners. The back ones appear shifted toward the VP and darker.
- Leaning things lean against something able to stop them: an object tall enough, a wall, a corner. They pivot about their bottom contact point.
- Contents go into containers: a stem into soil behind the pot's front lip, liquid inside the rim, a pole into its socket.

## Mechanics and axes
- Rotations use the real pivot:
  - a globe about the axis through its mount pins
  - a pendulum or hanging lamp about its suspension point
  - wheels, fans and windmills about their hubs
  - doors about their hinges
  - flags from their pole
  - trees from their trunk base
- Linkages stay connected: cables run between the things they connect, ropes sag under gravity, chains hang vertically.
- Anatomy and creatures: limbs are connected segments with joints in plausible places, hands and feet have a pose, and hybrid creatures have every part their kind needs.
- Built objects follow their real construction: instruments, vehicles, machines, architecture (doors fit frames, stairs have consistent risers, windows have sills and frames).
- Text on curved or turning surfaces follows the surface. Text that would read upside-down wraps out of view.

## Layering (draw order)
Write the back-to-front list before coding. A general template:
1. sky and far background
2. distant forms (hills, skyline)
3. back plane (walls, facades) and things flat on it
4. elements against the back plane
5. things on those elements
6. mid-ground elements
7. figures and creatures
8. foreground elements
9. light map
10. glows
11. atmosphere and vignette

Within compound objects: back faces → contents → front faces and lips. For example:
- a pot: body → rim top → soil → plant → front lip
- a seat: back → seat → inner arm faces → arm fronts → whoever sits in it
- a figure behind a glowing sign: the sign masked by the figure's silhouette
- crossed or overlapping limbs: the back limb's details are drawn before (or clipped inside) the back limb, never over the front one

## Overlaps
- Keep bounding boxes for wall-mounted items, items on surfaces and anything clustered. Nothing intersects unless intended, and intended overlaps are drawn with the correct occlusion.
- Highlights, outlines and trims follow the shape they belong to and are clipped to it. A straight highlight on a rounded edge pokes past the corner.
