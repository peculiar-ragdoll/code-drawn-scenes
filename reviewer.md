# Adversarial review: a second pair of eyes with a mandate to find fault

Self-review finds the defects the builder already suspects. An independent reviewer finds the rest. Run one before anything reaches the person.

## Who runs it
- **The orchestrator runs it, and the builder's brief doesn't mention it.** The builder should aim to ship a
  finished piece. Knowing a reviewer comes next invites it to stop early and leave the rest for the reviewer, and
  knowing the reviewer's list invites it to fix only what's on it. Don't claim the opposite either: leave the
  review out of the brief.
- **The loop:** once the builder reports, launch the reviewer, send its findings back to
  the builder (continue the same agent so it keeps its context), and repeat. Stop when the reviewer finds nothing
  above "minor", or after three rounds. Present the findings honestly: "an independent review found these; fix them."
- The reviewer **never fixes anything**. Separating finding from fixing keeps it honest.

## The reviewer's persona (put this in its prompt)
> You are an exacting art director and a rendering engineer reviewing someone else's code-drawn scene. You assume
> it contains at least ten defects and your job is to find them. You are not here to be encouraging. You judge it
> as a finished illustration: anything wrong, implausible, plain or placeholder-like at any zoom level is a defect.
> You check the code as well as the pixels. You never fix anything. You report each defect with evidence, a
> severity and the rule it breaks.

Give it the scene path, the brief, the references, the skill folder, and its own port and browser. Don't give it the
builder's self-assessment until it has done its own pass, because that anchors it.

## What it checks: in the code
1. **Depth order against draw order.** Build two lists:
   - the *logical* depth order: what is physically nearer the camera, from the scene's geometry and physics,
     including the parts of each compound object and anything enclosed, contained or seen through something.
   - the *actual* draw order, from the code.

   Every pair whose order differs is a defect, unless an occlusion clip handles it.
2. **Reflections and shadows are complete.** For every reflective surface, list from the code every element above
   it that falls inside the reflected view, including thin, translucent, airborne and moving ones. Each one must
   appear in the reflection, mirrored about the surface line and correctly faded, distorted or broken up. Check the
   same for cast shadows from every strong light.
3. **The shared projection is used everywhere.** Look for hard-coded receding edges, ellipses or perspective that
   bypass the projection helpers.
4. **Light sources come in pairs.** Each source has both the light it casts and the glow it is.
5. **Motion is physical.** Rotations use real pivots, loops are seamless if they're meant to loop, phases are
   independent, and the randomness is deterministic.
6. **Text.** List every string drawn. Each must be complete, legible, not mirrored, not cut off by an occluder or
   its container (unless that's intended and still readable), and made of real words.

## What it checks: in the pixels
- Take a full frame, then tile the frame into regions and zoom each one to 3–5×. Check more than one moment of the
  animation.
- Walk every item in review.md, plus figures.md for each figure.
- Look for **lookalikes**: a recognisable real-world landmark or brand the brief didn't ask for.

## Report format
A numbered list, most severe first. Each entry has:
- **severity:** blocker, major or minor
- **where:** region coordinates or code location
- **what is wrong and which rule it breaks**
- **evidence:** a crop path or a line reference
- **the fix:** what a correct result would look like, but not the code for it
