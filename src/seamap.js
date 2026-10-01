// Background treasure map: faint inked sea, coastlines, compass rose, ships, a
// dotted route to the X and a small sea serpent. Pure SVG/CSS; animations touch
// only transform/opacity. Base styles are the resting state, so the global
// prefers-reduced-motion rule leaves a still map.

const INK = '#38230f';
const RED = '#8b2a1b';
const PAPER = '#f2e6c8';

// One tile of sketched wave marks; tiled and drifted by CSS.
const WAVES = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='160' fill='none' stroke='%2338230f' stroke-width='1.1' stroke-linecap='round'%3E%3Cpath d='M18 38q8-7 16 0t16 0t16 0M136 26q7-6 14 0t14 0M70 104q9-7 18 0t18 0M176 128q7-6 14 0t14 0t14 0M28 142q6-5 12 0'/%3E%3C/svg%3E")`;

function route() {
  // Dots along a cubic bezier across the island, ending at the X.
  const [p0, p1, p2, p3] = [[78, 196], [130, 262], [176, 116], [284, 192]];
  const n = 17;
  return Array.from({ length: n }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    const c = (k) => u ** 3 * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t ** 3 * p3[k];
    return `<circle cx="${c(0).toFixed(1)}" cy="${c(1).toFixed(1)}" r="2.1" style="--d:${i}"/>`;
  }).join('');
}

function compass() {
  const rhumbs = Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI) / 8;
    return `M0 0L${(1600 * Math.sin(a)).toFixed(0)} ${(-1600 * Math.cos(a)).toFixed(0)}`;
  }).join('');
  const ticks = Array.from({ length: 32 }, (_, i) => {
    const a = (i * Math.PI) / 16;
    const r1 = i % 4 === 0 ? 60 : 64;
    const p = (r) => `${(r * Math.sin(a)).toFixed(1)} ${(-r * Math.cos(a)).toFixed(1)}`;
    return `M${p(r1)}L${p(69)}`;
  }).join('');
  // Eight-point rose: each point is a light and a dark half.
  const point = (deg, len, w) => {
    const r = (d) => (d * Math.PI) / 180;
    const xy = (d, l) => `${(l * Math.sin(r(d))).toFixed(1)} ${(-l * Math.cos(r(d))).toFixed(1)}`;
    return `<path d="M0 0L${xy(deg - 90, w)}L${xy(deg, len)}Z" fill="${PAPER}"/><path d="M0 0L${xy(deg + 90, w)}L${xy(deg, len)}Z" fill="${INK}"/>`;
  };
  const rose = [45, 135, 225, 315].map((d) => point(d, 36, 7)).join('') +
    [0, 90, 180, 270].map((d) => point(d, 56, 9)).join('');
  return `<svg class="sea-compass" viewBox="-100 -100 200 200">
<path class="rhumbs" d="${rhumbs}" stroke="${INK}" stroke-width=".7"/>
<g class="ring" fill="none" stroke="${INK}">
<circle r="69" stroke-width="1.6"/><circle r="64" stroke-width=".6"/><circle r="56" stroke-width=".5" stroke-dasharray="2 3"/>
<path d="${ticks}" stroke-width=".8"/>
</g>
<g class="rose" stroke="${INK}" stroke-width=".8" stroke-linejoin="round">${rose}</g>
<g class="needle" stroke="${INK}" stroke-width=".6"><path d="M0 -48L4 0L0 48L-4 0Z" fill="${INK}"/><path d="M0 -48L4 0H-4Z" fill="${RED}"/></g>
<circle r="4" fill="#c29a3c" stroke="${INK}" stroke-width=".8"/>
<text y="-75" text-anchor="middle" font-family="IM Fell English, Georgia, serif" font-size="18" fill="${RED}">N</text>
</svg>`;
}

const ISLAND =
  'M60 170C40 130 80 95 130 100C160 70 210 60 245 85C285 75 330 95 335 135C365 150 360 200 320 215C300 250 240 255 205 238C170 262 110 255 95 225C60 220 45 195 60 170Z';

function island() {
  return `<svg class="sea-island" viewBox="0 0 400 300">
<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
<path d="${ISLAND}" transform="translate(200 165) scale(1.13) translate(-200 -165)" stroke-width=".6" stroke-dasharray="1 5"/>
<path d="${ISLAND}" transform="translate(200 165) scale(1.06) translate(-200 -165)" stroke-width=".7"/>
<path d="${ISLAND}" fill="rgba(194,154,60,.16)" stroke-width="1.6"/>
<path d="M140 150l12-20 12 20M150 136l-4 6M162 140l11-17 11 17M172 128l-3 5M196 132l9-14 9 14" stroke-width="1.1"/>
<path d="M266 182q-2-20 6-36M272 146q-12-7-22 2M272 146q11-9 22-1M272 146q-4-11-15-12M272 146q6-11 17-9" stroke-width="1.2"/>
</g>
<g class="route" fill="${INK}">${route()}</g>
<g class="x-mark" stroke="${RED}" stroke-width="3.2" stroke-linecap="round"><path d="M284 186l14 14M298 186l-14 14"/></g>
</svg>`;
}

