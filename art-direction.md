# Art direction: references decide whether it feels like *theirs*

Correctness can be checked, but whether the person loves the scene is subjective. That depends mostly on how well it
matches the picture in their head. The strongest results come from people who hand over:
- **images of the elements** (their things, corners of their space, pets, art on their walls, details that are "very them")
- **images of the style** they like
- **a detailed description** of what's where and what matters
- **a pose or composition reference** for the hard parts
- **taste notes** (what to avoid, what "good" means to them)

These are rarely pictures of the finished scene. They are its ingredients, and the agent's job is to compose them
into one believable scene.

Without that, even a flawless scene is a good guess: competent and correct, but more generic.

## Offer the choice before building
Before the build starts, the orchestrator (the agent talking to the person) offers this in one short message:

> I can build this two ways. **With your references:** send me images of the elements you want in it (objects, corners
> of your space, things that are very you), images of the style or mood you like, pose or composition references,
> and a description of what matters (what goes where, colours, the details that make it yours). I'll compose them
> into a scene built to your vision. **Without them:** I'll build my best interpretation from the brief. It'll be well made, but more generic, and we'll likely go a few rounds to steer it.
> Which would you like? (You can also send some now and more later.)

If the person has already supplied rich references, skip the offer and confirm what you received instead:
"Got 3 photos of your things, a style image, a pose reference and your description. Building to those."

## What each kind of reference gives
| reference | gives the build | how to use it |
|---|---|---|
| images of the elements (objects, corners of a space, details) | signature objects, materials, palette, clutter level, how things are arranged in real life | inventory and composition: the agent places them into one scene and redraws them in its style, without tracing |
| photos of the person, pets or things | identifying traits (hair, glasses, tattoos, silhouette) | stylised likeness; ask how close it should be; keep private |
| style or mood images | medium, line weight, palette, lighting mood, texture | choose the rendering approach and palette from them |
| pose or composition reference | proportions and how a hard pose actually works | structure only; never trace or embed (stock images are often watermarked or licensed) |
| written description | priorities, story, must-haves, must-avoids | the inventory's "why"; settles conflicts between images |
| existing art or brand assets (logos, prints) | motifs to reuse exactly | trace or vectorise only what they own |

## Turning references into direction
- **Extract, then confirm.** Write a short art-direction note:
  - style
  - palette
  - lighting mood
  - likeness level
  - signature objects
  - must-haves and must-avoids

  Show it to the person before the build. Three lines they can correct are cheaper than a rebuilt scene.
- **No style chosen yet?** Offer two or three quick style probes: small renders of the same corner in different
  treatments, such as flat vector, lamplit vector or print-like. Let them pick before the full build.
- **Likeness level is a question, not a guess.** Ask whether the person should be recognisable or a stylised nod.
  Many people prefer the general vibe over exact likeness.
- **Privacy:** personal photos are reference material only. Keep them local, never publish, upload or embed them,
  and note this in the brief.

## Passing direction to a build agent
Give the subagent:
- every reference path
- what each reference is for
- the art-direction note
- the likeness level
- the privacy rule ("read these images for reference; never copy them into the output or publish them")

A subagent can't ask the person, so anything left unsaid becomes its best guess.
