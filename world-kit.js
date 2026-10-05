// world-kit.js — OPTIONAL perspective helper for code-drawn scenes (see perspective.md, "World helper").
// Use it when the art direction wants believable depth. Skip it for styles that are flat, deliberately cheat
// perspective, or use their own projection; nothing else in the skill depends on it.
//
// Everything is placed in world units (metres): x right, y up from the ground, z away from the camera. Draw with these
// functions and you get, by construction: one shared vanishing point, the correct visible faces, exact ellipses at
// any height, sizes that shrink with depth, shading from each face's orientation, cast shadows, complete reflections
// (the mirror pass redraws whatever you hand it), and automatic registration with SceneKit.makeChecks.
(function () {
  const TAU = Math.PI * 2;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  // Newell's method: the normal of a planar polygon wound counter-clockwise as seen from outside points outward.
  function normalOf(pts) {
    const n = [0, 0, 0];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length];
      n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]); }
    return norm([-n[0], -n[1], -n[2]]); // world axes are left-handed (z away from the viewer), hence the flip
  }
  function hull(pts) { // convex hull of screen points (monotone chain)
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }

  // ---------- cameras ----------
  // Pinhole: the viewer's eye is at (0, eyeH, 0) looking along +z; VP is where the eye's line of sight hits the screen.
  const pinhole = (VP, eyeH, f) => ({
    P: (x, y, z) => [VP.x + f * x / z, VP.y + f * (eyeH - y) / z],
    S: p => f / p[2], toEye: p => [-p[0], eyeH - p[1], -p[2]], depth: p => p[2], VP, eyeH, f });
  // Parallel (isometric, oblique, side-on): screen = origin + x·X + y·Y + z·Z. Nothing converges, consistently.
  // `view` is the world direction the camera looks along (computed if omitted, looking down rather than up).
  function parallel({ origin, X, Y, Z, view }) {
    if (!view) { const r = [X[0], Y[0], Z[0]], s = [X[1], Y[1], Z[1]];
      view = [r[1] * s[2] - r[2] * s[1], r[2] * s[0] - r[0] * s[2], r[0] * s[1] - r[1] * s[0]]; if (view[1] > 0) view = view.map(v => -v); }
    const v = norm(view), k = Math.hypot(X[0], X[1]);
    return { P: (x, y, z) => [origin[0] + x * X[0] + y * Y[0] + z * Z[0], origin[1] + x * X[1] + y * Y[1] + z * Z[1]],
      S: () => k, toEye: () => [-v[0], -v[1], -v[2]], depth: p => dot(p, v) };
  }
  // x runs down-right, z recedes up-right, y is up: the viewer sees the front, the right side and the top.
  const isometric = (origin, s) => parallel({ origin, X: [s * 0.866, s * 0.5], Y: [0, -s], Z: [s * 0.866, -s * 0.5] });

  // ---------- the drawing helper ----------
  // create({camera, checks?, light?: {dir:[x,y,z]} | {pos:[x,y,z]}, ambient?})
  // Fills may be a colour or a function of the face: f => colour, where f = {normal, lit (0..1), depth}. Use the
  // function form for flat-ink styles (pick an ink by f.lit) and SceneKit.shade for painterly ones.
  function create({ camera: cam, checks = null, light = { dir: [0.4, -1, 0.6] }, ambient = 0.35 }) {
    let mir = null; // {h, surface} while inside a mirror pass
    const M = p => (mir ? [p[0], 2 * mir.h - p[1], p[2]] : p);
    const P = p => cam.P(p[0], p[1], p[2]);
    const litOf = (n, p) => { const L = light.pos ? norm(sub(light.pos, p)) : norm(light.dir.map(v => -v)); return Math.max(0, dot(n, L)); };
    const colour = (fill, n, p) => (typeof fill === 'function' ? fill({ normal: n, lit: ambient + (1 - ambient) * litOf(n, p), depth: cam.depth(p) }) : fill);
    const reg = (id, d) => { if (!checks || !id) return; if (mir) { const m = mir.surface.mirrored; if (!m.includes(id)) m.push(id); } else checks.el(id, d); };
    const poly = (c, sp, fill) => { if (sp.length < 2) return; c.beginPath(); sp.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.fillStyle = fill; c.fill(); };

    // A planar polygon, wound counter-clockwise as seen from its front. cull: draw only if the front faces the camera.
    function face(c, pts, fill, { id, cull = false, extra = {} } = {}) {
      let w = pts.map(M); if (mir) w = w.reverse();
      const n = normalOf(w), facing = dot(n, cam.toEye(w[0])) > 0;
      if (cull && !facing) return false;
      poly(c, w.map(P), colour(fill, facing ? n : n.map(v => -v), w[0]));
      if (id) { const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]), zs = pts.map(q => q[2]);
        reg(id, Object.assign({ box: [Math.min(...xs), Math.min(...ys), Math.min(...zs), Math.max(...xs), Math.max(...ys), Math.max(...zs)] }, extra)); }
      return facing;
    }
    // A box from world bounds. fills: {front, back, left, right, top, bottom} or {all}; only faces turned toward the
    // camera are drawn. Registers {box, top} with the checks under `id`, so others can rest on its top.
    function box(c, id, b, fills, extra = {}) {
      const [x0, y0, z0, x1, y1, z1] = b, F = k => fills[k] || fills.all;
      const faces = {
        front: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], back: [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]],
        right: [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], left: [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]],
        top: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], bottom: [[x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [x1, y0, z0]] };
      for (const k in faces) if (F(k)) face(c, faces[k], F(k), { cull: true });
      reg(id, Object.assign({ box: b, top: [x0, z0, x1, z1, y1] }, extra));
    }
    // Projected points of a horizontal circle; exact at any height (its near arc bows up above eye level, down below).
    const circle = (x, y, z, r, n = 48) => Array.from({ length: n }, (_, i) => P(M([x + r * Math.cos(i / n * TAU), y, z + r * Math.sin(i / n * TAU)])));
    // A vertical cylinder or cone frustum: silhouette from the projected rims, plus whichever end faces the camera.
    function cylinder(c, id, { x, z, y0, y1, r0, r1 = r0, body, top, bottom, n = 48, extra = {} }) {
      const lo = circle(x, y0, z, r0, n), hi = circle(x, y1, z, r1, n);
      poly(c, hull(lo.concat(hi)), colour(body, [0, 0, -1], M([x, (y0 + y1) / 2, z - r0])));
      const eyeAbove = p => dot([0, mir ? -1 : 1, 0], cam.toEye(M(p))) > 0;
      if (top && eyeAbove([x, y1, z])) poly(c, hi, colour(top, [0, 1, 0], M([x, y1, z])));
      if (bottom && !eyeAbove([x, y0, z])) poly(c, lo, colour(bottom, [0, -1, 0], M([x, y0, z])));
      reg(id, Object.assign({ box: [x - Math.max(r0, r1), y0, z - Math.max(r0, r1), x + Math.max(r0, r1), y1, z + Math.max(r0, r1)], top: [x - r1, z - r1, x + r1, z + r1, y1] }, extra));
      return { lo, hi };
    }
    const path = pts => pts.map(p => P(M(p)));                         // project a polyline for your own stroke or fill
    const px = (metres, p) => metres * cam.S(M(p));                   // a world size in pixels at point p: line widths, radii
    const onPlane = (o, u, v) => (s, t) => P(M([o[0] + s * u[0] + t * v[0], o[1] + s * u[1] + t * v[1], o[2] + s * u[2] + t * v[2]]));
    // Shadow of world points on the plane y = h, from light.pos (point) or light.dir (distant).
    function shadowPts(pts, h = 0) {
      return pts.map(p => { if (light.pos) { const L = light.pos, t = (L[1] - h) / (L[1] - p[1]); return [L[0] + (p[0] - L[0]) * t, h, L[2] + (p[2] - L[2]) * t]; }
        const d = light.dir, t = (p[1] - h) / -d[1]; return [p[0] + d[0] * t, h, p[2] + d[2] * t]; });
    }
    function shadowBox(c, b, fill, h = b[1]) {
      const [x0, y0, z0, x1, y1, z1] = b, corners = []; for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) corners.push([x, y, z]);
      poly(c, hull(path(shadowPts(corners, h))), fill);
    }
    // Reflection: redraw `draw` through a camera mirrored about the plane y = h, clipped to the surface outline
    // (world points on that plane). Every element drawn inside is recorded as mirrored, so the checks can verify the
    // reflection is complete. tint: {fill, alpha} laid over the reflection for depth and the surface's own colour.
    function mirror(c, { id, h, outline, tint }, draw) {
      const clip = outline.map(p => P(p));
      const surface = checks ? checks.el(id, { mirror: { y: h, poly: clip }, mirrored: [] }) : { mirrored: [] };
      c.save(); poly(c, clip, 'rgba(0,0,0,0)'); c.clip();
      mir = { h, surface }; try { draw(); } finally { mir = null; }
      if (tint) { c.globalAlpha = tint.alpha; poly(c, clip, tint.fill); }
      c.restore();
    }
    // Draw queue: later(depth, fn) collects, flush() draws far to near (stable for ties). Use explicit order where
    // depth alone is ambiguous (interpenetrating shapes still need splitting by hand).
    let q = [];
    const later = (depth, fn) => q.push({ depth, fn, i: q.length });
    const flush = () => { q.sort((a, b) => b.depth - a.depth || a.i - b.i).forEach(e => e.fn()); q = []; };

    return { P: (x, y, z) => P(M([x, y, z])), face, box, circle, cylinder, path, px, onPlane, shadowPts, shadowBox, mirror, later, flush, depth: p => cam.depth(p), hull };
  }

  window.WorldKit = { pinhole, parallel, isometric, create, normalOf, hull };
})();