function mainland() {
  const coast = 'M0 250C30 230 20 200 55 190C90 180 80 140 120 130C150 122 140 90 175 80C210 70 205 40 240 32C280 22 300 8 330 0';
  return `<svg class="sea-coast" viewBox="0 0 360 260">
<defs><linearGradient id="sea-beam" x1="151" y1="0" x2="311" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d8b04a" stop-opacity=".95"/><stop offset="1" stop-color="#c29a3c" stop-opacity="0"/></linearGradient></defs>
<g fill="none" stroke="${INK}" stroke-linecap="round">
<path d="${coast}L0 0Z" fill="rgba(194,154,60,.16)" stroke-width="1.6"/>
<path d="${coast}" transform="translate(9 9)" stroke-width=".7"/>
<path d="${coast}" transform="translate(19 19)" stroke-width=".6" stroke-dasharray="1 5"/>
<path d="M40 120l10-16 10 16M58 112l8-13 8 13M110 70l10-16 10 16M30 170l8-12 8 12" stroke-width="1"/>
</g>
<path class="beam" d="M151 41L311 22V60Z" fill="url(#sea-beam)"/>
<g stroke="${INK}" stroke-width="1" stroke-linejoin="round">
<path d="M145 67l3-22h6l3 22z" fill="${PAPER}"/><path d="M146.4 57h9.2M147.4 50h7.2" stroke-width="2.2" stroke="${RED}" opacity=".7"/>
<path d="M147 45v-6h8v6M145.5 39l5.5-6 5.5 6z" fill="${PAPER}"/>
<circle class="lamp" cx="151" cy="42" r="1.8" fill="#c29a3c" stroke="none"/>
</g>
</svg>`;
}

function serpent() {
  return `<svg class="sea-serpent" viewBox="0 0 260 120">
<g fill="none" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
<path class="hump" style="--k:0" d="M6 82q2-34 22-42q12-4 18 4q-5 6-13 3q-8 3-9 35M33 47l-3-5M38 46l1-6"/>
<path class="hump" style="--k:1" d="M58 82q22-46 46 0M68 66l4-4M80 58l2-5M92 64l4-4"/>
<path class="hump" style="--k:2" d="M120 82q20-38 40 0M132 68l3-4M146 66l3-4"/>
<path class="hump" style="--k:3" d="M176 82q12-26 26-6q6-12 16-14q8 0 6 8"/>
<path d="M0 88q8-5 16 0t16 0M48 88q8-5 16 0t16 0t16 0t16 0M116 88q8-5 16 0t16 0t16 0M170 88q8-5 16 0t16 0t16 0" stroke-width=".9"/>
</g>
<circle cx="31" cy="46" r="1.6" fill="${INK}"/>
</svg>`;
}

const HULL = `<path d="M4 33h50l-6 8H11z" fill="rgba(56,35,15,.35)" stroke-width="1.4"/><path d="M54 33l9-5M30 33V5M45 33V11" stroke-width="1.3"/>`;
const MAIN_SAILS = `<path d="M21 9q9 3 18 0v9q-9 3-18 0zM19 21q11 3 22 0v9q-11 3-22 0z" fill="${PAPER}" stroke-width="1.1"/>`;
const FORE_SAILS = `<path d="M40 14q5 2 10 0v13q-5 2-10 0zM46 11l16 17H48" fill="${PAPER}" stroke-width="1.1"/>`;
const PENNANT = `<path d="M30 5l7 2-7 2" fill="${RED}" stroke="${RED}" stroke-width=".8"/>`;
const WAKE = `<path d="M0 46q5-4 10 0t10 0M40 47q5-4 10 0t10 0" stroke-width=".9"/>`;
const shipBody = (inner) =>
  `<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">${HULL}${inner}${WAKE}</g>`;

const SHIP = `<symbol id="sea-ship" viewBox="0 0 64 52">${shipBody(MAIN_SAILS + FORE_SAILS + PENNANT)}</symbol>`;

const tile = (x, y, w, h) => `M${x} ${y}h${w}v${h}h-${w}z`;
const G = '#6e8a49';
const Y = '#c29a3c';
const N = '#958a75';

