# Checks: prove the geometry in code

Geometric correctness is a property of a whole class of things: every contact lies on its surface, every attachment
meets, every overlap follows depth. Looking at images catches some cases and misses others, and each fix round can
break something that was right. A check catches every case, every time it runs. So describe the scene as data while
drawing it, and assert its geometry in code. Use images for what code can't judge: readability, likeness, taste.

## Build in world coordinates
Place everything in metres with one camera (`SceneKit.camera(VP, eyeHeight, focal)`): x right, y up from the ground,
z away from the camera. Every point goes through the same `P(x, y, z)`, so receding edges share the vanishing point by
construction. Derive every size from `S(z)` (pixels per metre at that depth), including line widths, radii and contact
shadows. A fixed pixel size is wrong everywhere except at one depth.

## Register as you draw
`SceneKit.makeChecks(cam)` keeps a list of elements in draw order. Call `el(id, {...})` at the moment each element is
drawn, with what its geometry claims:

| field | the claim it makes |
|---|---|
| `box: [x0,y0,z0,x1,y1,z1]` | where it is in the world |
| `top: [x0,z0,x1,z1,y]` | it has a face others can rest on |
| `rests: {on, at}` | this contact point lies on that element's top face |
| `joins: [[p, q], …]` | these points coincide: an attachment, a linkage, two parts that meet |
| `inside: id` | it is enclosed or contained by that element |
| `overlapOk: [ids]` | these overlaps are intended |
| `mirror: {y, poly}`, `mirrored: [ids]` | a reflective surface, and what its reflection actually draws |
| `notMirrored: {id: reason}` | an element deliberately left out of a reflection, with the reason |
| `text: {str, font, maxW}` | this string fits its container |

Register compound objects as their parts (a far part, its contents, a near part), so their internal order is checked
too. Register each part where it's drawn, with the same numbers the drawing code uses. A check against separate,
hand-copied numbers proves nothing.

## What `run(ctx)` asserts
- **Support:** every contact lies on the top face it claims, at the face's height and within its footprint. This
  catches floating and sunken elements.
- **Joins:** every pair of points that should meet is within tolerance. This catches attachments that stop short or
  pass through.
- **Depth order:** where two elements overlap on screen, the one drawn later doesn't lie wholly behind the other,
  unless one is inside the other or the overlap is declared.
- **Reflections:** every element rising above a reflective surface whose mirror image lands on the surface is drawn in
  its reflection, or is excused with a reason.
- **Text:** every string fits its container.

Add scene-specific assertions the same way. Any rule that can be stated as numbers belongs here: proportions, ranges
of motion, clearances, light directions.

## Run it every time
- Run the checks at several animation times, because moving parts collide at some moments and not others. A manual
  mode (`?check=1&t=…`) that logs failures to the console works well.
- Run them after every change, not only at the end. A fix that breaks something elsewhere shows up immediately.
- A failing check is a defect. Fix the geometry, not the check. Declare an exemption (`overlapOk`, `notMirrored`) only
  when the exemption itself is correct.
- Report the check results along with the scene: how many elements are registered, which checks ran, how many failed.
