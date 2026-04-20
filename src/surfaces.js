/**
 * Mathematical surface generators — 24 surfaces across 4 categories.
 * Supports both heightfield (z=f(x,y)) and parametric ((u,v)→(x,y,z)) surfaces.
 */

// ── Color ramps ──────────────────────────────────────────────────────────────

const COLOR_SCHEMES = {
  viridis: [
    [0.267, 0.004, 0.329], [0.282, 0.140, 0.458], [0.253, 0.265, 0.530],
    [0.207, 0.372, 0.553], [0.164, 0.471, 0.558], [0.128, 0.567, 0.551],
    [0.135, 0.659, 0.518], [0.267, 0.749, 0.441], [0.478, 0.821, 0.318],
    [0.741, 0.873, 0.150], [0.993, 0.906, 0.144],
  ],
  plasma: [
    [0.050, 0.030, 0.528], [0.294, 0.012, 0.631], [0.492, 0.012, 0.659],
    [0.658, 0.085, 0.610], [0.797, 0.213, 0.483], [0.899, 0.361, 0.349],
    [0.966, 0.530, 0.215], [0.992, 0.706, 0.106], [0.973, 0.874, 0.145],
    [0.940, 0.975, 0.131],
  ],
  coolwarm: [
    [0.230, 0.299, 0.754], [0.350, 0.428, 0.830], [0.490, 0.558, 0.890],
    [0.630, 0.680, 0.930], [0.780, 0.800, 0.950], [0.900, 0.780, 0.760],
    [0.930, 0.650, 0.580], [0.890, 0.500, 0.400], [0.800, 0.340, 0.260],
    [0.706, 0.016, 0.150],
  ],
  ocean: [
    [0.01, 0.07, 0.15], [0.02, 0.14, 0.30], [0.04, 0.25, 0.45],
    [0.08, 0.40, 0.55], [0.15, 0.55, 0.60], [0.30, 0.70, 0.65],
    [0.50, 0.82, 0.72], [0.70, 0.90, 0.80], [0.85, 0.95, 0.90],
    [0.95, 0.99, 0.97],
  ],
  matlab: [
    [0.242, 0.150, 0.660], [0.281, 0.323, 0.958], [0.179, 0.529, 0.968],
    [0.069, 0.695, 0.839], [0.127, 0.795, 0.615], [0.357, 0.850, 0.382],
    [0.624, 0.854, 0.224], [0.895, 0.798, 0.148], [0.977, 0.984, 0.080],
  ],
};

function sampleColorRamp(ramp, t) {
  t = Math.max(0, Math.min(1, t));
  const idx = t * (ramp.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, ramp.length - 1);
  const frac = idx - lo;
  return [
    ramp[lo][0] + (ramp[hi][0] - ramp[lo][0]) * frac,
    ramp[lo][1] + (ramp[hi][1] - ramp[lo][1]) * frac,
    ramp[lo][2] + (ramp[hi][2] - ramp[lo][2]) * frac,
  ];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function besselJ0(x) {
  let sum = 0, term = 1;
  for (let k = 0; k < 25; k++) {
    sum += term;
    term *= -(x * x) / (4 * (k + 1) * (k + 1));
  }
  return sum;
}

function cross(a, b) {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}

function normalize(v) {
  const l = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]) || 1e-10;
  return [v[0]/l, v[1]/l, v[2]/l];
}

// ── Categories ───────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: 'waves', name: 'Waves' },
  { id: 'design', name: 'Design' },
  { id: 'math', name: 'Math' },
  { id: 'topology', name: 'Topology' },
];

// ── Surface definitions ─────────────────────────────────────────────────────