// Wordle easter egg: the mainsail is a guess grid that fills row by row to a solve.
function wordleShip() {
  const rows = [[N, Y, N, N, G], [Y, G, N, Y, G], [G, G, Y, G, G], [G, G, G, G, G]];
  const xy = (r, c) => [+(14 + c * 5.3).toFixed(1), +(7 + r * 5.3).toFixed(1)];
  const blank = rows.flatMap((row, r) => row.map((_, c) => tile(...xy(r, c), 4.6, 4.6))).join('');
  const filled = rows
    .map((row, r) => `<g class="wrow" style="--r:${r}">${row.map((col, c) => `<path d="${tile(...xy(r, c), 4.6, 4.6)}" fill="${col}"/>`).join('')}</g>`)
    .join('');
  return shipBody(`${FORE_SAILS}${PENNANT}<path d="${blank}" fill="${PAPER}" stroke-width=".6"/><g stroke="none">${filled}</g>`);
}

// Flagle easter egg: the masthead flag fills in tile by tile.
function flagleShip() {
  const cols = ['#56704a', '#efe3c4', '#9b3b28'];
  const order = [3, 0, 5, 1, 4, 2];
  const cells = [0, 1].flatMap((r) => cols.map((c, k) => [31 + k * 4, 1 + r * 3.6, c, order[r * 3 + k]]));
  return shipBody(
    `${MAIN_SAILS}${FORE_SAILS}<path d="M30 5V0" stroke-width="1.1"/>` +
      `<path d="${cells.map(([x, y]) => tile(x, y, 4, 3.6)).join('')}" fill="${PAPER}" stroke-width=".5"/>` +
      `<g stroke="none">${cells.map(([x, y, c, t]) => `<path class="ftile" style="--t:${t}" d="${tile(x, y, 4, 3.6)}" fill="${c}"/>`).join('')}</g>`,
  );
}

const ship = (cls, inner = '<use href="#sea-ship"/>') =>
  `<div class="sea-track ${cls}"><svg class="sea-ship" viewBox="0 0 64 52">${inner}</svg></div>`;

