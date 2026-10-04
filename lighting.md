# Lighting: light that is cast, not painted on

## Pipeline (per frame; bake static layers for production)
1. **Background:** sky, distant view, anything behind openings.
2. **Scene layer:** drawn with base colours to its own canvas. Cut openings (windows, doorways) so the background shows through.
3. **Light map** on a separate canvas, then **multiply** it over the scene layer:
   - fill with the ambient tint (night: dim desaturated violet or blue; day: near white with a sky-blue cast)
   - add each source's cast light as a soft pool (radial, or shaped for windows and doorways) with `'lighter'`
4. **Visible glows**, additive (`'lighter'`): bulbs, flames, screens, signage (tubes with `shadowBlur`), sun disc, reflections, sparkles, particles in light beams.
5. **Atmosphere and vignette:** fog, haze or god rays for outdoor depth, then a multiply vignette.

## Rules
- **Each source appears twice:** the light it casts (a pool on the surfaces around it) and the light it is (its glow). A glow with no pool looks pasted on; a pool with no source looks like a mistake.
- **Temperature carries the mood.** Warm sources (candles, bulbs, sunset) against cool fill (sky, screens, moonlight). Overlapping pools mix on the surfaces between them.
- **Size and strength match the source.** A ceiling bulb casts wide and strong; a screen medium and cool; small decorative lights many tiny pools. The sun is a direction: a gradient across the scene plus cast shadows, not a pool.
- **Occlusion:**
  - Things in front of a light mask it (clip with the occluder's silhouette, evenodd).
  - Areas under overhangs, inside boxes and behind furniture get darker pools.
  - Faces turned away from every source use the surface's own colour darkened (×0.4–0.55), never neutral grey.
- **Rim light** separates a subject from a bright background: clip to the shape, then stroke its outline with a gradient centred on the source.
- **Light falling on a figure or face** comes from the source's position, fades smoothly and is masked by shape. It never cuts off in a straight line.
- **Reflections:** a reflective surface mirrors *everything* above it that is in view: the sky and its birds, smoke, mist and fog, lights, signs and figures, as well as the big shapes. Mirror each one about the surface line, fade it with depth, and break it up with ripples. A missing reflection of a moving element is easy to overlook and obvious once seen.
- **Shadows:** a soft contact shadow under every resting object (darker and tighter at the contact), longer cast shadows for strong directional light, all pointing away from the source.
- **Living light is gentle:** flames flicker, bulbs breathe a few percent, signage hums with rare smooth dips, water glints, sunlight shifts slowly. Each source runs on its own phase or seed so nothing pulses in sync.
