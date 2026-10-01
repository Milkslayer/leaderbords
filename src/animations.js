// Small looping game illustrations, pure CSS/SVG. Base styles are the final
// (resting) state, so prefers-reduced-motion simply switches the loops off.

const INK = '#38230f';

function wordle() {
  const tiles = [
    ['I', '#958a75'],
    ['N', '#c29a3c'],
    ['K', '#6e8a49'],
    ['E', '#6e8a49'],
    ['D', '#6e8a49'],
  ];
  return `<div class="wordle">${tiles
    .map(([l, c], k) => `<span style="--c:${c};--k:${k}">${l}</span>`)
    .join('')}</div>`;
}

function globle(uid) {
  const clip = `globe-clip-${uid}`;
  const sketch = `globe-sketch-${uid}`;
  return `<svg class="globe" viewBox="0 0 100 100" style="width:calc(92px * var(--s));height:calc(92px * var(--s))">
<defs>
<clipPath id="${clip}"><circle cx="50" cy="50" r="40"/></clipPath>
<filter id="${sketch}"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
</defs>
<circle cx="50" cy="50" r="40" fill="#efe1bd"/>
<g clip-path="url(#${clip})">
<path class="land" d="M22 30c6-5 14-4 18 1s1 10-4 12-3 8-8 9-11-4-11-10 1-9 5-12z"/>
<path class="land" style="animation-delay:-2.3s,-2.3s" d="M48 52c5-3 12-2 14 3s-2 8 0 13-4 9-9 7-6-7-8-11 0-9 3-12z"/>
<path class="land" style="animation-delay:-4.6s,-4.6s" d="M60 24c7-2 15 1 16 6s-5 6-9 7-9-1-10-5 0-7 3-8z"/>
</g>
<g fill="none" stroke="${INK}" stroke-linecap="round" filter="url(#${sketch})">
<g stroke-width=".7" opacity=".65">
<ellipse class="meridian" cx="50" cy="50" rx="40" ry="40"/>
<ellipse class="meridian" style="animation-delay:-1.75s" cx="50" cy="50" rx="40" ry="40"/>
<ellipse class="meridian" style="animation-delay:-3.5s" cx="50" cy="50" rx="40" ry="40"/>
<ellipse class="meridian" style="animation-delay:-5.25s" cx="50" cy="50" rx="40" ry="40"/>
<path d="M14 34h72M10 50h80M14 66h72" opacity=".8"/>
</g>
<circle cx="50" cy="50" r="40" stroke-width="1.6"/>
</g>
</svg>`;
}

function flagle() {
  // Muted tricolour, 6 columns x 4 rows, revealed tile by tile.
  const colours = ['#56704a', '#56704a', '#efe3c4', '#efe3c4', '#9b3b28', '#9b3b28'];
  const order = [5, 0, 9, 14, 3, 18, 11, 7, 20, 1, 16, 12, 22, 6, 2, 19, 10, 23, 4, 15, 8, 21, 13, 17];
  const cols = colours
    .map((c, k) => {
      const cells = [0, 1, 2, 3]
        .map((r) => `<span style="--c:${c};--t:${order[r * 6 + k]}"></span>`)
        .join('');
      return `<div class="col" style="--k:${k}">${cells}</div>`;
    })
    .join('');
  return `<div class="flag"><div class="pole"></div><div class="cloth">${cols}</div></div>`;
}

function countryle(uid) {
  const sketch = `compass-sketch-${uid}`;
  const ticks = Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI) / 8;
    const r1 = i % 4 === 0 ? 31 : 34;
    const p = (r) => `${(50 + r * Math.sin(a)).toFixed(1)} ${(50 - r * Math.cos(a)).toFixed(1)}`;
    return `M${p(r1)}L${p(37)}`;
  }).join('');
  return `<div class="compass-pair">
<svg class="compass" viewBox="0 0 100 100" style="width:calc(92px * var(--s));height:calc(92px * var(--s))">
<defs><filter id="${sketch}"><feTurbulence type="fractalNoise" baseFrequency=".07" numOctaves="2" seed="9"/><feDisplacementMap in="SourceGraphic" scale="1.8"/></filter></defs>
<circle cx="50" cy="50" r="42" fill="#efe1bd"/>
<g fill="none" stroke="${INK}" filter="url(#${sketch})">
<circle cx="50" cy="50" r="42" stroke-width="1.8"/>
<circle cx="50" cy="50" r="37" stroke-width=".6"/>
<path d="${ticks}" stroke-width=".9"/>
</g>
<text x="50" y="23" text-anchor="middle" font-family="IM Fell English, Georgia, serif" font-size="11" fill="#8b2a1b">N</text>
<g class="needle">
<path d="M50 20L55 50L50 80L45 50Z" fill="${INK}"/>
<path d="M50 20L55 50L45 50Z" fill="#8b2a1b"/>
</g>
<circle cx="50" cy="50" r="3" fill="#c29a3c" stroke="${INK}" stroke-width=".8"/>
</svg>
<svg class="country" viewBox="0 0 60 80" style="width:calc(54px * var(--s));height:calc(72px * var(--s))">
<path class="outline" pathLength="1" fill="rgba(194,154,60,.18)" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"
d="M22 6l9 3 4-2 6 5-1 7 6 4-2 6 5 5-3 6 4 8-5 4 1 7-6 5-2 8-6 2-4-5-5 1-3-6 2-6-5-4 2-7-4-5 3-6-1-7 5-4-1-6 4-5z"/>
</svg>
</div>`;
}

const RENDER = { wordle, globle, flagle, countryle };

export function gameAnimation(gameId, { size = 'lg' } = {}) {
  const render = Object.hasOwn(RENDER, gameId) ? RENDER[gameId] : null;
  if (!render) return '';
  const s = size === 'sm' ? 'sm' : 'lg';
  return `<div class="anim anim-${s}" data-anim="${gameId}" aria-hidden="true">${render(s)}</div>`;
}