// Two ships at anchor trading cannon fire; each shot falls short with a splash.
function duel() {
  const q = (t, a, b, c) => (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c;
  const dots = [1, 2, 3, 4, 5, 6]
    .map((i) => `<circle style="--d:${i}" cx="${q(i / 7, 68, 108, 148).toFixed(1)}" cy="${q(i / 7, 38, 6, 48).toFixed(1)}" r="1.3"/>`)
    .join('');
  const shot = (s) => `<g class="shot" style="--o:${s * 14.5}s"${s ? ' transform="translate(230 0) scale(-1 1)"' : ''}>
<g class="ball" fill="${INK}">${dots}</g>
<path class="flash" d="M63 39l4-4v3l5-1-4 3 4 3-5-1v4l-3-4z" fill="${RED}"/>
<g class="smoke" fill="${PAPER}" stroke="${INK}" stroke-width=".8"><circle cx="70" cy="37" r="5"/><circle cx="77" cy="33" r="6"/><circle cx="76" cy="41" r="4.5"/></g>
<path class="splash" d="M144 50l-4-8M148 50v-11M152 50l4-8M141 51q7-3 14 0" fill="none" stroke="${INK}" stroke-width="1" stroke-linecap="round"/>
</g>`;
  return `<svg class="sea-duel" viewBox="0 0 230 64">
<g class="rock"><use href="#sea-ship" y="8" width="64" height="52"/></g>
<g transform="translate(230 0) scale(-1 1)"><g class="rock rock-b"><use href="#sea-ship" y="8" width="64" height="52"/></g></g>
${shot(0)}${shot(1)}
</svg>`;
}

function whale() {
  return `<svg class="sea-whale" viewBox="0 0 150 70">
<defs><clipPath id="sea-under"><rect x="-10" y="-40" width="170" height="91"/></clipPath></defs>
<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
<g clip-path="url(#sea-under)">
<g class="body"><path d="M16 52C20 32 46 20 74 20C100 20 116 32 124 52Z" fill="rgba(56,35,15,.3)" stroke-width="1.5"/>
<path d="M22 44q16 5 34 1M84 30q10 2 18 10M90 26q10 3 16 11" stroke-width=".9"/><circle cx="40" cy="37" r="1.6" fill="${INK}" stroke="none"/></g>
<path class="tail" d="M136 52l-1-14q-9-3-13-11q9 1 14 7q5-6 14-7q-4 8-13 11l-1 14" fill="rgba(56,35,15,.3)" stroke-width="1.4"/>
</g>
<path class="spout" d="M60 19q-3-9-12-13M60 19q-1-10 1-17M60 19q3-9 12-12M44 9l-1 3M76 8l1 3M52 2l-1 2M68 1l1 2" stroke-width="1.1"/>
<path d="M2 54q6-4 12 0t12 0M118 54q6-4 12 0t12 0M40 58q6-4 12 0t12 0t12 0" stroke-width=".9"/>
</g>
</svg>`;
}

// A tapered arm: offset both sides of a two-segment bezier spine, suckers on the inside.
function tentacle(segs, w0, n = 10) {
  const bez = (p, t) => [0, 1].map((k) => (1 - t) ** 3 * p[0][k] + 3 * (1 - t) ** 2 * t * p[1][k] + 3 * (1 - t) * t * t * p[2][k] + t ** 3 * p[3][k]);
  const pts = segs.flatMap((seg, i) => Array.from({ length: n + (i === segs.length - 1) }, (_, j) => bez(seg, j / n)));
  const L = [];
  const R = [];
  const dots = [];
  pts.forEach((pt, i) => {
    const q = pts[Math.min(i + 1, pts.length - 1)];
    const o = pts[Math.max(i - 1, 0)];
    const len = Math.hypot(q[0] - o[0], q[1] - o[1]) || 1;
    const [nx, ny] = [(o[1] - q[1]) / len, (q[0] - o[0]) / len];
    const w = w0 * (1 - i / pts.length) + 0.5;
    L.push(`${(pt[0] + nx * w).toFixed(1)} ${(pt[1] + ny * w).toFixed(1)}`);
    R.unshift(`${(pt[0] - nx * w).toFixed(1)} ${(pt[1] - ny * w).toFixed(1)}`);
    if (i % 2 && i < pts.length - 3) dots.push(`<circle cx="${(pt[0] - nx * w * 0.45).toFixed(1)}" cy="${(pt[1] - ny * w * 0.45).toFixed(1)}" r="${(w * 0.28).toFixed(1)}"/>`);
  });
  return `<path d="M${L.join('L')}L${R.join('L')}Z" fill="rgba(56,35,15,.28)" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/><g fill="${PAPER}" stroke="${INK}" stroke-width=".4">${dots.join('')}</g>`;
}

function kraken() {
  return `<svg class="sea-kraken" viewBox="0 0 100 120">
<defs><clipPath id="sea-deep"><rect x="-20" y="-20" width="140" height="122"/></clipPath></defs>
<g clip-path="url(#sea-deep)"><g class="rise">
<g class="arm">${tentacle([[[34, 116], [30, 88], [22, 64], [36, 46]], [[36, 46], [48, 30], [70, 32], [68, 48]], [[68, 48], [66, 58], [54, 56], [57, 49]]], 6.5, 7)}</g>
<g class="arm arm-b">${tentacle([[[74, 114], [76, 98], [86, 92], [84, 80]], [[84, 80], [83, 73], [75, 74], [77, 80]]], 3.6, 6)}</g>
</g></g>
<path d="M14 104q6-4 12 0t12 0M52 104q6-4 12 0t12 0t12 0M26 110q6-4 12 0" fill="none" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>
</svg>`;
}

function storm() {
  const rain = Array.from({ length: 8 }, (_, i) => `M${30 + i * 13} ${54 + (i % 2) * 4}l-5 14`).join('');
  return `<svg class="sea-storm" viewBox="0 0 160 96">
<ellipse class="glow" cx="80" cy="56" rx="60" ry="30" fill="#c29a3c"/>
<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
<g class="cloud"><path d="M24 52q-16 0-16-12t16-12q2-14 18-14q8-11 22-7q10-9 24-1q18-3 20 12q16 1 16 16t-16 18z" fill="#e2cfa3" stroke-width="1.4"/>
<path d="M30 44q20 4 40 0t40 2M40 36q14 3 28 0" stroke-width=".7"/></g>
<path class="rain" d="${rain}" stroke-width=".8" stroke-dasharray="3 3"/>
<path class="bolt" d="M86 54l-9 14h8l-8 16" stroke="${RED}" stroke-width="1.8"/>
</g>
</svg>`;
}

function bottle() {
  return `<div class="sea-drift"><svg class="sea-bottle" viewBox="0 0 48 28">
<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
<path d="M6 10q0-5 6-5h16q4 0 6 3h6v6h-6q-2 3-6 3H12q-6 0-6-5z" fill="rgba(194,154,60,.22)" stroke-width="1.2"/>
<path d="M40 7.5h4v7h-4" fill="#a2672f" stroke-width="1"/>
<path d="M13 8.5h12v5H13z" fill="${PAPER}" stroke-width=".7"/><path d="M15 10.5h8M15 12h6" stroke-width=".4"/>
<path d="M0 22q5-4 10 0t10 0t10 0t10 0" stroke-width=".9"/>
</g>
</svg></div>`;
}

// Gulls; the third is a Poople easter egg and now and then drops a little brown tile.
function gull(cls, poople = false) {
  const wings = `<path class="wings" d="M1 5q4-5 9 0q5-5 9 0" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`;
  if (!poople) return `<div class="sea-gull ${cls}"><svg viewBox="0 0 20 10">${wings}</svg></div>`;
  return `<div class="sea-gull ${cls}"><svg viewBox="0 0 20 70">${wings}
<rect class="blob" x="8" y="6" width="4" height="4" rx=".6" fill="#7a5230" stroke="${INK}" stroke-width=".4"/>
<ellipse class="plop" cx="10" cy="64" rx="6" ry="1.6" fill="none" stroke="${INK}" stroke-width=".7"/>
</svg></div>`;
}

// Globle easter egg: a round islet that warms from yellow to red.
function globleIsle() {
  const d = 'M22 38C20 26 32 18 44 20C56 20 62 30 60 40C58 52 46 56 36 54C26 52 23 46 22 38Z';
  return `<svg class="sea-globle" viewBox="0 0 80 70">
<g stroke="${INK}" stroke-linejoin="round">
<path d="${d}" transform="translate(41 37) scale(1.25) translate(-41 -37)" fill="none" stroke-width=".6" stroke-dasharray="1 4"/>
<path d="${d}" fill="#e3c15a" stroke="none"/><path class="warm warm-o" d="${d}" fill="#d9822f" stroke="none"/><path class="warm warm-r" d="${d}" fill="#a8321f" stroke="none"/>
<path d="${d}" fill="none" stroke-width="1.4"/>
<path d="M42 40q-1-8 3-14M45 26q-6-3-10 1M45 26q5-4 10 0M45 26q-1-5-6-6" fill="none" stroke-width="1" stroke-linecap="round"/>
</g>
</svg>`;
}

export const SEA_MAP = `<div class="sea" data-bg="sea-map" aria-hidden="true">
<svg width="0" height="0" style="position:absolute">${SHIP}</svg>
<div class="sea-water"><div class="sea-waves"></div><div class="sea-waves sea-waves-b"></div></div>
${mainland()}
${compass()}
${island()}
${globleIsle()}
${duel()}
${whale()}
${kraken()}
${serpent()}
${bottle()}
${ship('ship-a', wordleShip())}
${ship('ship-b', flagleShip())}
${ship('ship-c')}
${storm()}
${gull('gull-a')}
${gull('gull-b')}
${gull('gull-c', true)}
</div>`;

// Land extents (see .sea custom properties) keep every vessel and sea creature
// on water at any viewport size:
// - mainland: top-left, ink reaches down to about coast-y + 0.75 * coast-w;
// - island: bottom-left, ink reaches up to about 97vh - 0.64 * isle-w and right
//   to isle-x + 0.96 * isle-w. The vh caps on both widths bound land to
//   < 32vh at the top and > 69vh at the bottom, leaving a clear band for the
//   full-width lanes (34vh, 52vh, 63vh). The bottom lane (73vh) only runs
//   right of the island's measured edge.
export const SEA_CSS = `
/* Background treasure map */
.sea{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;opacity:.4;
  --coast-w:min(30vw,380px,42vh);--coast-x:0px;--coast-y:0px;
  --isle-w:min(25vw,360px,44vh);--isle-x:-1vw;--isle-y:3vh}
.sea svg{position:absolute;overflow:visible}
.sea-water{position:absolute;inset:0;
  -webkit-mask-image:radial-gradient(ellipse 34vw 30vh at 6% 92%,transparent 55%,#000 100%);
  mask-image:radial-gradient(ellipse 34vw 30vh at 6% 92%,transparent 55%,#000 100%)}
.sea-waves{position:absolute;top:-160px;bottom:-160px;left:-240px;right:-240px;
  background:${WAVES} 0 0/240px 160px;opacity:.6;animation:sea-drift 80s linear infinite}
.sea-waves-b{background-position:120px 80px;opacity:.4;animation:sea-drift-b 120s linear infinite}
@keyframes sea-drift{to{transform:translateX(240px)}}
@keyframes sea-drift-b{
  0%{transform:translate(0,0)} 25%{transform:translate(-60px,5px)} 50%{transform:translate(-120px,0)}
  75%{transform:translate(-180px,5px)} 100%{transform:translate(-240px,0)}
}

.sea-coast{top:var(--coast-y);left:var(--coast-x);width:var(--coast-w);height:auto}
.sea-coast .beam{transform:rotate(38deg);transform-origin:151px 41px;opacity:.8;animation:sea-sweep 15s ease-in-out infinite}
.sea-coast .lamp{animation:sea-lamp 15s ease-in-out infinite}
@keyframes sea-sweep{0%,100%{transform:rotate(4deg)} 50%{transform:rotate(74deg)}}
@keyframes sea-lamp{0%,100%{opacity:1} 25%,75%{opacity:.55}}

.sea-compass{top:12vh;right:4vw;width:min(17vw,210px);height:auto}
.sea-compass .rhumbs{opacity:.35}
.sea-compass .ring{transform-box:fill-box;transform-origin:center;animation:sea-turn 240s linear infinite}
.sea-compass .rose{transform-box:fill-box;transform-origin:center;animation:sea-breathe 14s ease-in-out infinite}
@keyframes sea-turn{to{transform:rotate(360deg)}}
@keyframes sea-breathe{0%,100%{transform:rotate(-3deg) scale(1)} 50%{transform:rotate(3deg) scale(1.04)}}
/* Countryle: the needle hunts for the mystery country, then settles */
.sea-compass .needle{transform-box:fill-box;transform-origin:center;transform:rotate(48deg);opacity:.85;
  animation:sea-needle 23s cubic-bezier(.3,.1,.3,1) infinite;animation-delay:-4s}
@keyframes sea-needle{
  0%{transform:rotate(-30deg)} 6%{transform:rotate(150deg)} 12%{transform:rotate(10deg)} 17%{transform:rotate(80deg)}
  21%{transform:rotate(38deg)} 24%{transform:rotate(54deg)} 27%,88%{transform:rotate(48deg)} 100%{transform:rotate(-30deg)}
}

.sea-island{left:var(--isle-x);bottom:var(--isle-y);width:var(--isle-w);height:auto}
.sea-island .route circle{animation:sea-dot 26s ease-out infinite backwards;animation-delay:calc(var(--d) * .7s)}
@keyframes sea-dot{0%{opacity:0} 3%,62%{opacity:1} 70%,100%{opacity:0}}
.sea-island .x-mark{transform-box:fill-box;transform-origin:center;opacity:1;
  animation:sea-x 26s ease-out infinite backwards;animation-delay:11.9s}
@keyframes sea-x{0%{opacity:0;transform:scale(1.6)} 4%{opacity:1;transform:scale(1)} 40%{opacity:1;transform:scale(1)} 50%,100%{opacity:0;transform:scale(1)}}

/* Globle: the islet warms from yellow to red */
.sea-globle{top:3vh;right:2.5vw;width:min(5.5vw,72px);height:auto}
.sea-globle .warm{animation:sea-warm-o 31s ease-in-out infinite}
.sea-globle .warm-r{animation-name:sea-warm-r}
@keyframes sea-warm-o{0%,18%{opacity:0} 34%,84%{opacity:1} 94%,100%{opacity:0}}
@keyframes sea-warm-r{0%,40%{opacity:0} 58%,84%{opacity:1} 94%,100%{opacity:0}}

/* Cannon duel at anchor */
.sea-duel{left:1.5vw;top:43vh;width:min(17vw,220px);height:auto}
.sea-duel .rock{transform-box:fill-box;transform-origin:center;animation:sea-rock 6.8s ease-in-out infinite}
.sea-duel .rock-b{animation-duration:8.3s;animation-delay:-3s}
.sea-duel .shot *{animation:29s ease-out infinite backwards;animation-delay:calc(var(--o) + 3s)}
.sea-duel .flash{opacity:0;animation-name:sea-flash}
.sea-duel .smoke circle{opacity:0;transform-box:fill-box;transform-origin:center;animation-name:sea-smoke}
.sea-duel .ball circle{opacity:0;animation-name:sea-ball;animation-delay:calc(var(--o) + 3s + var(--d) * .14s)}
.sea-duel .splash{opacity:0;transform-box:fill-box;transform-origin:50% 100%;animation-name:sea-splash;animation-delay:calc(var(--o) + 4.1s)}
.sea-duel .smoke,.sea-duel .ball{animation:none}
@keyframes sea-flash{0%{opacity:0} .4%{opacity:1} 1.6%,100%{opacity:0}}
@keyframes sea-smoke{0%{opacity:0;transform:scale(.3)} 1%{opacity:.95;transform:scale(1)} 12%{opacity:.6;transform:translate(5px,-6px) scale(1.5)} 24%,100%{opacity:0;transform:translate(9px,-13px) scale(1.9)}}
@keyframes sea-ball{0%{opacity:0} .5%{opacity:1} 4%{opacity:.8} 8%,100%{opacity:0}}
@keyframes sea-splash{0%{opacity:0;transform:scaleY(.2)} 1%{opacity:1;transform:scaleY(1)} 5%{opacity:.8;transform:scaleY(1)} 9%,100%{opacity:0;transform:scaleY(.6)}}

/* Storm cloud over the duel, with the odd faint flicker */
.sea-storm{left:5vw;top:31vh;width:min(11vw,150px);height:auto}
.sea-storm .cloud{animation:sea-cloud 47s ease-in-out infinite}
.sea-storm .rain{opacity:.7;animation:sea-rain 1.9s linear infinite}
.sea-storm .bolt{opacity:0;animation:sea-bolt 19s linear infinite;animation-delay:-6s}
.sea-storm .glow{opacity:0;animation:sea-glow 19s linear infinite;animation-delay:-6s}
@keyframes sea-cloud{0%,100%{transform:translateX(-5px)} 50%{transform:translateX(6px)}}
@keyframes sea-rain{from{transform:translate(0,-3px)} to{transform:translate(-1.5px,3px)}}
@keyframes sea-bolt{0%,90%{opacity:0} 90.6%{opacity:.9} 91.4%{opacity:0} 92.2%{opacity:.7} 93.4%,100%{opacity:0}}
@keyframes sea-glow{0%,90%{opacity:0} 90.6%{opacity:.18} 91.4%{opacity:0} 92.2%{opacity:.12} 93.4%,100%{opacity:0}}

/* Whale: surfaces, spouts twice, shows its tail as it dives */
.sea-whale{right:3vw;top:40vh;width:min(11vw,140px);height:auto}
.sea-whale .body{animation:sea-whale 37s ease-in-out infinite;animation-delay:-2s}
.sea-whale .spout{transform-box:fill-box;transform-origin:50% 100%;animation:sea-spout 37s ease-out infinite;animation-delay:-2s}
.sea-whale .tail{transform:translateY(30px);animation:sea-tail 37s ease-in-out infinite;animation-delay:-2s}
@keyframes sea-whale{0%,6%{transform:translateY(34px)} 14%,46%{transform:translateY(0)} 56%,100%{transform:translateY(34px)}}
@keyframes sea-spout{0%,17%{opacity:0;transform:scaleY(.2)} 19%{opacity:1;transform:scaleY(1)} 24%{opacity:0;transform:scaleY(1.15)}
  30%{opacity:0;transform:scaleY(.2)} 32%{opacity:.9;transform:scaleY(1)} 37%,100%{opacity:0;transform:scaleY(1.15)}}
@keyframes sea-tail{0%,52%{transform:translateY(30px)} 58%,64%{transform:translateY(0)} 72%,100%{transform:translateY(30px)}}

/* Kraken arm: rises, curls, sinks; out of phase with the whale */
.sea-kraken{right:9vw;top:60vh;width:min(6vw,80px);height:auto}
.sea-kraken .rise{animation:sea-rise 43s ease-in-out infinite;animation-delay:-24s}
.sea-kraken .arm{transform-box:fill-box;transform-origin:50% 100%;animation:sea-curl 5.5s ease-in-out infinite}
.sea-kraken .arm-b{animation-duration:4.3s;animation-delay:-2s}
@keyframes sea-rise{0%,8%{transform:translateY(90px)} 18%,40%{transform:translateY(0)} 52%,100%{transform:translateY(90px)}}
@keyframes sea-curl{0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)}}

.sea-serpent{right:5vw;bottom:9vh;width:min(18vw,230px);height:auto;opacity:.8}
.sea-serpent .hump{animation:sea-bob 7s ease-in-out infinite;animation-delay:calc(var(--k) * -1.1s)}
@keyframes sea-bob{0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)}}

/* Ships. Lanes are on clear water (see the note above SEA_CSS). */
.sea-track{position:absolute;left:0;width:76px;transform:translateX(16vw);animation:sea-sail 100s linear infinite}
.sea-track .sea-ship{position:static;display:block;width:100%;height:auto;animation:sea-rock 6s ease-in-out infinite}
.ship-a{top:52vh;animation-delay:-38s}
.ship-a .wrow path{animation:sea-row 24s ease-out infinite backwards;animation-delay:calc(var(--r) * 1.3s)}
@keyframes sea-row{0%,4%{opacity:0} 8%,84%{opacity:1} 90%,100%{opacity:0}}
.ship-b{top:max(34vh,calc(var(--coast-y) + var(--coast-w) * .75 + 8px));width:58px;transform:translateX(70vw);
  animation-name:sea-sail-back;animation-duration:130s;animation-delay:-20s}
.ship-b .sea-ship{transform:scaleX(-1);animation-name:sea-rock-back;animation-duration:7.5s}
.ship-b .ftile{animation:sea-ftile 19s ease-out infinite backwards;animation-delay:calc(var(--t) * .9s)}
@keyframes sea-ftile{0%,3%{opacity:0} 7%,82%{opacity:1} 90%,100%{opacity:0}}
.ship-c{top:73vh;width:64px;opacity:.5;transform:translateX(52vw);animation-name:sea-sail-c;animation-duration:120s;animation-delay:-75s}
.ship-c .sea-ship{animation-duration:8s;animation-delay:-2s}
@keyframes sea-sail{from{transform:translateX(-90px)} to{transform:translateX(calc(100vw + 20px))}}
@keyframes sea-sail-back{from{transform:translateX(calc(100vw + 20px))} to{transform:translateX(-90px)}}
/* Starts at the island's measured right edge so it never crosses land. */
@keyframes sea-sail-c{0%{transform:translateX(calc(var(--isle-x) + var(--isle-w) * .96 + 6px));opacity:0} 5%{opacity:.5}
  100%{transform:translateX(calc(100vw + 20px));opacity:.5}}
@keyframes sea-rock{0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(3px) rotate(2deg)}}
@keyframes sea-rock-back{0%,100%{transform:scaleX(-1) translateY(0) rotate(-2deg)} 50%{transform:scaleX(-1) translateY(3px) rotate(2deg)}}

/* Message in a bottle, drifting right to left */
.sea-drift{position:absolute;left:0;top:63vh;width:40px;transform:translateX(38vw);animation:sea-sail-back 170s linear infinite;animation-delay:-62s}
.sea-bottle{position:static;display:block;width:100%;height:auto;animation:sea-bottle 5.2s ease-in-out infinite}
@keyframes sea-bottle{0%,100%{transform:translateY(0) rotate(-9deg)} 50%{transform:translateY(2px) rotate(7deg)}}

/* Gulls */
.sea-gull{position:absolute;left:0;top:17vh;width:18px;transform:translateX(30vw);animation:sea-sail 74s linear infinite;animation-delay:-14s}
.sea-gull svg{position:static;display:block;width:100%;height:auto;animation:sea-glide 9s ease-in-out infinite}
.sea-gull .wings{transform-box:fill-box;transform-origin:center;animation:sea-flap 1.3s ease-in-out infinite}
.gull-b{top:23vh;width:14px;transform:translateX(64vw);animation-duration:93s;animation-delay:-61s}
.gull-b .wings{animation-duration:1.1s;animation-delay:-.4s}
.gull-c{top:44vh;width:20px;transform:translateX(84vw);animation-name:sea-sail-back;animation-duration:86s;animation-delay:-33s}
.gull-c svg{animation-duration:11s}
@keyframes sea-glide{0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)}}
@keyframes sea-flap{0%,100%{transform:scaleY(1)} 50%{transform:scaleY(.35)}}
/* Poople: a small brown drop, then a plop */
.gull-c .blob{opacity:0;animation:sea-blob 27s ease-in infinite;animation-delay:-9s}
.gull-c .plop{opacity:0;transform-box:fill-box;transform-origin:center;animation:sea-plop 27s ease-out infinite;animation-delay:-9s}
@keyframes sea-blob{0%,72%{opacity:0;transform:translateY(0)} 73%{opacity:1;transform:translateY(0)} 79%{opacity:1;transform:translateY(55px)} 79.5%,100%{opacity:0;transform:translateY(55px)}}
@keyframes sea-plop{0%,79%{opacity:0;transform:scale(.3)} 80%{opacity:1;transform:scale(.6)} 88%,100%{opacity:0;transform:scale(1.5)}}

@media (max-width:600px){
  .sea{opacity:.3;--coast-w:200px;--coast-x:-50px;--coast-y:-30px;--isle-w:270px;--isle-x:-70px;--isle-y:-10px}
  .sea-compass{width:120px;top:auto;bottom:5vh;right:-30px}
  .sea-water{-webkit-mask-image:radial-gradient(ellipse 150px 110px at 20% 95%,transparent 55%,#000 100%);
    mask-image:radial-gradient(ellipse 150px 110px at 20% 95%,transparent 55%,#000 100%)}
  .sea-serpent,.sea-duel,.sea-storm,.sea-kraken{display:none}
  .sea-whale{width:84px;right:-12px;top:40vh}
  .sea-globle{width:40px;right:2px;top:6px}
  .sea-track{width:52px}
  .ship-b{width:42px}
  .ship-c{width:46px}
}
`;
