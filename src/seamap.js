// Background treasure map: faint inked sea, coastlines, compass rose, ships, a
// dotted route to the X and a small sea serpent. Pure SVG/CSS; animations touch
// only transform/opacity. Base styles are the resting state, so the global
// prefers-reduced-motion rule leaves a still map.

const INK = '#38230f';
const RED = '#8b2a1b';

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
    return `<path d="M0 0L${xy(deg - 90, w)}L${xy(deg, len)}Z" fill="#f2e6c8"/><path d="M0 0L${xy(deg + 90, w)}L${xy(deg, len)}Z" fill="${INK}"/>`;
  };
  const rose = [45, 135, 225, 315].map((d) => point(d, 36, 7)).join('') +
    [0, 90, 180, 270].map((d) => point(d, 56, 9)).join('');
  return `<svg class="sea-compass" viewBox="-100 -100 200 200">
<path class="rhumbs" d="${rhumbs}" stroke="${INK}" stroke-width=".7"/>
<g class="ring" fill="none" stroke="${INK}">
<circle r="69" stroke-width="1.6"/><circle r="64" stroke-width=".6"/><circle r="56" stroke-width=".5" stroke-dasharray="2 3"/>
<path d="${ticks}" stroke-width=".8"/>
</g>
<g class="rose" stroke="${INK}" stroke-width=".8" stroke-linejoin="round">${rose}<circle r="4" fill="#c29a3c"/></g>
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
<g fill="none" stroke="${INK}" stroke-linecap="round">
<path d="${coast}L0 0Z" fill="rgba(194,154,60,.16)" stroke-width="1.6"/>
<path d="${coast}" transform="translate(9 9)" stroke-width=".7"/>
<path d="${coast}" transform="translate(19 19)" stroke-width=".6" stroke-dasharray="1 5"/>
<path d="M40 120l10-16 10 16M58 112l8-13 8 13M110 70l10-16 10 16M30 170l8-12 8 12M150 40l8-13 8 13" stroke-width="1"/>
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

const SHIP = `<symbol id="sea-ship" viewBox="0 0 64 52">
<g fill="none" stroke="${INK}" stroke-linecap="round" stroke-linejoin="round">
<path d="M4 33h50l-6 8H11z" fill="rgba(56,35,15,.35)" stroke-width="1.4"/>
<path d="M54 33l9-5M30 33V5M45 33V11" stroke-width="1.3"/>
<path d="M21 9q9 3 18 0v9q-9 3-18 0zM19 21q11 3 22 0v9q-11 3-22 0zM40 14q5 2 10 0v13q-5 2-10 0zM46 11l16 17H48" fill="#f2e6c8" stroke-width="1.1"/>
<path d="M30 5l7 2-7 2" fill="${RED}" stroke="${RED}" stroke-width=".8"/>
<path d="M0 46q5-4 10 0t10 0M40 47q5-4 10 0t10 0" stroke-width=".9"/>
</g>
</symbol>`;

const ship = (cls) =>
  `<div class="sea-track ${cls}"><svg class="sea-ship" viewBox="0 0 64 52"><use href="#sea-ship"/></svg></div>`;

export const SEA_MAP = `<div class="sea" data-bg="sea-map" aria-hidden="true">
<svg width="0" height="0" style="position:absolute">${SHIP}</svg>
<div class="sea-water"><div class="sea-waves"></div><div class="sea-waves sea-waves-b"></div></div>
${mainland()}
${compass()}
${island()}
${serpent()}
${ship('ship-a')}
${ship('ship-b')}
${ship('ship-c')}
</div>`;

export const SEA_CSS = `
/* Background treasure map */
.sea{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;opacity:.4}
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

.sea-coast{top:0;left:0;width:min(30vw,380px);height:auto}
.sea-compass{top:12vh;right:4vw;width:min(17vw,210px);height:auto}
.sea-compass .rhumbs{opacity:.35}
.sea-compass .ring{transform-box:fill-box;transform-origin:center;animation:sea-turn 240s linear infinite}
.sea-compass .rose{transform-box:fill-box;transform-origin:center;animation:sea-breathe 14s ease-in-out infinite}
@keyframes sea-turn{to{transform:rotate(360deg)}}
@keyframes sea-breathe{0%,100%{transform:rotate(-3deg) scale(1)} 50%{transform:rotate(3deg) scale(1.04)}}

.sea-island{left:-1vw;bottom:3vh;width:min(25vw,360px);height:auto}
.sea-island .route circle{animation:sea-dot 26s ease-out infinite backwards;animation-delay:calc(var(--d) * .7s)}
@keyframes sea-dot{0%{opacity:0} 3%,62%{opacity:1} 70%,100%{opacity:0}}
.sea-island .x-mark{transform-box:fill-box;transform-origin:center;opacity:1;
  animation:sea-x 26s ease-out infinite backwards;animation-delay:11.9s}
@keyframes sea-x{0%{opacity:0;transform:scale(1.6)} 4%{opacity:1;transform:scale(1)} 40%{opacity:1;transform:scale(1)} 50%,100%{opacity:0;transform:scale(1)}}

.sea-serpent{right:5vw;bottom:9vh;width:min(18vw,230px);height:auto;opacity:.8}
.sea-serpent .hump{animation:sea-bob 7s ease-in-out infinite;animation-delay:calc(var(--k) * -1.1s)}
@keyframes sea-bob{0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)}}

.sea-track{position:absolute;left:0;width:76px;transform:translateX(16vw);animation:sea-sail 100s linear infinite}
.sea-track .sea-ship{position:static;display:block;width:100%;height:auto;animation:sea-rock 6s ease-in-out infinite}
.ship-a{top:60vh;animation-delay:-38s}
.ship-b{top:41vh;width:58px;transform:translateX(70vw);animation-name:sea-sail-back;animation-duration:130s;animation-delay:-20s}
.ship-b .sea-ship{transform:scaleX(-1);animation-name:sea-rock-back;animation-duration:7.5s}
.ship-c{top:81vh;width:64px;opacity:.5;transform:translateX(52vw);animation-duration:150s;animation-delay:-105s}
.ship-c .sea-ship{animation-duration:8s;animation-delay:-2s}
@keyframes sea-sail{from{transform:translateX(-90px)} to{transform:translateX(calc(100vw + 20px))}}
@keyframes sea-sail-back{from{transform:translateX(calc(100vw + 20px))} to{transform:translateX(-90px)}}
@keyframes sea-rock{0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(3px) rotate(2deg)}}
@keyframes sea-rock-back{0%,100%{transform:scaleX(-1) translateY(0) rotate(-2deg)} 50%{transform:scaleX(-1) translateY(3px) rotate(2deg)}}

@media (max-width:600px){
  .sea{opacity:.3}
  .sea-coast{width:200px;left:-50px;top:-30px}
  .sea-compass{width:120px;top:auto;bottom:5vh;right:-30px}
  .sea-island{width:270px;left:-70px;bottom:-10px}
  .sea-water{-webkit-mask-image:radial-gradient(ellipse 150px 110px at 20% 95%,transparent 55%,#000 100%);
    mask-image:radial-gradient(ellipse 150px 110px at 20% 95%,transparent 55%,#000 100%)}
  .sea-serpent{display:none}
  .sea-track{width:52px}
  .ship-b{width:42px}
  .ship-c{width:46px}
}
`;
