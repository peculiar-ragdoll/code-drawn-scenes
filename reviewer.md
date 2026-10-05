# Adversarial review: a second pair of eyes with a mandate to find fault

Self-review finds the defects the builder already suspects. An independent reviewer finds the rest. Run one before
anything reaches the person.

## Who runs it
- **The orchestrator runs it, and the builder's brief doesn't mention it.** The builder should aim to ship a
  finished piece. Knowing a reviewer comes next invites it to stop early and leave the rest for the reviewer, and
  knowing the reviewer's list invites it to fix only what's on it. Don't claim the opposite either: leave the
  review out of the brief.
- **A fresh reviewer each round,** so it isn't anchored by its own earlier findings.
- The reviewer **never fixes anything**. Separating finding from fixing keeps it honest.

## The loop
1. When the builder reports, launch a reviewer with the persona below.
2. The reviewer returns its report as text, since subagents often can't write report files. The orchestrator saves
   it, and copies it with the reviewer's crops into the builder's folder.
3. Start a **fix pass**: a fresh agent with the fix-pass brief (briefing.md), which reads the state from the folder.
   Resuming the original builder also works where the harness allows it, but don't depend on it. Frame the findings
   honestly: "an independent review found these; fix them." The fix pass may decline a finding that conflicts with
   the brief, if it says why.
4. From round 2 on, the reviewer first does its own fresh pass. Then it reads the previous round's findings and
   marks each one fixed, not fixed or regressed.
5. **Stop** when a round finds no blocker or major, or when the round budget is spent. The default budget is two
   review rounds and two fix passes: build, review, fix, review, fix. After the last fix pass, its checks and its own
   review are the final verification. Run one more review only to measure the result.
6. **Watch the trend.** Record the counts for each round. If majors don't fall from round to round, more rounds won't
   fix it. Look at which class the findings belong to and add a check for it (checks.md), or fix the skill.

## The reviewer's persona (put this in its prompt)
> You are an exacting art director and a rendering engineer reviewing someone else's code-drawn scene. You treat
> nothing as correct until you've verified it, in the code or in the pixels. You judge it as a finished
> illustration. You are not here to be encouraging, and you don't pad the list: report only real defects. A short,
> accurate list beats a long one, and no majors is a valid result. You never fix anything. You report each defect
> with evidence, a severity and the rule it breaks.

Give it the scene path, the brief, the references, the skill folder, and `tools/render.mjs` for rendering (it picks
a free port and a fresh browser profile on its own). Don't give it the
builder's self-assessment or earlier review rounds until it has done its own pass, because they anchor it.

## Severity
- **blocker:** the scene fails as a whole: it doesn't render, it shows the wrong subject, or it breaks the brief.
- **major:** a viewer would notice it at normal viewing size in the full frame, or it's a geometric or physical
  error (it fails a check, or would fail one if the check existed).
- **minor:** visible only when zoomed in, or a matter of taste.

## What it checks: in the code
1. **Run the scene's checks** with `tools/render.mjs` at several animation times. Every failure is a defect, and so
   is a scene that doesn't expose its checks.
2. **Audit the checks themselves.** A check that never runs, or that reads different numbers from the drawing code,
   proves nothing. Elements that are drawn but not registered aren't checked. Report missing coverage as a finding,
   naming the class of defect it leaves open.
3. **Depth order against draw order,** where the checks don't cover it. Build two lists:
   - the *logical* depth order: what is physically nearer the camera, from the scene's geometry and physics,
     including the parts of each compound object and anything enclosed, contained or seen through something.
   - the *actual* draw order, from the code.

   Every pair whose order differs is a defect, unless an occlusion clip handles it.
4. **Reflections and shadows are complete.** For every reflective surface, list from the code every element above
   it that falls inside the reflected view, including thin, translucent, airborne and moving ones. Each one must
   appear in the reflection, mirrored about the surface's own height and correctly faded, distorted or broken up.
   Check the same for cast shadows from every strong light.
5. **The shared projection is used everywhere.** Look for hard-coded receding edges, ellipses, perspective, or fixed
   pixel sizes that bypass the camera.
6. **Light sources come in pairs.** Each source has both the light it casts and the glow it is.
7. **Motion is physical.** Rotations use real pivots, loops are seamless if they're meant to loop, phases are
   independent, and the randomness is deterministic.
8. **Text.** List every string drawn. Each must be complete, legible, not mirrored, not cut off by an occluder or
   its container (unless that's intended and still readable), and made of real words.

## What it checks: in the pixels
- Take a full frame, then tile the frame into regions and zoom each one to 3–5×. Check more than one moment of the
  animation.
- Judge what code can't: whether each element reads as what it is, separates from what's behind it, and looks
  finished. Walk review.md, plus figures.md for each figure.
- Look for **lookalikes**: a recognisable real-world landmark or brand the brief didn't ask for.

## Report format
A numbered list, most severe first. Each entry has:
- **severity:** blocker, major or minor
- **where:** region coordinates or code location
- **what is wrong and which rule it breaks**
- **evidence:** a crop path, a line reference or a failing check
- **the fix:** what a correct result would look like, but not the code for it

From round 2 on, add a section on the previous findings: each one marked fixed, not fixed or regressed. End with the
counts by severity.
