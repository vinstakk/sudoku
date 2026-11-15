/* Figuren für Alex' Sudoku: Vincent (Spielleiter) und Alex – Kawaii-Chibi-Stil.
   Großer runder Kopf, große glänzende Augen, Pausbacken, kleiner runder Körper.
   Teile einzeln animierbar (CSS): Pose über data-pose, Gesicht über data-face, Extras über data-props.
   Gelenkpunkte (viewBox 0 0 100 166): Hals 50/80, Schultern 31/82 und 69/82, Hüften 44/122 und 56/122. */
(function (root) {
  'use strict';
  let uid = 0;

  const OUT = '#4a2c3a', INK = '#2a1b22';
  const SKIN = '#ffdcc4', SHADE = '#f2b89a', CHEEK = '#ff8fa3';
  const V = { hair: '#6b4630', hairHi: '#9a6c48', beard: '#6b4630', iris: '#5d7f9c',
    sweater: '#2f6b4f', sweaterDk: '#25553f', sweaterHi: '#3f8463', shorts: '#b4ecd8', shortsDk: '#92dcc2', shoe: '#ffffff', sole: '#d9d9e3' };
  const A = { hair: '#3a231d', hairHi: '#6a463a', iris: '#6b3a28', lip: '#e0607a',
    shirt: '#ffffff', stripe: '#2a2a3a', pants: '#2a2833', shoe: '#34323f', sole: '#ececf3', gold: '#e2ac3f' };

  // Weiche Umrandung: erst dunkel und breit, dann Farbe darüber
  const line = (d, color, w) => `<path d="${d}" stroke="${OUT}" stroke-width="${w + 3.2}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="${d}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

  function arm(cls, side, sleeve, cuff, w, stripes) {
    const sx = 50 + side * 19, d = `M${sx} 82Q${sx + side * 4} 94 ${sx + side * 5} 104`;
    const hx = sx + side * 5.4, hy = 107.4;
    return `<g class="f-arm ${cls}">
      ${line(d, sleeve, w)}
      ${stripes ? `<path d="${d}" stroke="${stripes}" stroke-width="${w - .6}" stroke-dasharray="2 2.6" fill="none"/>` : ''}
      ${cuff ? `<path d="M${sx + side * 4.6} 100Q${sx + side * 4.9} 102 ${sx + side * 5} 104" stroke="${cuff}" stroke-width="${w}" stroke-linecap="round" fill="none"/>` : ''}
      <circle cx="${hx}" cy="${hy}" r="4.8" fill="${SKIN}" stroke="${OUT}" stroke-width="1.6"/>
    </g>`;
  }

  // Große Kulleraugen
  function eyes(iris, lashes) {
    const eye = (cx) => `
      <ellipse cx="${cx}" cy="54" rx="5.4" ry="6.6" fill="${INK}"/>
      <ellipse cx="${cx}" cy="55.4" rx="4" ry="4.6" fill="${iris}"/>
      <ellipse cx="${cx}" cy="55.8" rx="2.2" ry="2.6" fill="${INK}"/>
      <circle cx="${cx + 1.9}" cy="51.4" r="2.2" fill="#fff"/><circle cx="${cx - 2}" cy="57.6" r="1" fill="#fff" opacity=".9"/>
      ${lashes ? `<path d="M${cx + (cx < 50 ? -4.6 : 4.6)} 50.4l${cx < 50 ? -2.2 : 2.2} -1.8M${cx + (cx < 50 ? -5.4 : 5.4)} 53l${cx < 50 ? -2.4 : 2.4} -.8" stroke="${INK}" stroke-width="1.4" stroke-linecap="round"/>` : ''}`;
    return `<g class="f-eyes">${eye(37.5)}${eye(62.5)}</g>
      <g class="f-eyes-closed"><path d="M32.4 55Q37.5 59.4 42.6 55M57.4 55Q62.5 59.4 67.6 55" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
  }

  function mouths(smile, lip) {
    return `<g class="f-mouth">${smile}
      <path class="m-open" d="M45 65.2Q50 73 55 65.2Z" fill="#7a2a3a" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/>
      <path class="m-open" d="M47 68.6Q50 67 53 68.6Q50 71 47 68.6Z" fill="#ff8fa3"/>
      <ellipse class="m-o" cx="50" cy="67.4" rx="2.4" ry="2.8" fill="#7a2a3a" stroke="${INK}" stroke-width=".9"/>
      <path class="m-kiss" d="M48.4 65.4q2.6-1.6 3.4.6q-.8 1 0 2q-.8 2.2-3.4.6" stroke="${lip}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="m-flat" d="M46.6 67h6.8" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/></g>`;
  }

  const HEAD = 'M19 50Q19 19.4 50 19Q81 19.4 81 50Q81 75.6 50 77Q19 75.6 19 50Z';
  const head = `<circle cx="19.6" cy="55" r="4.6" fill="${SKIN}" stroke="${OUT}" stroke-width="1.6"/><circle cx="80.4" cy="55" r="4.6" fill="${SKIN}" stroke="${OUT}" stroke-width="1.6"/>
    <path d="${HEAD}" fill="${SKIN}" stroke="${OUT}" stroke-width="1.8"/>`;
  const cheeks = `<ellipse class="f-cheek" cx="29.4" cy="63.4" rx="5.6" ry="3.4" fill="${CHEEK}" opacity=".5"/><ellipse class="f-cheek" cx="70.6" cy="63.4" rx="5.6" ry="3.4" fill="${CHEEK}" opacity=".5"/>`;
  const nose = `<path d="M48.8 61.2q1.2 1.1 2.4 0" stroke="${SHADE}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  const hat = (c1, c2) => `<g class="f-hat"><path d="M41 19L50-6l9 25z" fill="${c1}" stroke="${OUT}" stroke-width="1.6" stroke-linejoin="round"/><path d="M43.6 11.6l11.6-2M46.4 3.4l7-1.2" stroke="${c2}" stroke-width="2.6"/><circle cx="50" cy="-6" r="3.6" fill="${c2}" stroke="${OUT}" stroke-width="1.3"/></g>`;
  const sign = `<g class="f-sign"><rect x="14" y="101.5" width="72" height="27" rx="7" fill="#d6455d" stroke="${OUT}" stroke-width="1.8"/>
    <text x="50" y="121.6" text-anchor="middle" font-family="Nunito, ui-rounded, system-ui, sans-serif" font-size="14.5" font-weight="900" fill="#fff" letter-spacing="1.5">PAUSE</text></g>`;
  const shoe = (x, color, sole, lace) => `<path d="M${x - 8.2} 151.2Q${x - 8.4} 143.6 ${x - .4} 143.4Q${x + 7.8} 143.6 ${x + 8} 150.2Q${x + 8} 154.4 ${x + 3.6} 154.4H${x - 4.8}Q${x - 8.2} 154.4 ${x - 8.2} 151.2Z" fill="${color}" stroke="${OUT}" stroke-width="1.6"/>
    <path d="M${x - 8} 152H${x + 7.8}" stroke="${sole}" stroke-width="1.8"/><path d="M${x - 2.6} 146.4l2.4 1M${x - .2} 145.6l2.4 1" stroke="${lace}" stroke-width="1" stroke-linecap="round"/>`;

  // ---------- Vincent ----------
  function vincent() {
    const leg = (cls, x) => `<g class="f-leg ${cls}">
      <path d="M${x - 4.6} 128h9.2v14q0 3.4-4.6 3.4t-4.6-3.4z" fill="${SKIN}" stroke="${OUT}" stroke-width="1.6"/>
      <path d="M${x - 4.6} 139.6h9.2v3.6h-9.2z" fill="#fff" stroke="${OUT}" stroke-width="1"/>
      ${shoe(x + (x < 50 ? -1.4 : 1.4), V.shoe, V.sole, '#c8c8d4')}
    </g>`;
    return `
      <g class="f-legs-stand">
        ${leg('f-leg-l', 44)}${leg('f-leg-r', 56)}
        <path d="M31.6 117H68.4L69.8 132.4Q61 134.6 52 133.2L50 126.6 48 133.2Q39 134.6 30.2 132.4Z" fill="${V.shorts}" stroke="${OUT}" stroke-width="1.7" stroke-linejoin="round"/>
        <path d="M48.8 119.6l-.8 3.6M51.2 119.6l.8 3.6" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/>
      </g>
      <g class="f-legs-sit">
        <path d="M27.6 141Q29 133 39 132.4H61Q71 133 72.4 141L73.6 147.4Q50 153 26.4 147.4Z" fill="${V.shorts}" stroke="${OUT}" stroke-width="1.7"/>
        ${shoe(25, V.shoe, V.sole, '#c8c8d4')}${shoe(75, V.shoe, V.sole, '#c8c8d4')}
      </g>
      <g class="f-upper">
        <path d="M29.6 86Q30 76.6 41 75.6H59Q70 76.6 70.4 86L72.4 114.6Q72.6 121.6 65 121.6H35Q27.4 121.6 27.6 114.6Z" fill="${V.sweater}" stroke="${OUT}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M28 114H72L72.2 115.6Q72.2 120.8 65 120.8H35Q27.8 120.8 27.8 115.6Z" fill="${V.sweaterDk}"/>
        <path d="M33 114.6v5M37.4 114.6v5.6M41.8 114.6v5.6M46.2 114.6v5.6M50.6 114.6v5.6M55 114.6v5.6M59.4 114.6v5.6M63.8 114.6v5.6M68.2 114.6v5" stroke="${V.sweater}" stroke-width=".8"/>
        <path d="M36 84q5-3 9-2.4" stroke="${V.sweaterHi}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M44 98q6 2.4 12 0" stroke="${V.sweaterDk}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <g class="f-head">
          ${head}
          <path d="M21.2 58Q23 70.6 35.6 75Q42.6 77.4 50 77.4Q57.4 77.4 64.4 75Q77 70.6 78.8 58Q76.6 65.4 69.2 67Q60.4 65.2 50 65.6Q39.6 65.2 30.8 67Q23.4 65.4 21.2 58Z" fill="${V.beard}" opacity=".88"/>
          <path d="M29 69.6q2 2.4 4.6 3.4M71 69.6q-2 2.4-4.6 3.4M42 74.4q2.6 1 5 1M58 74.4q-2.6 1-5 1" stroke="${V.hairHi}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".7"/>
          ${cheeks}${eyes(V.iris, false)}${nose}
          <g class="f-brows"><path d="M31.4 44.6q5.4-3 11-1M57.6 43.6q5.6-2 11 1" stroke="${V.hair}" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>
          ${mouths(`<path class="m-smile" d="M45 65.6Q50 72.6 55 65.6Z" fill="#7a2a3a" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/><path class="m-smile" d="M46.4 66.2Q50 67.2 53.6 66.2L53.2 67.2Q50 68 46.8 67.2Z" fill="#fff"/>`, '#c25060')}
          <path d="M17.6 52Q14.6 32 24.4 21.4Q29.6 14.6 37.6 12.4Q40.6 5.4 49 3.4Q59.4 1.6 65.6 7.4Q62.4 7.4 60.6 9.4Q70.6 11 76.2 19.8Q85.6 31 82.4 52Q80.6 42 75.6 37Q70 29.6 60 28.6Q53 22.6 44.6 26.6Q34 28 27 36Q20.6 43 17.6 52Z" fill="${V.hair}" stroke="${OUT}" stroke-width="1.8" stroke-linejoin="round"/>
          
          <path d="M27.4 33Q30 21 40.6 15.4M36.4 28.4Q40 15.4 50.4 8.6M46.6 25.4Q52 13.6 61.6 10.6M55.4 26.4Q63.4 17.6 72 18.4M64.6 29.4Q72 24.4 78.2 28.6" stroke="#4e3222" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".8"/><path d="M41.6 18.6Q46.6 9.6 56 7.4M30.6 27.6q3-6.4 8.6-9.6M58.4 17.4q6-3.4 11.4-1.4" stroke="${V.hairHi}" stroke-width="2" fill="none" stroke-linecap="round"/>
          ${hat('#ff6f88', '#ffd166')}
        </g>
        ${sign}
        ${arm('f-arm-l', -1, V.sweater, V.sweaterDk, 10.4)}
        ${arm('f-arm-r', 1, V.sweater, V.sweaterDk, 10.4)}
        <g class="f-balloon"><path d="M74.4 104Q82 64 87 30" stroke="${OUT}" stroke-width="1" fill="none"/><path d="M87 31C77 23 76 9 85 7c3 0 4 2 4.5 3.6C90 9 91 7 94 7c9 2 8 16-7 24z" fill="#e63946" stroke="${OUT}" stroke-width="1.5"/></g>
      </g>`;
  }

  // ---------- Alex ----------
  function alex(id) {
    // Lockenwolke: viele Kreise; erst mit Kontur, dann ohne (nur Außenkontur bleibt sichtbar)
    const back = [[50, 30, 26], [27, 38, 15], [73, 38, 15], [19, 56, 13], [81, 56, 13], [18, 74, 12.4], [82, 74, 12.4], [21, 90, 11.6], [79, 90, 11.6],
      [27, 103, 10], [73, 103, 10], [36, 82, 14], [64, 82, 14]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
    const curls = [[18.6, 62, 7.4], [81.4, 62, 7.4], [17.4, 75, 7], [82.6, 75, 7], [19.6, 88, 6.6], [80.4, 88, 6.6], [24.4, 99, 6], [75.6, 99, 6]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
    const leg = (cls, x) => `<g class="f-leg ${cls}">
      <path d="M${x - 5} 114h10v28q0 3.6-5 3.6t-5-3.6z" fill="${A.pants}" stroke="${OUT}" stroke-width="1.6"/>
      ${shoe(x + (x < 50 ? -1.4 : 1.4), A.shoe, A.sole, '#fff')}
    </g>`;
    return `
      <g class="f-legs-stand">${leg('f-leg-l', 44)}${leg('f-leg-r', 56)}</g>
      <g class="f-legs-sit">
        <path d="M27.6 141Q29 133 39 132.4H61Q71 133 72.4 141L73.6 147.4Q50 153 26.4 147.4Z" fill="${A.pants}" stroke="${OUT}" stroke-width="1.7"/>
        ${shoe(25, A.shoe, A.sole, '#fff')}${shoe(75, A.shoe, A.sole, '#fff')}
      </g>
      <g class="f-upper">
        <g class="f-hair-back">
          <g fill="${A.hair}" stroke="${OUT}" stroke-width="3.4">${back}</g><g fill="${A.hair}">${back}</g>
          <path d="M14 66q4 3 2 8M86 66q-4 3-2 8M16 84q4 3 2 7M84 84q-4 3-2 7" stroke="${A.hairHi}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        </g>
        <clipPath id="fig-torso-${id}"><path d="M31.6 86Q32 76.6 42 75.6H58Q68 76.6 68.4 86L69.6 115.6Q60 119.4 50 119.4Q40 119.4 30.4 115.6Z"/></clipPath>
        <path d="M31.6 86Q32 76.6 42 75.6H58Q68 76.6 68.4 86L69.6 115.6Q60 119.4 50 119.4Q40 119.4 30.4 115.6Z" fill="${A.shirt}"/>
        <g clip-path="url(#fig-torso-${id})" stroke="${A.stripe}" stroke-width="2.6">${[80.4, 86.4, 92.4, 98.4, 104.4, 110.4, 116.4].map(y => `<path d="M26 ${y}h48"/>`).join('')}</g>
        <path d="M31.6 86Q32 76.6 42 75.6H58Q68 76.6 68.4 86L69.6 115.6Q60 119.4 50 119.4Q40 119.4 30.4 115.6Z" fill="none" stroke="${OUT}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M42.6 77.4Q50 84 57.4 77.4" stroke="${A.gold}" stroke-width="1.3" fill="none"/><circle cx="50" cy="81.4" r="1.6" fill="${A.gold}"/>
        <g class="f-head">
          ${head}
          ${cheeks}${eyes(A.iris, true)}${nose}
          <g class="f-brows"><path d="M31.6 44q5-3.6 10.6-2M58 42q5.6-1.6 10.6 2" stroke="${A.hair}" stroke-width="1.9" fill="none" stroke-linecap="round"/></g>
          ${mouths(`<path class="m-smile" d="M45.6 65.6Q50 70.6 54.4 65.6" stroke="${A.lip}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`, A.lip)}
          <path d="M17.4 56Q13.6 30 30.4 19.6Q40 13.6 52 14Q71 14.6 80.4 28Q86.6 38 82.6 56Q80 44 72.6 38.6Q62.6 33 55.6 25.6Q51.4 33.6 40.6 37.4Q26.4 42 17.4 56Z" fill="${A.hair}" stroke="${OUT}" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M56 26.6Q62 32.4 72.6 37M44 18.6Q34 21.6 27.4 30M60 17.6q9 3 14.4 10" stroke="${A.hairHi}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <g fill="${A.hair}" stroke="${OUT}" stroke-width="3.2">${curls}</g><g fill="${A.hair}">${curls}</g>
          <path d="M16.2 64q3 2.4 2 5.6M83.8 64q-3 2.4-2 5.6M17.4 82q3 2 2.4 5M82.6 82q-3 2-2.4 5" stroke="${A.hairHi}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          ${hat('#6fae12', '#ff9ab3')}
        </g>
        ${arm('f-arm-l', -1, A.shirt, '', 9, A.stripe)}
        ${arm('f-arm-r', 1, A.shirt, '', 9, A.stripe)}
        <g class="f-whisk"><path d="M78 108l8-14" stroke="#9a8d99" stroke-width="2.2" stroke-linecap="round"/><path d="M86 94c-4-6 2-12 6-9 3 3-2 9-6 9zM86 94c-1-6 4-10 6-9" stroke="#9a8d99" stroke-width="1.2" fill="none"/></g>
      </g>`;
  }

  function svg(who) {
    const id = ++uid;
    return `<svg class="fig-svg" viewBox="0 0 100 166" aria-hidden="true"><g class="f-all">${who === 'alex' ? alex(id) : vincent()}</g></svg>`;
  }

  // ---------- Katze für Zufallsmomente (Seitenansicht, läuft nach rechts) ----------
  function catSVG() {
    const FUR = '#f4a259', DARK = '#d98330', STRIPE = '#c86a1c', BELLY = '#fff4e8';
    const leg = (cls, x, color) => `<g class="c-leg ${cls}">
      <path d="M${x} 36V49" stroke="${OUT}" stroke-width="8.6" stroke-linecap="round"/>
      <path d="M${x} 36V49" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="${x + 1}" cy="50.6" rx="4.4" ry="2.6" fill="${color}" stroke="${OUT}" stroke-width="1.4"/></g>`;
    return `<svg class="cat-svg" viewBox="0 0 86 56" aria-hidden="true"><g class="c-all">
      <g class="c-tail"><path d="M21 31C9 31 4 22 7.6 9.4" stroke="${OUT}" stroke-width="7.6" fill="none" stroke-linecap="round"/>
        <path d="M21 31C9 31 4 22 7.6 9.4" stroke="${FUR}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M8 18.6l3.6-.4M7.6 13.4l3.4.2" stroke="${STRIPE}" stroke-width="1.8" stroke-linecap="round"/></g>
      ${leg('c-fb', 27, DARK)}${leg('c-ff', 53, DARK)}
      <ellipse cx="39" cy="32" rx="22" ry="12.4" fill="${FUR}" stroke="${OUT}" stroke-width="1.6"/>
      <path d="M22 36Q39 47 56 36Q50 43.6 39 43.8Q28 43.6 22 36Z" fill="${BELLY}"/>
      <path d="M30 20.4q1.6 4 .4 7.4M37.6 19.8q1.6 4.2.4 7.8M45 20.4q1.4 3.6.2 7" stroke="${STRIPE}" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${leg('c-nb', 23, FUR)}${leg('c-nf', 49, FUR)}
      <g class="c-head">
        <path d="M54.6 13.2L55 1.6 63.6 8.2zM68 8L76 1.4 76.6 13z" fill="${FUR}" stroke="${OUT}" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M57 10.4l.4-5.6 4 3.2zM70.4 7.6l3.8-3.2.4 5.4z" fill="#ffb3c1"/>
        <circle cx="65.6" cy="19.6" r="13" fill="${FUR}" stroke="${OUT}" stroke-width="1.6"/>
        <path d="M61.6 8.6q.6 3 0 5M65.6 7.4v5M69.6 8.6q-.6 3 0 5" stroke="${STRIPE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <ellipse cx="68.6" cy="25" rx="7.6" ry="5.6" fill="${BELLY}"/>
        <ellipse cx="62.6" cy="19.2" rx="2.6" ry="3.2" fill="${INK}"/><ellipse cx="72.6" cy="19.2" rx="2.6" ry="3.2" fill="${INK}"/>
        <circle cx="63.6" cy="17.8" r="1.1" fill="#fff"/><circle cx="73.6" cy="17.8" r="1.1" fill="#fff"/>
        <ellipse class="c-cheek" cx="59" cy="24" rx="2.8" ry="1.6" fill="${CHEEK}" opacity=".55"/><ellipse cx="77" cy="24" rx="2.4" ry="1.5" fill="${CHEEK}" opacity=".55"/>
        <path d="M67 22.6h3.2l-1.6 1.8z" fill="#ff7f96"/><path d="M68.6 24.4q-1 2.4-3 1.6M68.6 24.4q1 2.4 3 1.6" stroke="${INK}" stroke-width="1" fill="none" stroke-linecap="round"/>
        <path d="M76 24.6l8-1.2M76 26.6l7.6 1" stroke="${OUT}" stroke-width=".8" stroke-linecap="round" opacity=".6"/>
      </g>
    </g></svg>`;
  }

  // ---------- Darsteller ----------
  class Actor {
    constructor(stage, who) {
      this.who = who; this.x = 0;
      this.el = document.createElement('div');
      this.el.className = 'actor actor-' + who;
      this.el.innerHTML = svg(who);
      this.el.dataset.pose = 'idle';
      stage.appendChild(this.el);
      this.rest = 'idle';
    }
    get w() { return this.el.offsetWidth; }
    get h() { return this.el.offsetHeight; }
    pose(p) { this.el.dataset.pose = p; return this; }
    face(f) { if (f) this.el.dataset.face = f; else delete this.el.dataset.face; return this; }
    props(p) { if (p) this.el.dataset.props = p; else delete this.el.dataset.props; return this; }
    place(x) { clearTimeout(this._t); this.x = x; this.el.style.transition = 'none'; this.el.style.transform = `translateX(${x}px)`; return this; }
    walkTo(x, speed) {
      return new Promise(res => {
        clearTimeout(this._t);
        const dist = Math.abs(x - this.x);
        if (dist < 2) { this.place(x); return res(); }
        const dur = dist / (speed || 95) * 1000;
        this.pose('walk');
        this.el.style.transition = `transform ${dur}ms linear`;
        void this.el.offsetWidth;
        this.el.style.transform = `translateX(${x}px)`;
        this.x = x;
        this._t = setTimeout(() => { this.pose(this.rest); res(); }, dur);
      });
    }
    stop() {
      clearTimeout(this._t);
      const m = getComputedStyle(this.el).transform;
      this.el.style.transition = 'none';
      if (m && m !== 'none') { this.x = new DOMMatrix(m).m41; this.el.style.transform = `translateX(${this.x}px)`; }
      if (this.el.dataset.pose === 'walk') this.pose(this.rest);
    }
  }

  // Kleines Herz, das aufsteigt
  function heartPop(parent, x, y, size) {
    const h = document.createElement('div');
    h.className = 'heart-pop';
    h.style.left = x + 'px'; h.style.top = y + 'px'; h.style.fontSize = (size || 22) + 'px';
    h.innerHTML = '<svg viewBox="0 0 24 24"><path fill="#e63946" d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2 0 3.4 1.1 5.4 3.2C14 6.1 15.4 5 17.4 5 21 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z"/></svg>';
    parent.appendChild(h);
    setTimeout(() => h.remove(), 1800);
  }

  root.Figures = { svg, catSVG, Actor, heartPop };
})(window);
