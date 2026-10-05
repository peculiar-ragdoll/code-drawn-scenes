// scene-kit.js — a small Canvas2D toolkit for code-drawn illustrated scenes.
// Copy into the project and adapt. Everything is in one logical coordinate space (e.g. 1600×900);
// the mount scales it to device pixels. Sections: projection, primitives, lighting pipeline, mount.
(function () {
  const TAU = Math.PI * 2;

  // ---------- deterministic randomness (never Math.random in drawing code: frames must be stable) ----------
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  // ---------- paint helpers ----------
  const lin = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
  const rad = (c, x, y, r0, r1, st) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); return `rgb(${((n >> 16) & 255) * f | 0},${((n >> 8) & 255) * f | 0},${(n & 255) * f | 0})`; };
  const poly = (c, pts, fill) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } };

  // ---------- one-point perspective ----------
  // The frontal reference plane has scale 1. VP sits on the horizon (the viewer's eye height). Any standing element
  // is described by where its FRONT and BACK touch the ground (screen y). Its back is its front scaled toward
  // VP by k = (yBack - VP.y) / (yFront - VP.y). Anything at an intermediate depth t∈[0,1] uses depthScale(k, t)
  // (depth is linear in 1/scale, not in scale).
  function makeView(VP, FLOOR) {
    const toVP = (x, y, k) => [VP.x + (x - VP.x) * k, VP.y + (y - VP.y) * k];
    const kOf = (yBack, yFront) => (yBack - VP.y) / (yFront - VP.y);
    const depthScale = (k, t) => 1 / (1 + t * (1 / k - 1));
    // which vertical side of an object is visible: objects left of VP show their right side, and vice versa
    const visibleSide = (xLeft, xRight) => (xRight < VP.x ? 'right' : xLeft > VP.x ? 'left' : 'none');
        return { VP, FLOOR, toVP, kOf, depthScale, visibleSide };
  }

  // A box (anything with flat faces): front face rect, its top (if below the horizon) or underside
  // (if above), and the one visible side. Draw order inside: side, top, front. Returns the projected back corners for further detailing.
  function box(c, V, { x0, x1, yTop, yBot, k, front, top, side }) {
    const [bx0, byT] = V.toVP(x0, yTop, k), [bx1] = V.toVP(x1, yTop, k), [, byB] = V.toVP(x0, yBot, k);
    const vis = V.visibleSide(x0, x1);
    if (vis === 'right' && side) poly(c, [[x1, yTop], V.toVP(x1, yTop, k), V.toVP(x1, yBot, k), [x1, yBot]], side);
    if (vis === 'left' && side) poly(c, [[x0, yTop], V.toVP(x0, yTop, k), V.toVP(x0, yBot, k), [x0, yBot]], side);
    if (yTop > V.VP.y && top) poly(c, [[x0, yTop], [x1, yTop], [bx1, byT], [bx0, byT]], top);
    if (yTop < V.VP.y && top) poly(c, [[x0, yBot], [x1, yBot], V.toVP(x1, yBot, k), [bx0, byB]], top); // underside above eye level
    if (front) { c.fillStyle = front; c.fillRect(x0, yTop, x1 - x0, yBot - yTop); }
    return { bx0, bx1, byT, byB };
  }

  // A horizontal circle (any circle lying flat): its vertical radius is foreshortened.
  // ry = rx * foreshorten(y). Calibrate `perPx` once per scene so it matches how deep the ground recedes.
  const foreshorten = (V, y, perPx = 0.00045) => clamp((y - V.VP.y) * perPx, 0, 0.6);

  // A cylinder (anything round in plan): body from rim to base, elliptical rim on top, curved base.
  // Draw: body, rim top (lit), opening (dark), CONTENTS, then the rim's front lip over the contents.
  function cylinder(c, V, { x, yRim, yBase, rTop, rBot, body, rim, inside }) {
    const ryT = rTop * foreshorten(V, yRim), ryB = rBot * foreshorten(V, yBase);
    c.fillStyle = body; c.beginPath(); c.moveTo(x - rTop, yRim); c.lineTo(x - rBot, yBase); c.ellipse(x, yBase, rBot, ryB, 0, Math.PI, 0, true); c.lineTo(x + rTop, yRim); c.closePath(); c.fill();
    c.fillStyle = rim; c.beginPath(); c.ellipse(x, yRim, rTop, ryT, 0, 0, TAU); c.fill();
    if (inside) { c.fillStyle = inside; c.beginPath(); c.ellipse(x, yRim + ryT * 0.1, rTop * 0.88, ryT * 0.78, 0, 0, TAU); c.fill(); }
    return { ryT, lip: () => { c.fillStyle = rim; c.beginPath(); c.moveTo(x - rTop, yRim); c.ellipse(x, yRim, rTop, ryT, 0, Math.PI, 0, true); c.lineTo(x + rTop, yRim + 3); c.ellipse(x, yRim + 3, rTop, ryT, 0, 0, Math.PI); c.closePath(); c.fill(); } };
  }

  // Something thin lying flat ON a surface: front edge toward us, its top receding to VP,
  // the visible end showing on the side away from VP. kf = how far back it sits (1 = at the surface's front plane),
  // kb = its own depth. A thing stacked on another must have its bottom INSIDE the lower thing's top face.
  function lyingFlat(c, V, { x0, x1, yb, h, kf = 1, kb, front, top, end }) {
    const F = (x, y) => V.toVP(x, y, kf), B = (x, y) => V.toVP(x, y, kf * kb);
    const [ax, ay] = F(x0, yb - h), [bx, by] = F(x1, yb - h), [, cy] = F(x1, yb), [dx, dy] = F(x0, yb);
    const vis = V.visibleSide(ax, bx);
    if (vis === 'right') poly(c, [[bx, by], B(x1, yb - h), B(x1, yb), F(x1, yb)], end);
    if (vis === 'left') poly(c, [[ax, ay], B(x0, yb - h), B(x0, yb), [dx, dy]], end);
    poly(c, [[ax, ay], [bx, by], B(x1, yb - h), B(x0, yb - h)], top);
    c.fillStyle = front; c.fillRect(ax, ay, bx - ax, cy - ay);
    return { topBack: B(x0, yb - h)[1], topFront: ay }; // a thing resting on this one sits with its foot in [topBack, topFront]
  }

  // Rounded-profile extrusion (any body with a curved cross-section): the silhouette between the front and back copies of
  // a corner is the TANGENT from VP to the corner circle, not a line between corner endpoints.
  function tangentAngle(V, cx, cy, r, side /* -1 or 1 */) { const a = Math.atan2(V.VP.y - cy, V.VP.x - cx), d = Math.hypot(V.VP.x - cx, V.VP.y - cy); return a + side * Math.acos(r / d); }

  // An outlined tube (limb, cable, rope, pipe, branch): stroke wide in ink, then narrower in fill.
  function tube(c, pts, wOut, wIn, fill, ink = '#1e1a22') { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = ink; c.lineWidth = wOut; c.stroke(); c.strokeStyle = fill; c.lineWidth = wIn; c.stroke(); }

  // A tapered branch/stem along a polyline.
  function taper(c, pts, w0, w1, fill) {
    const L = [], R = [];
    pts.forEach((p, i) => { const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], n = Math.hypot(dx, dy) || 1, w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2; L.push([p[0] - dy / n * w, p[1] + dx / n * w]); R.push([p[0] + dy / n * w, p[1] - dx / n * w]); });
    poly(c, [...L, ...R.reverse()], fill);
  }

  // ---------- lighting pipeline ----------
  // 1. background (sky, view through openings) first; 2. scene layer with base colours, openings clearRect'd;
  // 3. light map = ambient fill + additive pools for every light source, multiplied over the scene layer;
  // 4. glows with 'lighter' (every emitter, thin ones with shadowBlur, specular glints, particles in light);
  // 5. vignette multiply. Every light source appears in BOTH the light map (the light it casts) and the
  // emissive pass (the light it is). Occluders between a light and a surface get a mask or a darker pool.
  function lightMap(L, W, H, k, ambient, pools) {
    L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'source-over'; L.fillStyle = ambient; L.fillRect(0, 0, L.canvas.width, L.canvas.height);
    L.setTransform(k, 0, 0, k, 0, 0); L.globalCompositeOperation = 'lighter';
    pools.forEach(([x, y, r, rgb, a]) => { L.fillStyle = rad(L, x, y, 0, r, [[0, `rgba(${rgb},${a})`], [1, `rgba(${rgb},0)`]]); L.fillRect(x - r, y - r, r * 2, r * 2); });
    L.globalCompositeOperation = 'source-over';
  }
  function glow(c, x, y, r, rgb, a) { c.fillStyle = rad(c, x, y, 0, r, [[0, `rgba(${rgb},${a})`], [1, `rgba(${rgb},0)`]]); c.fillRect(x - r, y - r, r * 2, r * 2); }
  // Gentle flicker for light sources: slow hum plus an occasional smooth dip to ~80%; give each source its own seed
  // and period so no two pulse in sync.
  function flickerLevel(t, seed, period) {
    const n = Math.floor((t + seed * 2.3) / period), u = (t + seed * 2.3) - n * period, len = 0.9;
    let v = 0.965 + 0.02 * Math.sin(t * 1.1 + seed * 5) + 0.01 * Math.sin(t * 2.7 + seed * 3);
    if (hash(n * 7.1 + seed * 17) > 0.5 && u < len) { const f = u * 9, k = Math.floor(f), e = f - k, s = e * e * (3 - 2 * e), a = hash(n * 13 + k + seed * 31), b = hash(n * 13 + k + 1 + seed * 31); v -= (0.04 + 0.16 * (a + (b - a) * s)) * Math.sin(Math.PI * u / len); }
    return v;
  }

  // ---------- world camera (pinhole, one-point) ----------
  // World units are metres: x right, y up from the ground, z away from the camera (z > 0). Every point goes through the
  // same P, so receding edges share the VP by construction. S(z) is pixels per metre at depth z: derive every size from
  // it (line widths, radii, contact shadows), never from fixed pixels.
  function camera(VP, eyeH, f) {
    const P = (x, y, z) => [VP.x + f * x / z, VP.y + f * (eyeH - y) / z];
    return { VP, eyeH, f, P, S: z => f / z };
  }

  // ---------- scene checks (checks.md) ----------
  // Register each element as you draw it, in draw order, then run() to get a list of failures. reset() every frame.
  //   box: [x0,y0,z0,x1,y1,z1]   world bounds
  //   top: [x0,z0,x1,z1,y]        a face other elements can rest on
  //   rests: {on, at:[x,y,z]}     a contact point that must lie on that element's top face
  //   joins: [[p, q], ...]        world points that must coincide (attachments, linkages, parts that meet)
  //   inside: id                  enclosed or contained by id (exempt from the depth check against it)
  //   overlapOk: [ids]            intended overlaps, exempt from the depth check
  //   mirror: {y, poly}           a reflective surface at height y; poly = its screen polygon
  //   mirrored: [ids]             what this surface's reflection actually draws; notMirrored: {id: reason}
  //   text: {str, font, maxW}     a string that must fit its container
  function makeChecks(cam, tol = 0.01) {
    let els = [], byId = {};
    const el = (id, d) => { const e = Object.assign({ id, i: els.length }, d); els.push(e); byId[id] = e; return e; };
    const sbox = b => { const p = []; for (const x of [b[0], b[3]]) for (const y of [b[1], b[4]]) for (const z of [b[2], b[5]]) p.push(cam.P(x, y, z));
      const xs = p.map(q => q[0]), ys = p.map(q => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
    const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3], r3 = v => +v.toFixed(3);
    function run(c) {
      const f = [];
      for (const e of els) {
        if (e.rests) { const s = byId[e.rests.on], [x, y, z] = e.rests.at, t = s && s.top;
          if (!t) f.push(`${e.id}: rests on ${e.rests.on}, which has no top face`);
          else if (Math.abs(y - t[4]) > tol || x < t[0] - tol || x > t[2] + tol || z < t[1] - tol || z > t[3] + tol)
            f.push(`${e.id}: contact (${[x, y, z].map(r3).join(', ')}) is not on ${s.id}'s top face (${t.map(r3).join(', ')})`); }
        (e.joins || []).forEach(([p, q], j) => { const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); if (d > tol) f.push(`${e.id}: join ${j} is ${d.toFixed(3)} m apart`); });
        if (e.text && c) { c.save(); c.font = e.text.font; const w = c.measureText(e.text.str).width; c.restore(); if (w > e.text.maxW) f.push(`${e.id}: "${e.text.str}" is ${w.toFixed(1)} px wide, container ${e.text.maxW}`); }
      }
      // draw order against depth: where two elements overlap on screen, the one drawn later must not lie wholly behind
      for (const a of els) for (const b of els) {
        if (!a.box || !b.box || a.i >= b.i || b.inside === a.id || a.inside === b.id) continue;
        if ((a.overlapOk || []).includes(b.id) || (b.overlapOk || []).includes(a.id) || !hit(sbox(a.box), sbox(b.box))) continue;
        if (b.box[2] > a.box[5] + tol) f.push(`${b.id} is drawn over ${a.id} but lies wholly behind it`);
      }
      // reflections: everything rising above a reflective surface whose mirror image lands on it must be drawn there
      for (const s of els) if (s.mirror) {
        const { y: h, poly } = s.mirror, xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
        const pb = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
        for (const e of els) {
          if (e === s || !e.box || e.box[4] <= h + tol || (s.mirrored || []).includes(e.id) || (s.notMirrored || {})[e.id]) continue;
          const m = [e.box[0], 2 * h - e.box[4], e.box[2], e.box[3], 2 * h - Math.max(e.box[1], h), e.box[5]];
          if (hit(sbox(m), pb)) f.push(`${e.id}: its reflection falls on ${s.id} but isn't drawn there`);
        }
      }
      return f;
    }
    return { el, run, reset: () => { els = []; byId = {}; }, get: id => byId[id], sbox };
  }

  // ---------- page contract (checks.md) ----------
  // ?t=<seconds> holds one moment, ?dprMax=<n> caps the pixel ratio, ?check=1 runs the checks into window.__sceneChecks.
  function params() {
    const q = new URLSearchParams(location.search), num = k => (q.has(k) ? +q.get(k) : undefined);
    return { t: num('t'), dprMax: num('dprMax'), check: q.get('check') === '1' };
  }

  // ---------- mount ----------
  // drawScene(ctx, lightCtx, t, k) draws one full frame in logical units. Options: dprMax (cap for heavy scenes and
  // screenshots), fps, t (draw that one moment and hold still), checks + check (after drawing, store
  // checks.run(ctx) in window.__sceneChecks). Pass {...SceneKit.params(), checks} to follow the page contract.
  // Exposes canvas.dataset.ms (frame cost) so the review loop can watch performance.
  // Production: bake static layers once to offscreen canvases and redraw only what moves.
  function mount(canvas, W, H, drawScene, o = {}) {
    const c = canvas.getContext('2d'), Lc = document.createElement('canvas'), L = Lc.getContext('2d');
    let k = 1;
    function size() { const dpr = Math.min(o.dprMax || 2, window.devicePixelRatio || 1), w = Math.round(canvas.getBoundingClientRect().width * dpr) || W, h = Math.round(w * H / W); canvas.width = Lc.width = w; canvas.height = Lc.height = h; k = w / W; }
    size(); window.addEventListener('resize', size);
    const frame = t => { const t0 = performance.now(); if (o.checks) o.checks.reset(); drawScene(c, L, t, k); canvas.dataset.ms = Math.round(performance.now() - t0);
      if (o.check && o.checks) window.__sceneChecks = o.checks.run(c); };
    if (o.t !== undefined) { frame(o.t); window.addEventListener('resize', () => frame(o.t)); return; }
    let last = -1;
    (function loop(now) { const t = now / 1000; if (t - last > 1 / (o.fps || 30)) { last = t; frame(t + 40); } requestAnimationFrame(loop); })(0);
  }

  window.SceneKit = { TAU, hash, mulberry, clamp, lin, rad, shade, poly, makeView, box, foreshorten, cylinder, lyingFlat, tangentAngle, tube, taper, lightMap, glow, flickerLevel, camera, makeChecks, params, mount };
})();
