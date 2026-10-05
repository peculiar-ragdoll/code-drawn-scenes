# Lighting: light that is cast, not painted on

## Pipeline (per frame; bake static layers for production)
1. **Background:** sky, distant view, anything seen through openings.
2. **Scene layer:** drawn with base colours to its own canvas. Cut the openings so the background shows through.
3. **Light map** on a separate canvas, then **multiply** it over the scene layer:
   - fill with the ambient tint (night: dim desaturated violet or blue; day: near white with a sky-blue cast)
   - add each source's cast light as a soft pool (radial, or shaped like the opening it comes through) with `'lighter'`
4. **Visible glows**, additive (`'lighter'`): every emitting surface (thin emitters with `shadowBlur`), the sun or moon disc, specular reflections, particles in light beams.
5. **Atmosphere and vignette:** haze or light shafts for depth, then a multiply vignette.

## Rules
- **Each source appears twice:** the light it casts (a pool on the surfaces around it) and the light it is (its glow). A glow with no pool looks pasted on; a pool with no source looks like a mistake.
- **Temperature carries the mood.** Warm sources against cool fill, or the reverse. Overlapping pools mix on the surfaces between them.
- **Size and strength match the source.** A large, high source casts wide and strong; a small one casts a small pool; a row of small lights casts a row of small pools. A distant source (sun, moon) is a direction: a gradient across the scene plus cast shadows, not a pool.
- **Occlusion:**
  - Things in front of a light mask it (clip with the occluder's silhouette, evenodd).
  - Areas under overhangs, inside recesses and behind occluders get darker pools.
  - Faces turned away from every source use the surface's own colour darkened (×0.4–0.55), never neutral grey.
- **Rim light** separates a subject from a bright background: clip to the shape, then stroke its outline with a gradient centred on the source.
- **Light falling on a figure or face** comes from the source's position, fades smoothly and is masked by shape. It never cuts off in a straight line.
- **Reflections:** a reflective surface mirrors *every* element above it that falls inside the reflected view, not only the big shapes: thin, translucent, airborne and moving elements too. List them from the layer list rather than by eye. Mirror each one about the surface line, fade it with depth, and break it up with the surface's disturbance. A missing reflection of a moving element is easy to overlook and obvious once seen.
- **Shadows:** a soft contact shadow under every resting object (darker and tighter at the contact), longer cast shadows for strong directional light, all pointing away from the source.
- **Living light is gentle:** flickering sources flicker softly, steady ones breathe a few percent, electric ones hum with rare smooth dips, reflective surfaces glint, daylight shifts slowly. Each source runs on its own phase or seed so nothing pulses in sync.
