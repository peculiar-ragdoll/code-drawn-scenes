# Briefing: delegate the build to an independent agent

The brief is part of the recipe, alongside this skill. The strongest single-pass results came from a **subagent** given a short, complete brief and no one to ask:
- It can't hand questions back, so it makes its own decisions.
- It can't get feedback from anyone else, so it reviews itself: it renders, zooms, critiques and fixes in rounds until it's satisfied.
- It reports when it's finished, not when it's stuck.

A user-facing agent tends to stop early to show progress or ask, and it leans on the user as its reviewer. For a one-shot scene, give the build to a subagent. The main agent stays as reviewer and contact for the person.

## Shape of a good brief
1. **The deliverable, concretely:** the format (a scene folder: `scene.html` loading modules from `src/`, Canvas2D, no external assets), the logical size, DPR-awareness, scaling, the page contract (`?t=`, `?dprMax=`, `?check=1`; checks.md), and the exact output path.
2. **The scene, as an inventory:** the subject and its pose, every element the person wants (with counts where they matter), light sources, what lies beyond the main space, any creatures, and "gentle animation (things that would naturally move)". State the scene's size: a target number of major elements and of figures, so its difficulty is set on purpose. Leave the specific design choices to the agent.
3. **The quality bar, in one line:** "as high quality, detailed and correct as you can in one pass — this should look like a finished illustration, not a draft."
4. **Art direction and references:** the art-direction note (condensed from the person's brain dump, never the raw transcript), every reference path with what it's for (layout, likeness, style, pose: structure only), and the likeness level (art-direction.md). If the person gave none, the orchestrator sources openly licensed references and writes the art direction itself before briefing (art-direction.md); the build agent never invents the direction.
5. **Constraints:** no external images or libraries, plus anything private or off-limits ("read the reference photos; never copy them into the output or publish them").
6. **Independence:** "Do not ask questions; make sensible decisions."
7. **Finish line:** "Treat what you report as the final deliverable. Run the full review loop yourself, and fix every defect you find before reporting. A known defect is not a compromise. Keep the scene in modules and its state in NOTES.md (context.md), so the work could be continued from the folder alone." Don't mention the adversarial review (reviewer.md). The orchestrator runs it after the report.
8. **The report:** "Report briefly what you built, the check results, and as compromises only what you tried and couldn't fix, with what you tried." This makes it self-assess without giving it a way to leave defects it found unfixed, and the compromises give the main agent a head start on review.
9. **Isolation, when results must be clean:** tell it to read and write only inside its own folder, and either name the skill to use or forbid skills and other files. Then audit its tool calls afterwards. Agents read whatever is available: finished reference code, other skills, earlier outputs.

## Keep the brief neutral
The brief carries the person's scene and nothing else. Every element in it is something they asked for, or something
the orchestrator chose in the art direction. Leave out:
- examples or scene content from other builds, and defects seen in earlier runs. A named example reads as a
  suggestion, and that element starts turning up in every scene.
- checks the skill already covers. The builder has the skill; repeating a rule with a concrete case in it biases
  the build toward that case.

## After it reports
Run the adversarial review (reviewer.md) before showing it to the person. Treat the builder's compromises as the first items to check. Each round's findings go to a fix pass.

## Fix-pass brief
A fix pass is a fresh agent: many harnesses discard a subagent when it reports, and a fresh context is lighter anyway. The folder carries the state (context.md). Brief it like this, adding the original brief's constraints, port and isolation rules:

> The folder `<folder>` holds a code-drawn scene and an independent review of it. Continue the work from the folder alone.
> 1. Read `<skill>/SKILL.md`, then `NOTES.md`, `brief.md` and `review/round<N>/report.md` in the folder.
> 2. Fix the findings: blockers and majors first, then minors. Read only the modules and guides each finding needs. Where a finding conflicts with the brief or its art direction, don't fix it; say why.
> 3. Run `node <skill>/tools/render.mjs <folder> --times <times>` after the fixes. Fix every check failure and console error, then look at the full frame and the tiles for the regions you changed. Fixes move things, so re-check their neighbours.
> 4. Update `NOTES.md` (Checks, Open issues, Pass log) and `preview.png`.
> 5. Report: each finding fixed or not fixed (with why), anything else you changed, and the check results.