export const SURFACE_DEFS = [
  // ── WAVES & OSCILLATION ──
  {
    id: 'sinc', category: 'waves', name: 'Sinc Function', type: 'heightfield',
    formula: 'z = sin(R) / R,  R = √(x² + y²)',
    description: 'The cardinal sine — a radially symmetric wave that decays outward. Fundamental in signal processing and optics.',
    range: [-8, 8],
    fn: (x, y) => { const r = Math.sqrt(x*x+y*y)+1e-10; return Math.sin(r)/r; },
  },
  {
    id: 'sombrero', category: 'waves', name: 'Sombrero', type: 'heightfield',
    formula: 'z = cos(R) · e^(−0.1R)',
    description: 'The Mexican hat wavelet — a dampened radial cosine. Used in wavelet analysis and computer vision edge detection.',
    range: [-10, 10],
    fn: (x, y) => { const r = Math.sqrt(x*x+y*y); return Math.cos(r)*Math.exp(-0.1*r); },
  },
  {
    id: 'interference', category: 'waves', name: 'Interference', type: 'heightfield',
    formula: 'z = sin(x) + sin(y)',
    description: 'Two orthogonal wave systems superimposed — like crossing ripples on a pond.',
    range: [-8, 8],
    fn: (x, y) => Math.sin(x) + Math.sin(y),
  },
  {
    id: 'standing', category: 'waves', name: 'Standing Wave', type: 'heightfield',
    formula: 'z = sin(2x) · cos(2y) · e^(−0.05R²)',
    description: 'A dampened standing wave pattern — the vibration mode of a rectangular membrane.',
    range: [-5, 5],
    fn: (x, y) => Math.sin(2*x)*Math.cos(2*y)*Math.exp(-0.05*(x*x+y*y)),
  },
  {
    id: 'bessel', category: 'waves', name: 'Bessel J₀', type: 'heightfield',
    formula: 'z = J₀(R),  R = √(x² + y²)',
    description: 'The zeroth-order Bessel function — describes vibration modes of a circular drum membrane.',
    range: [-12, 12],
    fn: (x, y) => besselJ0(Math.sqrt(x*x+y*y)),
  },
  {
    id: 'ripple', category: 'waves', name: 'Ripple', type: 'heightfield',
    formula: 'z = sin(5R) / (1 + R²)',
    description: 'Concentric waves that decay radially — like a stone dropped into water, frozen in time.',
    range: [-5, 5],
    fn: (x, y) => { const r = Math.sqrt(x*x+y*y); return Math.sin(5*r)/(1+r*r); },
  },

  // ── ARCHITECTURE & DESIGN ──
  {
    id: 'enneper', category: 'design', name: 'Enneper Surface', type: 'parametric',
    formula: 'x = u − u³/3 + uv²,  y = v − v³/3 + vu²,  z = u² − v²',
    description: 'A minimal surface with zero mean curvature — used in tensile architecture and soap film studies.',
    uRange: [-1.8, 1.8], vRange: [-1.8, 1.8],
    fn: (u, v) => [u - u*u*u/3 + u*v*v, u*u - v*v, v - v*v*v/3 + v*u*u],
  },
  {
    id: 'monkey', category: 'design', name: 'Monkey Saddle', type: 'heightfield',
    formula: 'z = x³ − 3xy²',
    description: 'Three valleys instead of two — named because a monkey (with tail) could sit at the center.',
    range: [-2, 2],
    fn: (x, y) => x*x*x - 3*x*y*y,
  },
  {
    id: 'helicoid', category: 'design', name: 'Helicoid', type: 'parametric',
    formula: 'x = v·cos(u),  y = u,  z = v·sin(u)',
    description: 'A ruled minimal surface — the shape of spiral staircases and parking ramps.',
    uRange: [-Math.PI*2, Math.PI*2], vRange: [-1.5, 1.5],
    fn: (u, v) => [v*Math.cos(u), u, v*Math.sin(u)],
  },
  {
    id: 'catenoid', category: 'design', name: 'Catenoid', type: 'parametric',
    formula: 'x = cosh(v)·cos(u),  y = v,  z = cosh(v)·sin(u)',
    description: 'The minimal surface of revolution — the shape formed by a soap film between two rings.',
    uRange: [0, Math.PI*2], vRange: [-1.5, 1.5],
    fn: (u, v) => [Math.cosh(v)*Math.cos(u), v, Math.cosh(v)*Math.sin(u)],
  },
  {
    id: 'saddle', category: 'design', name: 'Hyperbolic Paraboloid', type: 'heightfield',
    formula: 'z = x² − y²',
    description: 'A ruled doubly-curved surface — the shape of a Pringles chip.',
    range: [-3, 3],
    fn: (x, y) => x*x - y*y,
  },
  {
    id: 'eggcrate', category: 'design', name: 'Egg Crate', type: 'heightfield',
    formula: 'z = sin(x) · sin(y)',
    description: 'A doubly-periodic undulating surface. Common in acoustics panel design.',
    range: [-Math.PI*2, Math.PI*2],
    fn: (x, y) => Math.sin(x) * Math.sin(y),
  },

  // ── CLASSIC MATHEMATICAL ──
  {
    id: 'peaks', category: 'math', name: 'MATLAB Peaks', type: 'heightfield',
    formula: 'z = 3(1−x)²·e^(−x²−(y+1)²) − 10(x/5−x³−y⁵)·e^(−x²−y²) − ⅓·e^(−(x+1)²−y²)',
    description: 'The classic MATLAB test surface — a combination of Gaussian peaks and valleys.',
    range: [-3, 3],
    fn: (x, y) => 3*Math.pow(1-x,2)*Math.exp(-x*x-(y+1)*(y+1)) - 10*(x/5-x*x*x-Math.pow(y,5))*Math.exp(-x*x-y*y) - (1/3)*Math.exp(-((x+1)*(x+1))-y*y),
  },
  {
    id: 'rosenbrock', category: 'math', name: 'Rosenbrock', type: 'heightfield',
    formula: 'z = (1−x)² + 100(y−x²)²',
    description: 'The "banana" valley — a famous optimization test function used in machine learning.',
    range: [-2, 2],
    fn: (x, y) => Math.pow(1-x, 2) + 100*Math.pow(y-x*x, 2),
  },
  {
    id: 'rastrigin', category: 'math', name: 'Rastrigin', type: 'heightfield',
    formula: 'z = 20 + x² + y² − 10(cos2πx + cos2πy)',
    description: 'Multi-modal landscape of bumps — used to test optimization algorithms.',
    range: [-4, 4],
    fn: (x, y) => 20 + x*x + y*y - 10*(Math.cos(2*Math.PI*x) + Math.cos(2*Math.PI*y)),
  },
  {
    id: 'gaussian', category: 'math', name: 'Gaussian', type: 'heightfield',
    formula: 'z = e^(−(x²+y²)/2)',
    description: 'The 2D Gaussian bell curve — elegant simplicity, fundamental to probability.',
    range: [-4, 4],
    fn: (x, y) => Math.exp(-(x*x+y*y)/2),
  },
  {
    id: 'swisscheese', category: 'math', name: 'Swiss Cheese', type: 'heightfield',
    formula: 'z = cos(x)·cos(y)·e^(−0.1(x²+y²))',
    description: 'A dampened 2D cosine — a lattice of peaks that fades toward the edges.',
    range: [-8, 8],
    fn: (x, y) => Math.cos(x)*Math.cos(y)*Math.exp(-0.1*(x*x+y*y)),
  },

  // ── TOPOLOGY & DRAMATIC ──
  {
    id: 'mobius', category: 'topology', name: 'Möbius Strip', type: 'parametric',
    formula: 'x = (1+v/2·cos(u/2))·cos(u),  z = (1+v/2·cos(u/2))·sin(u),  y = v/2·sin(u/2)',
    description: 'A one-sided, one-edged surface — the classic non-orientable topological object.',
    uRange: [0, Math.PI*2], vRange: [-0.6, 0.6],
    fn: (u, v) => [(1+v/2*Math.cos(u/2))*Math.cos(u), v/2*Math.sin(u/2), (1+v/2*Math.cos(u/2))*Math.sin(u)],
  },
  {
    id: 'klein', category: 'topology', name: 'Klein Bottle', type: 'parametric',
    formula: 'Figure-8 immersion in ℝ³',
    description: 'A closed non-orientable surface with no inside or outside — the 3D shadow of a 4D object.',
    uRange: [0, Math.PI*2], vRange: [0, Math.PI*2],
    fn: (u, v) => {
      const a = 3;
      const x = (a + Math.cos(u/2)*Math.sin(v) - Math.sin(u/2)*Math.sin(2*v)) * Math.cos(u);
      const z = (a + Math.cos(u/2)*Math.sin(v) - Math.sin(u/2)*Math.sin(2*v)) * Math.sin(u);
      const y = Math.sin(u/2)*Math.sin(v) + Math.cos(u/2)*Math.sin(2*v);
      return [x, y, z];
    },
  },
  {
    id: 'torusknot', category: 'topology', name: 'Torus Knot', type: 'parametric_tube',
    formula: '(p,q) = (2,3) trefoil knot with tube radius',
    description: 'A curve that winds around a torus — the trefoil knot is the simplest non-trivial knot.',
    uRange: [0, Math.PI*2], vRange: [0, Math.PI*2],
    knotP: 2, knotQ: 3, knotR: 2.5, knotTubeR: 0.5,
    fn: null, // handled specially in buildSurface
  },
  {
    id: 'seashell', category: 'topology', name: 'Seashell', type: 'parametric',
    formula: 'Logarithmic spiral with expanding aperture',
    description: 'A parametric spiral shell — nature\'s logarithmic growth pattern made tangible.',
    uRange: [0, Math.PI*2], vRange: [-Math.PI*2, Math.PI*4],
    fn: (u, v) => {
      const a = 1.2, b = 1.5, c = 0.15, n = 1.5;
      const t = v / (Math.PI * 2);
      const exp = Math.pow(Math.E, -0.15 * v);
      const x = (a * exp * (1 + Math.cos(u))) * Math.cos(n * v) + c * Math.cos(n * v);
      const z = (a * exp * (1 + Math.cos(u))) * Math.sin(n * v) + c * Math.sin(n * v);
      const y = b * v / (Math.PI * 2) + a * exp * Math.sin(u);
      return [x, y, z];
    },
  },
  {
    id: 'dini', category: 'topology', name: "Dini's Surface", type: 'parametric',
    formula: 'x = a·cos(u)·sin(v),  y = a·(cos(v)+ln(tan(v/2)))+b·u,  z = a·sin(u)·sin(v)',
    description: 'A twisted pseudosphere — a surface of constant negative curvature, like a spiral horn.',
    uRange: [0, Math.PI*4], vRange: [0.1, Math.PI - 0.1],
    fn: (u, v) => {
      const a = 1, b = 0.2;
      return [a*Math.cos(u)*Math.sin(v), a*(Math.cos(v)+Math.log(Math.tan(v/2+1e-10)))+b*u, a*Math.sin(u)*Math.sin(v)];
    },
  },
  {
    id: 'boys', category: 'topology', name: "Boy's Surface", type: 'parametric',
    formula: 'Bryant-Kusner parametrization of RP²',
    description: 'An immersion of the real projective plane — one of mathematics\' most beautiful topological objects.',
    uRange: [0, Math.PI], vRange: [0, Math.PI],
    fn: (u, v) => {
      const sq2 = Math.SQRT2;
      const denom = 2 - sq2 * Math.sin(3*u) * Math.sin(2*v);
      const x = (sq2*Math.cos(2*u)*Math.cos(v)*Math.cos(v) + Math.cos(u)*Math.sin(2*v)) / denom;
      const z = (sq2*Math.sin(2*u)*Math.cos(v)*Math.cos(v) - Math.sin(u)*Math.sin(2*v)) / denom;
      const y = (3*Math.cos(v)*Math.cos(v)) / denom;
      return [x, y, z];
    },
  },
  {
    id: 'crosscap', category: 'topology', name: 'Cross-Cap', type: 'parametric',
    formula: 'x = sin(u)·sin(2v)/2,  y = sin(2u)·cos²(v),  z = cos(2u)·cos²(v)',
    description: 'A self-intersecting surface representing RP² — where the inside meets the outside.',
    uRange: [0, Math.PI], vRange: [0, Math.PI],
    fn: (u, v) => {
      const cv = Math.cos(v);
      return [Math.sin(u)*Math.sin(2*v)/2, Math.sin(2*u)*cv*cv, Math.cos(2*u)*cv*cv];
    },
  },
];

