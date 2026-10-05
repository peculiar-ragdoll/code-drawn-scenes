# Context: work in passes that each fit in one context

A scene takes several passes: build, review, fix, review, fix. Each pass should fit comfortably in one agent's
context, and none should need the conversation of an earlier one. Many harnesses discard a subagent when it reports,
so every pass may start from nothing. Keep the state in files, read only what the current step needs, and keep few
images in view.

## The folder is the memory
The scene folder holds everything a fresh agent needs to continue:

```
scene.html          the page: loads the modules in order, mounts the scene
src/*.js            the scene in modules of a few hundred lines each (camera, sky, ground, each major element, light, motion)
NOTES.md            the state of the build (below)
review/roundN/      each review's report and crops, saved by the orchestrator
shots/              the latest renders from tools/render.mjs
```

Split by element, not by stage, so a fix touches one or two modules. Keep shared numbers (camera, palette, ground
heights, key positions) in one module that the others read, never duplicated.

## NOTES.md
Write it during the build and update it at the end of every pass. Keep it under about 150 lines, and replace stale
content rather than appending to it.

```markdown
# <scene name>: notes
## Brief in one paragraph
## Camera and units          VP, eye height, focal length, world units, frame size
## Layout                    each major element: module, world bounds, what it rests on
## Draw order                back to front, including the parts of compound elements
## Light                     each source: position, cast light, glow
## Motion                    what moves, about which pivot, period
## Decisions                 art-direction choices and why
## Checks                    which checks run, how many elements are registered, current result
## Open issues               known defects not yet fixed, most severe first
## Pass log                  one line per pass: what changed
```

## Read as you go
Don't load the whole skill at the start. Read `SKILL.md`, then the guide for the step in hand ("Read as you go" in
`SKILL.md`). A fix pass reads `NOTES.md`, the review report, the modules it will touch, and the guides those findings
cite. It doesn't need the rest.

## Image budget
Images take a lot of context.
- Render with `tools/render.mjs`. Its full frame is scaled down (0.8× by default), and its tiles and crops are zoomed.
- Look at the full frame once per pass, then at the tiles or crops for the regions in question, not all of them every
  time.
- Prefer text: check results, measured numbers and the draw-order list, before images.
- Once a region is fixed and re-rendered, stop looking at its old images.

## Fresh fix passes
A fix pass is a new agent with a short brief (briefing.md, "Fix-pass brief"). It reads `NOTES.md` and the latest
report, fixes the blockers and majors first and then the minors, re-runs `tools/render.mjs`, updates `NOTES.md`, and
reports. If the harness can resume the builder, resuming is fine but not needed: the files carry the state.
