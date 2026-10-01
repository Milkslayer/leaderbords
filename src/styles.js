// Parchment / old-ledger look. Pure CSS; grain comes from an inline SVG noise filter.

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .25 0 0 0 0 .16 0 0 0 0 .07 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const FIBRES = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012 .04' numOctaves='4' seed='7'/%3E%3CfeColorMatrix values='0 0 0 0 .45 0 0 0 0 .3 0 0 0 0 .12 0 0 0 .35 -.05'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")`;

// Speckled mask that makes stamped ink look unevenly pressed.
const STAMP_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.6 2.15'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23s)'/%3E%3C/svg%3E")`;

export const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=IM+Fell+English:ital@0;1&display=swap';

export const CSS = `
:root{
  --paper:#e8d6ae;
  --paper-hi:#f2e6c8;
  --sheet:#f0e2bf;
  --ink:#38230f;
  --ink-soft:#6a4d2e;
  --ink-faint:#9b8160;
  --rule:#c2a87d;
  --rule-blue:#8f9aa0;
  --red:#8b2a1b;
  --red-dk:#5e1a10;
  --w-green:#6e8a49;
  --w-yellow:#c29a3c;
  --w-grey:#958a75;
  --serif:"EB Garamond",Garamond,"Iowan Old Style",Georgia,serif;
  --fell:"IM Fell English","EB Garamond",Georgia,serif;
}
*,*::before,*::after{box-sizing:border-box}
html{
  min-height:100%;
  background-color:var(--paper);
  background-image:
    ${NOISE},
    ${FIBRES},
    radial-gradient(ellipse at 50% 30%,var(--paper-hi) 0%,var(--paper) 55%,#d9c091 100%);
}
body{
  margin:0;min-height:100vh;color:var(--ink);
  font:18px/1.6 var(--serif);
  font-variant-numeric:oldstyle-nums proportional-nums;
  overflow-x:hidden;
}
body::after{
  content:"";position:fixed;inset:0;pointer-events:none;z-index:50;
  background:
    radial-gradient(ellipse at 50% 45%,transparent 55%,rgba(110,70,25,.22) 85%,rgba(70,40,12,.45) 100%),
    linear-gradient(90deg,rgba(90,55,20,.18),transparent 6%,transparent 94%,rgba(90,55,20,.18));
}
a{color:var(--red);text-decoration-thickness:1px;text-underline-offset:3px}
a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{
  outline:2px dashed var(--red);outline-offset:3px
}
::selection{background:rgba(139,42,27,.25)}

/* Masthead */
.masthead{max-width:760px;margin:0 auto;padding:28px 16px 0;text-align:center}
.masthead .title{
  display:inline-block;font:400 clamp(1.9rem,6vw,2.7rem)/1.05 var(--fell);
  color:var(--ink);text-decoration:none;letter-spacing:.01em
}
.masthead .rule{
  display:block;height:7px;margin:12px auto 0;max-width:420px;
  border-top:2px solid var(--ink);border-bottom:1px solid var(--ink);opacity:.75
}
.masthead nav{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 22px;padding:10px 0 4px}
.masthead nav a{
  font-variant:small-caps;letter-spacing:.06em;font-size:1.08rem;
  color:var(--ink-soft);text-decoration:none;padding:2px 0;border-bottom:1px solid transparent
}
.masthead nav a:hover{color:var(--ink);border-bottom-color:var(--ink-faint)}
.masthead nav a[aria-current="page"]{color:var(--red);border-bottom-color:var(--red)}

main{max-width:760px;margin:0 auto;padding:8px 16px 64px}
h1,h2{font-family:var(--fell);font-weight:400;color:var(--ink);line-height:1.15}
h1{font-size:clamp(2rem,6vw,2.6rem);margin:28px 0 14px}
h2{font-size:1.45rem;margin:36px 0 10px}
p{margin:0 0 12px}

/* Showcase strip */
.showcase{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:26px 0 8px}
.showcase a{
  display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 8px 10px;
  text-decoration:none;color:var(--ink);
  background:linear-gradient(var(--sheet),#ead9b2);
  border:1px solid rgba(110,80,40,.35);
  box-shadow:0 1px 0 rgba(255,250,235,.6) inset,1px 2px 0 rgba(90,60,25,.12),2px 5px 12px -6px rgba(70,40,10,.45);
  transition:transform .2s ease,box-shadow .2s ease
}
.showcase a:nth-child(odd){transform:rotate(-.6deg)}
.showcase a:nth-child(even){transform:rotate(.5deg)}
.showcase a:hover{transform:rotate(0) translateY(-2px);box-shadow:0 1px 0 rgba(255,250,235,.6) inset,2px 8px 16px -8px rgba(70,40,10,.55)}
.showcase .art{height:62px;display:grid;place-items:center}
.showcase .name{font:400 1.2rem/1 var(--fell)}

/* Game header */
.game-head{display:flex;align-items:center;gap:22px;margin:22px 0 6px}
.game-head h1{margin:0}
.game-head .anim{flex:none}

/* Bookmark tabs */
.tabs{display:flex;gap:6px;margin:18px 0 0;padding-left:18px;position:relative;z-index:1}
.tabs a{
  position:relative;padding:6px 16px 8px;font-variant:small-caps;letter-spacing:.05em;
  color:var(--ink-soft);text-decoration:none;
  background:linear-gradient(#e4cfa2,#dbc393);
  border:1px solid rgba(110,80,40,.4);border-bottom:0;border-radius:6px 6px 0 0;
  box-shadow:inset 0 1px 0 rgba(255,250,235,.5);top:4px;transition:top .15s ease
}
.tabs a:hover{top:1px;color:var(--ink)}
.tabs a.active{
  top:1px;color:var(--paper-hi);background:linear-gradient(#9a3322,var(--red));
  border-color:var(--red-dk);padding-bottom:11px
}
.tabs a.active::after{
  content:"";position:absolute;left:50%;bottom:-6px;width:10px;height:10px;margin-left:-5px;
  background:var(--red);transform:rotate(45deg);border-right:1px solid var(--red-dk);border-bottom:1px solid var(--red-dk)
}

/* Ledger sheet */
.ledger{
  position:relative;
  background:
    linear-gradient(90deg,transparent 52px,rgba(139,42,27,.55) 52px,rgba(139,42,27,.55) 53px,transparent 53px,transparent 56px,rgba(139,42,27,.55) 56px,rgba(139,42,27,.55) 57px,transparent 57px),
    linear-gradient(var(--sheet),#ecdcb6);
  border:1px solid rgba(110,80,40,.4);
  box-shadow:1px 2px 0 rgba(90,60,25,.12),3px 10px 24px -12px rgba(60,35,10,.55);
  padding:6px 0 10px
}
.ledger.plain{background:linear-gradient(var(--sheet),#ecdcb6)}
.ledger-scroll{overflow-x:auto}
table{width:100%;border-collapse:collapse}
th,td{padding:10px 14px;text-align:left;vertical-align:middle}
th{
  font:400 .98rem/1.2 var(--fell);font-style:italic;color:var(--ink-soft);
  border-bottom:2px solid var(--ink);padding-top:12px;padding-bottom:8px
}
td{border-bottom:1px solid rgba(143,154,160,.55)}
tbody tr:last-child td{border-bottom:1px solid var(--ink-faint)}
td.num,th.num{text-align:right}
td.rank,th.rank{width:56px;text-align:center;padding-left:6px;padding-right:6px}
td.player{font-size:1.1rem}
td.date{white-space:nowrap}
table.board tbody tr{animation:inkin .7s ease-out backwards;animation-delay:calc(var(--i,0) * 90ms + 120ms)}
@keyframes inkin{from{opacity:0} to{opacity:1}}
.numeral{font-family:var(--fell);font-size:1.15rem;color:var(--ink-soft)}

/* Wax seals */
.seal{
  position:relative;display:inline-grid;place-items:center;width:34px;height:34px;
  border-radius:48% 52% 46% 54% / 53% 47% 55% 45%;
  font:400 1rem/1 var(--fell);color:rgba(255,240,220,.85);
  text-shadow:0 -1px 0 rgba(0,0,0,.35),0 1px 0 rgba(255,255,255,.18);
  box-shadow:
    inset 0 0 0 4px rgba(0,0,0,.08),
    inset 0 0 0 5px rgba(255,255,255,.12),
    inset -3px -4px 6px rgba(0,0,0,.25),
    1px 2px 2px rgba(60,30,10,.35);
  vertical-align:middle
}
.seal::before{
  content:"";position:absolute;inset:-3px;z-index:-1;border-radius:41% 59% 52% 48% / 45% 55% 47% 53%;
  background:inherit;filter:brightness(.88)
}
.seal-1{background:radial-gradient(circle at 34% 28%,#c24a35 0%,#9c2d1d 45%,#6b170d 100%)}
.seal-2{background:radial-gradient(circle at 34% 28%,#eceae4 0%,#a9a7a1 50%,#6f6d68 100%);color:var(--ink);text-shadow:0 1px 0 rgba(255,255,255,.45)}
.seal-3{background:radial-gradient(circle at 34% 28%,#d9a16a 0%,#a2672f 50%,#6a3e17 100%)}
.seal{isolation:isolate}

/* Ink-stamped figures */
.stamp{
  display:inline-block;font:400 1.2rem/1 var(--fell);color:var(--red);
  padding:3px 7px 2px;border:1.5px solid currentColor;border-radius:3px;transform:rotate(-2.5deg);
  -webkit-mask-image:${STAMP_MASK};mask-image:${STAMP_MASK};-webkit-mask-size:120px;mask-size:120px;
  font-variant-numeric:lining-nums tabular-nums
}
tbody tr:nth-child(even) .stamp{transform:rotate(1.8deg)}

.empty{
  margin:0;padding:28px 18px 24px 72px;font-style:italic;color:var(--ink-soft)
}
.error{
  margin:14px 0;padding:10px 14px;color:var(--red-dk);
  background:rgba(139,42,27,.08);border-left:3px solid var(--red);font-style:italic
}

/* Forms: ruled paper lines and stamped labels */
form{margin:0 0 14px}
.sheet-form{padding:12px 20px 8px;margin-bottom:6px}
label{display:block;margin:14px 0 0;font:italic 400 1rem/1.3 var(--fell);color:var(--ink-soft)}
input,select,textarea{
  font:inherit;color:var(--ink);width:100%;max-width:100%;
  background:transparent;border:0;border-bottom:1px solid var(--ink-faint);border-radius:0;
  padding:4px 2px 3px
}
input:focus,select:focus,textarea:focus{border-bottom-color:var(--red);outline-offset:2px}
select{appearance:none;-webkit-appearance:none;cursor:pointer;
  background:linear-gradient(45deg,transparent 50%,var(--ink-soft) 50%) right 10px center/6px 6px no-repeat,
             linear-gradient(-45deg,transparent 50%,var(--ink-soft) 50%) right 4px center/6px 6px no-repeat;
  padding-right:24px}
textarea{
  min-height:150px;resize:vertical;line-height:30px;padding:0 2px;border-bottom:0;
  background:repeating-linear-gradient(transparent 0,transparent 29px,var(--rule-blue) 29px,var(--rule-blue) 30px);
  background-attachment:local
}
button{
  font:500 1rem/1 var(--serif);font-variant:small-caps;letter-spacing:.08em;cursor:pointer;
  color:var(--red);background:transparent;padding:8px 14px 9px;
  border:2px solid currentColor;border-radius:4px;
  box-shadow:inset 0 0 0 2px var(--sheet),inset 0 0 0 3px currentColor;
  transform:rotate(-1.2deg);
  -webkit-mask-image:${STAMP_MASK};mask-image:${STAMP_MASK};-webkit-mask-size:120px;mask-size:120px;
  transition:transform .12s ease,background-color .12s ease
}
button:focus-visible{-webkit-mask-image:none;mask-image:none;outline:2px dashed var(--red);outline-offset:3px}
button:hover{background:rgba(139,42,27,.08);transform:rotate(-1.2deg) scale(1.03)}
button:active{transform:rotate(-1.2deg) scale(.97)}
.actions{margin:20px 0 4px}
.inline-row{display:flex;gap:16px;align-items:flex-end}
.inline-row input{flex:1}
form.inline{display:inline;margin:0}
td form.inline button{font-size:.85rem;padding:5px 9px 6px;color:var(--ink-soft)}
.logout{margin-top:32px;text-align:right}
.logout button{color:var(--ink-soft)}
.login{max-width:420px}

/* Game animations */
.anim{--s:1;display:inline-block;line-height:0}
.anim-sm{--s:.72}
.anim svg{display:block;overflow:visible}

/* Wordle tiles */
.wordle{display:flex;gap:calc(5px * var(--s));perspective:400px;line-height:1}
.wordle span{
  width:calc(30px * var(--s));height:calc(34px * var(--s));display:grid;place-items:center;
  font:400 calc(1.25rem * var(--s))/1 var(--fell);color:#f6ecd4;
  background:var(--c);border:1px solid rgba(60,35,10,.35);border-radius:2px;
  box-shadow:inset 0 -2px 0 rgba(0,0,0,.12);
  animation:flip 6.5s ease-in-out infinite;animation-delay:calc(var(--k) * .28s)
}
@keyframes flip{
  0%,6%{transform:rotateX(0);background:#efe2c0;color:var(--ink)}
  12%{transform:rotateX(90deg);background:#efe2c0;color:var(--ink)}
  12.1%{background:var(--c);color:#f6ecd4}
  18%,86%{transform:rotateX(0);background:var(--c);color:#f6ecd4}
  92%,100%{transform:rotateX(0);background:#efe2c0;color:var(--ink)}
}

/* Globle */
.globe .meridian{transform-origin:50px 50px;transform:scaleX(var(--m,1));animation:spin 7s linear infinite}
@keyframes spin{
  0%{transform:scaleX(1)} 25%{transform:scaleX(0)} 50%{transform:scaleX(-1)} 75%{transform:scaleX(0)} 100%{transform:scaleX(1)}
}
.globe .land{animation:drift 7s linear infinite,warm 7s ease-in-out infinite}
@keyframes drift{0%{transform:translateX(-36px);opacity:0} 12%,88%{opacity:1} 100%{transform:translateX(36px);opacity:0}}
@keyframes warm{0%,15%{fill:#e3c15a} 45%{fill:#d9822f} 75%,100%{fill:#a8321f}}
.globe .land{fill:#a8321f;transform:translateX(0)}

/* Flagle */
.flag{display:flex;align-items:flex-start;line-height:0}
.flag .pole{width:calc(3px * var(--s));height:calc(66px * var(--s));background:linear-gradient(90deg,#4a3018,#7b5a35);border-radius:2px}
.flag .cloth{display:flex;filter:drop-shadow(1px 2px 1px rgba(60,35,10,.3))}
.flag .col{display:flex;flex-direction:column;animation:wave 2.4s ease-in-out infinite;animation-delay:calc(var(--k) * -.22s)}
.flag .col span{
  display:block;width:calc(13px * var(--s));height:calc(14px * var(--s));background:var(--c);
  animation:fillin 7s ease-out infinite;animation-delay:calc(var(--t) * .15s)
}
@keyframes wave{0%,100%{transform:translateY(0)} 50%{transform:translateY(calc(4px * var(--s)))}}
@keyframes fillin{
  0%,4%{background:#e6d3a8;box-shadow:inset 0 0 0 .5px rgba(90,60,25,.35)}
  10%,88%{background:var(--c);box-shadow:none}
  95%,100%{background:#e6d3a8;box-shadow:inset 0 0 0 .5px rgba(90,60,25,.35)}
}

/* Countryle */
.compass-pair{display:flex;align-items:center;gap:calc(8px * var(--s))}
.compass .needle{transform-origin:50px 50px;transform:rotate(48deg);animation:swing 6s cubic-bezier(.3,.1,.3,1) infinite}
@keyframes swing{
  0%{transform:rotate(-30deg)}
  14%{transform:rotate(150deg)}
  28%{transform:rotate(10deg)}
  40%{transform:rotate(80deg)}
  50%{transform:rotate(38deg)}
  58%{transform:rotate(54deg)}
  64%,92%{transform:rotate(48deg)}
  100%{transform:rotate(-30deg)}
}
.country .outline{stroke-dasharray:1;stroke-dashoffset:0;animation:trace 6s ease-in-out infinite}
@keyframes trace{0%{stroke-dashoffset:1} 40%,92%{stroke-dashoffset:0} 100%{stroke-dashoffset:1}}

/* Poople */
.poople{display:flex;gap:calc(5px * var(--s));line-height:1}
.poople span{
  position:relative;width:calc(30px * var(--s));height:calc(34px * var(--s));display:grid;place-items:center;
  background:#7a5230;border:1px solid rgba(60,35,10,.35);border-radius:2px;
  box-shadow:inset 0 -2px 0 rgba(0,0,0,.15);
  animation:brown 8s ease-in-out infinite backwards;animation-delay:calc(var(--k) * .9s)
}
.poople i{
  grid-area:1/1;font:400 calc(1.25rem * var(--s))/1 var(--fell);font-style:normal;color:#f6ecd4;
  animation:letter-in 8s ease-in-out infinite backwards;animation-delay:calc(var(--k) * .9s)
}
.poople i.from{color:var(--ink);animation-name:letter-out}
@keyframes brown{
  0%,10%{background:#efe2c0;transform:translateY(0)}
  14%{background:#efe2c0;transform:translateY(calc(-4px * var(--s)))}
  18%,86%{background:#7a5230;transform:translateY(0)}
  94%,100%{background:#efe2c0;transform:translateY(0)}
}
@keyframes letter-in{
  0%,13%{opacity:0}
  18%,86%{opacity:1}
  94%,100%{opacity:0}
}
@keyframes letter-out{
  0%,12%{opacity:1}
  16%,92%{opacity:0}
  98%,100%{opacity:1}
}

@media (max-width:600px){
  body{font-size:17px}
  .showcase{grid-template-columns:repeat(2,1fr);gap:12px}
  .game-head{gap:14px}
  .game-head .anim{--s:.78}
  th,td{padding:9px 8px}
  .ledger.plain th,.ledger.plain td{padding-left:6px;padding-right:6px}
  .ledger.plain td{font-size:.95rem}
  td.rank,th.rank{width:50px}
  .ledger{background:
    linear-gradient(90deg,transparent 48px,rgba(139,42,27,.5) 48px,rgba(139,42,27,.5) 49px,transparent 49px,transparent 51px,rgba(139,42,27,.5) 51px,rgba(139,42,27,.5) 52px,transparent 52px),
    linear-gradient(var(--sheet),#ecdcb6)}
  .ledger.plain{background:linear-gradient(var(--sheet),#ecdcb6)}
  .tabs{padding-left:10px}
  .tabs a{padding:6px 11px 8px}
  .empty{padding-left:64px}
  .sheet-form{padding:8px 14px 6px}
}
@media (max-width:380px){
  .game-head{flex-direction:column;align-items:flex-start}
}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none !important;transition:none !important}
}
`;