// ── Torus knot curve helper ─────────────────────────────────────────────────

function torusKnotPoint(t, p, q, R) {
  const r = 0.8;
  return [
    (R + r * Math.cos(q * t)) * Math.cos(p * t),
    r * Math.sin(q * t),
    (R + r * Math.cos(q * t)) * Math.sin(p * t),
  ];
}

// ── Geometry builder ────────────────────────────────────────────────────────

export function buildSurface(surfaceId, resolution = 80, colorScheme = 'viridis') {
  const def = SURFACE_DEFS.find((s) => s.id === surfaceId);
  if (!def) throw new Error(`Unknown surface: ${surfaceId}`);

  const ramp = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.viridis;
  const vertCount = (resolution + 1) * (resolution + 1);
  const positions = new Float32Array(vertCount * 3);
  const colors = new Float32Array(vertCount * 3);

  // ── Generate raw positions ──
  if (def.type === 'heightfield') {
    const [lo, hi] = def.range;
    const step = (hi - lo) / resolution;
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = lo + i * step;
        const y = lo + j * step;
        const z = def.fn(x, y);
        const idx = (i * (resolution + 1) + j) * 3;
        const scale = 7 / (hi - lo);
        positions[idx]     = (x - (lo + hi) / 2) * scale;
        positions[idx + 1] = z;
        positions[idx + 2] = (y - (lo + hi) / 2) * scale;
      }
    }
  } else if (def.type === 'parametric') {
    const [uLo, uHi] = def.uRange;
    const [vLo, vHi] = def.vRange;
    const uStep = (uHi - uLo) / resolution;
    const vStep = (vHi - vLo) / resolution;
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const u = uLo + i * uStep;
        const v = vLo + j * vStep;
        const [px, py, pz] = def.fn(u, v);
        const idx = (i * (resolution + 1) + j) * 3;
        positions[idx]     = px;
        positions[idx + 1] = py;
        positions[idx + 2] = pz;
      }
    }
  } else if (def.type === 'parametric_tube') {
    // Torus knot tube
    const { knotP, knotQ, knotR, knotTubeR } = def;
    const [uLo, uHi] = def.uRange;
    const [vLo, vHi] = def.vRange;
    const uStep = (uHi - uLo) / resolution;
    const vStep = (vHi - vLo) / resolution;
    const h = 0.001;

    for (let i = 0; i <= resolution; i++) {
      const t = uLo + i * uStep;
      const pt = torusKnotPoint(t, knotP, knotQ, knotR);
      const pt1 = torusKnotPoint(t + h, knotP, knotQ, knotR);
      const pt0 = torusKnotPoint(t - h, knotP, knotQ, knotR);
      const tangent = normalize([pt1[0]-pt0[0], pt1[1]-pt0[1], pt1[2]-pt0[2]]);
      const accel = [pt1[0]-2*pt[0]+pt0[0], pt1[1]-2*pt[1]+pt0[1], pt1[2]-2*pt[2]+pt0[2]];
      let normal = normalize(cross(tangent, cross(accel, tangent)));
      if (normal[0] === 0 && normal[1] === 0 && normal[2] === 0) normal = [0, 1, 0];
      const binormal = normalize(cross(tangent, normal));

      for (let j = 0; j <= resolution; j++) {
        const theta = vLo + j * vStep;
        const idx = (i * (resolution + 1) + j) * 3;
        positions[idx]     = pt[0] + knotTubeR * (normal[0]*Math.cos(theta) + binormal[0]*Math.sin(theta));
        positions[idx + 1] = pt[1] + knotTubeR * (normal[1]*Math.cos(theta) + binormal[1]*Math.sin(theta));
        positions[idx + 2] = pt[2] + knotTubeR * (normal[2]*Math.cos(theta) + binormal[2]*Math.sin(theta));
      }
    }
  }

  // ── Normalize & center ──
  let xMin=Infinity,xMax=-Infinity,yMin=Infinity,yMax=-Infinity,zMin=Infinity,zMax=-Infinity;
  for (let v = 0; v < vertCount; v++) {
    const x = positions[v*3], y = positions[v*3+1], z = positions[v*3+2];
    if (isFinite(x)) { xMin = Math.min(xMin, x); xMax = Math.max(xMax, x); }
    if (isFinite(y)) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
    if (isFinite(z)) { zMin = Math.min(zMin, z); zMax = Math.max(zMax, z); }
  }

  const cx = (xMin+xMax)/2, cy = (yMin+yMax)/2, cz = (zMin+zMax)/2;
  const maxSpan = Math.max(xMax-xMin, yMax-yMin, zMax-zMin) || 1;
  const scale = 6 / maxSpan;

  for (let v = 0; v < vertCount; v++) {
    const i = v * 3;
    if (!isFinite(positions[i])) positions[i] = 0;
    if (!isFinite(positions[i+1])) positions[i+1] = 0;
    if (!isFinite(positions[i+2])) positions[i+2] = 0;
    positions[i]   = (positions[i]   - cx) * scale;
    positions[i+1] = (positions[i+1] - cy) * scale;
    positions[i+2] = (positions[i+2] - cz) * scale;
  }

  // ── Color by height (Y in world) ──
  let hMin = Infinity, hMax = -Infinity;
  for (let v = 0; v < vertCount; v++) {
    const h = positions[v*3+1];
    if (h < hMin) hMin = h;
    if (h > hMax) hMax = h;
  }
  const hRange = hMax - hMin || 1;

  for (let v = 0; v < vertCount; v++) {
    const t = (positions[v*3+1] - hMin) / hRange;
    const [r, g, b] = sampleColorRamp(ramp, t);
    colors[v*3]   = r;
    colors[v*3+1] = g;
    colors[v*3+2] = b;
  }

  // ── Build triangle indices ──
  const indices = new Uint32Array(resolution * resolution * 6);
  let ptr = 0;
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const a = i * (resolution + 1) + j;
      const b = (i + 1) * (resolution + 1) + j;
      const c = (i + 1) * (resolution + 1) + (j + 1);
      const d = i * (resolution + 1) + (j + 1);
      indices[ptr++] = a; indices[ptr++] = b; indices[ptr++] = d;
      indices[ptr++] = b; indices[ptr++] = c; indices[ptr++] = d;
    }
  }

  return { positions, colors, indices };
}

export { COLOR_SCHEMES, sampleColorRamp };
