# Briefing: delegate the build to an independent agent

The brief is part of the recipe, alongside this skill. The strongest single-pass results came from a **subagent** given a short, complete brief and no one to ask:
- It can't hand questions back, so it makes its own decisions.
- It can't get feedback from anyone else, so it reviews itself: it renders, zooms, critiques and fixes in rounds until it's satisfied.
- It reports when it's finished, not when it's stuck.

A user-facing agent tends to stop early to show progress or ask, and it leans on the user as its reviewer. For a one-shot scene, give the build to a subagent. The main agent stays as reviewer and contact for the person.

## Shape of a good brief
1. **The deliverable, concretely:** the format (one self-contained HTML file, Canvas2D), the logical size, DPR-awareness, scaling, and the exact output path.
2. **The scene, as an inventory:** the subject and its pose, every furniture piece and prop, the number of wall pieces, light sources, the view outside, any creatures, and "gentle animation (things that would naturally move)". Leave the specific design choices to the agent.
3. **The quality bar, in one line:** "as high quality, detailed and correct as you can in one pass — this should look like a finished illustration, not a draft."
4. **Art direction and references:** the art-direction note, every reference path with what it's for (layout, likeness, style, pose: structure only), and the likeness level (art-direction.md). If there are no references, say so, so the agent knows it's making the creative calls.
5. **Constraints:** no external images or libraries, plus anything private or off-limits ("read the reference photos; never copy them into the output or publish them").
6. **Independence:** "Do not ask questions; make sensible decisions."
7. **The report:** "report briefly what you built and any compromises you made". This makes it self-assess, and it lists its known weak spots, which gives the main agent a head start on review.
8. **Isolation, when results must be clean:** tell it to read and write only inside its own folder, and either name the skill to use or forbid skills and other files. Then audit its tool calls afterwards. Agents read whatever is available: finished reference code, other skills, earlier outputs.

## The brief that produced a strong single-pass result (verbatim)
> Build a single self-contained HTML file containing an animated Canvas2D illustration (logical size 1600x900, DPR-aware, scales to the window width) and save it to `<out>/scene.html` (create the folder).
>
> The scene: a cozy evening study, lofi illustration style, warm lamplight against a dusky blue window. Contents:
> - a person (front-facing, stylised) reading a book in an armchair, roughly centred
> - a desk on one side with a laptop and a desk lamp, a chair or stool at the desk
> - a low bookshelf full of books
> - a tall floor plant in a pot
> - a desk globe on a small round side table
> - a rug, a coffee mug on a small table near the armchair
> - at least 5 distinct pieces of wall art, string lights, a window with night sky
> - a black cat somewhere
> - gentle animation (things that would naturally move)
>
> Make it as high quality, detailed and correct as you can in one pass — this should look like a finished illustration, not a draft. Do not use external images or libraries. When done, report briefly what you built and any compromises you made. Do not ask questions; make sensible decisions.

This brief had no references, so the agent made every creative call; with references, add them as in step 4.
The subagent had this skill available. It used about 45 tool calls, ran three self-review rounds with zoomed crops, and took roughly 40 minutes.

What it got right:
- one shared vanishing point, with furniture tops correctly in depth
- cast light: a pool for every source, glows on top, a moonlit window
- every element distinct and specific, with gentle independent animation

What a reviewer still caught:
- the stool cushion floated above the seat
- the desk's back legs poked past the sides of the top
- the seated figure's legs hung straight down, with no knee bend

All three are contact and anatomy checks, now part of the review checklist.

## After it reports
Review the result yourself, using review.md, before showing it to the person. Treat the agent's "compromises" list as the first items to check. Then send it one round of fixes, or fix them directly.
