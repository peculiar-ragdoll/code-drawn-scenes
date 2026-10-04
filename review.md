# Review loop: look, list, fix, look again

You cannot judge a scene from its code. Render it and look at full size **and** zoomed into every region.

## Setup
- Serve the scene folder over http (`python3 -m http.server 8765`); headless browsers usually block `file://`.
- Let the scene accept `?dprMax=1`, and cap DPR in the mount, so screenshots don't time out.
- **Never review a stale render.** Simple static servers let browsers cache scripts, so a fix can look like it didn't work. Disable the cache (CDP `Network.setCacheDisabled`) or cache-bust the script URLs (`?v=Date.now()`) before every review screenshot and export.
- For video/GIF export, give the mount a manual mode that renders an exact time `t`. Capture frames at fixed steps (element screenshots), then assemble with ffmpeg: `palettegen`/`paletteuse` for GIF, `libx264 -crf 18` for MP4.
- Inspect regions with `zoom.html?src=scene.html&z=4&x=…&y=…` (x and y in zoomed pixels).
- For tiny details (faces, text, small props), crop and upscale the screenshot:
  `python3 -c "from PIL import Image; im=Image.open('s.png'); im.crop((x0,y0,x1,y1)).resize((W,H), Image.LANCZOS).save('crop.png')"`
- Give complex standalone pieces (characters, artworks, signage) their own preview page that draws them alone at 7–12×.

## Each pass
1. **Full frame:** composition, balance, dead or crowded zones, the focal point, the light mood.
2. **Region by region:** tile the frame into 6–9 regions and zoom into each. Walk the checklist and **write down every defect before fixing any.**
3. **Fix everything, then re-render.** Re-check the regions you touched and their neighbours, since fixes move things.
4. **Repeat until a full pass finds nothing.** Then do one more pass looking only for missing detail: anything plain, generic or duplicated.

## Checklist
- **Projection**
  - every receding edge runs to the shared VP(s): tops, sides, seams, ground lines, openings, small lying items
  - the visible sides match the element's position relative to the VP
  - ground contacts match each element's depth
  - horizontal circles are consistent ellipses, and cylinder bases are curved
- **Support and physics**
  - nothing floats (feet inside the support's top face); pads and cushions touch the seat they rest on, with no gap
  - legs and posts attach under the top, inside its footprint, including the back legs once they're shifted toward the VP; their tops are hidden by the top or apron
  - seated figures bend at the hip and knee; legs don't hang straight down from the seat
  - leaners lean against something adequate
  - rotations use real pivots
  - leg counts are correct
  - hanging things have attachments
- **Layering**
  - back-to-front order holds at every overlap. In the code, write the *logical* depth order (what is physically in front of what, including contents inside containers such as a bird behind its cage bars) next to the *actual* draw order, and fix every mismatch
  - back-limb or back-object details never draw over front ones
  - lips and rims pass in front of contents
  - highlights and outlines stay inside their shapes
- **Reflections and shadows**
  - everything above a reflective surface and in view appears in its reflection: sky, birds, smoke, mist, lights, signs, figures
  - every strong light casts shadows from everything that blocks it
- **Light**
  - every source has both cast light and a glow
  - shadowed faces use darkened own-colours
  - no straight cut-offs in glows
  - motion is gentle and unsynchronised
- **Spacing**
  - focal points, sources and openings have clear margins
  - decoration sits at eye level and in the empty middle, not crammed at the edges
  - nothing touches unintentionally
- **Finish**
  - no placeholders and no duplicates
  - every element has subject, material, construction, attachment and a story detail
  - text: every string is complete, legible, not mirrored, and not cut off by an occluder or its container
  - no famous landmark, mountain or brand the brief didn't ask for
  - figures: skeleton, weight and contact hold up (figures.md)

## Questions to ask before declaring done
- If someone zooms into any 200×200 px patch, is anything wrong, plain or placeholder-ish?
- Would the expert for each object (a carpenter, an architect, a botanist, a mechanic, an illustrator in that medium) find a mistake?
- Does anything look pasted on rather than lit by the scene?
