/* Symbolsets für Alex' Sudoku.
   Jedes Symbol: 24×24, Grundform in currentColor (Farbe kommt pro Index aus --s1 … --s16),
   helle Details in --sym-detail. Die ersten 9 Symbole sind die für 9×9.
   Namen stehen im Nominativ mit Artikel – sie werden in Tipp-Texten verwendet. */
(function (root) {
  'use strict';
  const D = 'var(--sym-detail,#fff)';
  const d = (s) => s.replace(/\bD\b/g, D);

  // ---------- Katzen (ganzer Körper) ----------
  // Seitlich sitzend, Blick nach rechts
  const sitSide = (dx = 0) => `<g transform="translate(${dx} 0)">
    <path d="M5.4 21C1.4 20.6 1.2 16 3.8 14.8" stroke="currentColor" stroke-width="2.1" fill="none" stroke-linecap="round"/>
    <path d="M4.6 21.6C3.8 16.4 6 11.8 10.4 11.4 13.6 11.1 15.6 13.4 15.8 16.6L16 21.6Z"/>
    <circle cx="15.6" cy="8.6" r="4.2"/><path d="M12.2 6.2L12.4 2.2 15 4.6zM16.4 4.6L19 2 19.4 6.2z"/>
    <circle cx="17.2" cy="8.2" r=".85" fill="D"/><path d="M13.2 15.6v5.6" stroke="D" stroke-width=".9" stroke-linecap="round"/></g>`;
  // Von vorne sitzend
  const FRONT_BODY = 'M6.8 22C5.8 17 7.4 12.4 12 12.4S18.2 17 17.2 22Z';
  const sitFront = (o = {}) => `
    ${o.tail === false ? '' : '<path d="M17 21.4C20.8 21.8 22 17.6 19.8 15.6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'}
    <path d="${FRONT_BODY}"/><circle cx="12" cy="8.4" r="4.7"/>
    ${o.ears === false ? '' : '<path d="M7.6 6.6L7.8 1.8 10.8 4.2zM16.4 6.6L16.2 1.8 13.2 4.2z"/>'}
    <circle cx="10.2" cy="8.4" r=".85" fill="D"/><circle cx="13.8" cy="8.4" r=".85" fill="D"/><path d="M11.4 10.1h1.2l-.6.7z" fill="D"/>
    ${o.paws === false ? '' : '<path d="M10.6 18.6v3M13.4 18.6v3" stroke="D" stroke-width=".8" stroke-linecap="round"/>'}`;

  const katzen = [
    ['die sitzende Katze', sitSide()],
    ['die liegende Katze', `<path d="M3.2 21.2C.6 21.8.6 18.8 2 18" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M2.6 21.6C2.2 17.4 5.4 15 10.6 15h5.8l.2 6.6z"/><circle cx="17.4" cy="14.2" r="4"/><path d="M14.2 11.6l.4-3.8 2.4 2.6zM18.4 10.2L21 7.6l.4 4z"/>
      <ellipse cx="19.8" cy="20.6" rx="3" ry="1.4"/><circle cx="18.8" cy="13.8" r=".8" fill="D"/><path d="M10 16.4v4.6" stroke="D" stroke-width=".8" stroke-linecap="round"/>`],
    ['die schlafende Katze', `<circle cx="13.4" cy="15" r="7.2"/><circle cx="6.8" cy="16" r="4.4"/><path d="M3.2 14.2l-.2-4.6 3.4 2.6zM7.8 11.8l3.4-2.4.2 4.2z"/>
      <path d="M19.4 14.4c0 5-6.4 7.2-10.4 5.6" stroke="D" stroke-width="1.1" fill="none" stroke-linecap="round"/><path d="M4.2 16.6q.9.8 1.8 0M7.4 16.6q.9.8 1.8 0" stroke="D" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <path d="M18 2.6h2.8l-2.8 2.8h2.8" stroke="currentColor" stroke-width="1.1" fill="none" stroke-linejoin="round"/>`],
    ['die laufende Katze', `<path d="M5 12.4C2.4 11 1.8 7 3.2 4.6" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round"/>
      <path d="M6.4 15.6l-1 6M9 15.6l.6 6M13.8 15.6l-.8 6M16 15.4l1.2 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      <rect x="4.6" y="10.6" width="12.4" height="6.4" rx="3.2"/><circle cx="18.2" cy="9.2" r="3.7"/><path d="M15.4 7.2V3.4l2.4 2.2zM19 5.6l2.4-2.2.2 3.8z"/>
      <circle cx="19.6" cy="8.8" r=".8" fill="D"/>`],
    ['die springende Katze', `<path d="M3.8 15.6C.8 14.4.8 10.6 2.4 9" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round"/>
      <path d="M5.4 18.4L2.2 22M7.4 18.6l-1.6 4M16 10.6l5.4 2.4M14.6 11.6l4.6 3.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M5.4 17.6l9.8-8.2" stroke="currentColor" stroke-width="6.4" stroke-linecap="round"/><circle cx="17.8" cy="7" r="3.6"/><path d="M15.2 5l.2-3.6 2.2 2.2zM18.8 3.4l2.6-2v3.8z"/>
      <circle cx="19.2" cy="6.6" r=".8" fill="D"/>`],
    ['die Katze mit Wollknäuel', sitSide(-1.4) + `<circle cx="19.8" cy="19" r="3.6"/><path d="M17.2 17.6q2.6-.6 4.8 1.6M17 20.4q3 .6 5-1.4M19.2 15.6q-1.2 3.4.2 6.6" stroke="D" stroke-width=".8" fill="none"/>`],
    ['die Katze im Karton', `<path d="M3 13L.8 9.8M21 13l2.2-3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="12" cy="9.4" r="4.4"/><path d="M7.8 7.4L8 2.8l3 2.4zM16.2 7.4L16 2.8l-3 2.4z"/><path d="M3 13h18v9H3z"/>
      <path d="M3 13.6h18" stroke="D" stroke-width="1.1"/><ellipse cx="9.6" cy="13.6" rx="1.7" ry="1.1" fill="D"/><ellipse cx="14.4" cy="13.6" rx="1.7" ry="1.1" fill="D"/>
      <circle cx="10.3" cy="9.4" r=".8" fill="D"/><circle cx="13.7" cy="9.4" r=".8" fill="D"/><path d="M12 15.6v6.4" stroke="D" stroke-width=".8" opacity=".7"/>`],
    ['die winkende Katze', sitFront({ tail: false }) + '<path d="M16.2 14.4l3-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="19.5" cy="7.6" r="1.7"/>'],
    ['die Katze mit Krone', sitFront() + '<path d="M9.6 4.4V1.2l1.2 1.1L12 .2l1.2 2.1 1.2-1.1v3.2z"/><circle cx="12" cy="3.2" r=".6" fill="D"/>'],
    ['die sich streckende Katze', `<path d="M4.6 8.4C2.6 6 3 3 5 1.8" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round"/>
      <path d="M5.6 11.4l-.4 10.4M8 12.4l-.2 9.4M14.4 19.6l8.4 1.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
      <path d="M6.6 9.8l8.8 6.2" stroke="currentColor" stroke-width="6.4" stroke-linecap="round"/><circle cx="18.8" cy="16.4" r="3.4"/><path d="M16.2 14.6l.2-3.6 2.2 2.2zM19.6 13l2.6-1.8V15z"/>
      <circle cx="20" cy="16.2" r=".75" fill="D"/>`],
    ['die Katze mit Fisch', sitSide(-2.6) + '<path d="M15.6 20.4c1.6-1.8 4-1.8 5.2-.2l2.6-1.6v3.6l-2.6-1.6c-1.2 1.6-3.6 1.6-5.2-.2z"/><circle cx="17" cy="20.2" r=".5" fill="D"/>'],
    ['die Katze mit Herz', sitFront({ paws: false }) + '<path d="M12 19.6c-2-1.4-2.2-3.4-.9-3.6.4 0 .8.3.9.7.1-.4.5-.7.9-.7 1.3.2 1.1 2.2-.9 3.6z" fill="D"/>'],
    ['die Katze mit Schal', sitFront({ paws: false }) + `<clipPath id="sym-clip-schal"><path d="${FRONT_BODY}"/><circle cx="12" cy="8.4" r="4.7"/></clipPath>
      <g clip-path="url(#sym-clip-schal)" fill="D"><path d="M6 12.4Q12 15.2 18 12.4V14.6Q12 17.4 6 14.6Z"/><path d="M13.6 14.6l.8 5 1.8-.6-.8-4.8z"/></g>`],
    ['die Katze mit Brille', sitFront() + '<g stroke="D" stroke-width=".7" fill="none"><circle cx="10.2" cy="8.4" r="1.7"/><circle cx="13.8" cy="8.4" r="1.7"/><path d="M11.9 8.2h.2"/></g>'],
    ['die Katze mit Hut', sitFront({ ears: false }) + '<path d="M7 4.6h10v1.4H7zM9 .2h6v4.6H9z"/><path d="M9 3.2h6v1H9z" fill="D"/>'],
    ['die Katze mit Schleife', sitFront() + '<path d="M9.4 12.2l2.6 1.4-2.6 1.4zM14.6 12.2L12 13.6l2.6 1.4z" fill="D"/><circle cx="12" cy="13.6" r=".7" fill="D"/>']
  ];

  // ---------- Backstube ----------
  const backen = [
    ['das Tortenstück', '<path d="M2.5 11L20.5 6v13h-18z"/><path d="M2.5 13.6l18-4.4V11l-18 4.4z" fill="D"/><circle cx="16.5" cy="4.2" r="2.2"/><path d="M16.6 2.1q1-1.5 2.6-1.5" stroke="currentColor" stroke-width="1" fill="none"/>'],
    ['der Muffin', '<path d="M5.5 12.5h13l-1.8 9H7.3z"/><path d="M9 13.8l.6 6.6M12 13.8v6.6M15 13.8l-.6 6.6" stroke="D" stroke-width="1.1"/><path d="M4.5 12.8Q3.6 8.6 7.6 8q1.2-3.6 4.7-3.2 4-.4 4.6 3.2 3.7.8 2.6 4.8z"/><path d="M5 12.6h14" stroke="D" stroke-width=".9"/>'],
    ['das Croissant', '<path d="M1.5 16Q4 7 12 6.5T22.5 16q-2.5-1.8-4.9-1.4-2.1-3.2-5.6-3.4-3.5.2-5.6 3.4Q4 14.2 1.5 16z"/><path d="M7.6 9.2l1.7 2.3M12 7.4v3.4M16.4 9.2l-1.7 2.3" stroke="D" stroke-width="1.1" stroke-linecap="round"/>'],
    ['der Donut', '<path fill-rule="evenodd" d="M12 3a9 9 0 1 0 .01 0zM12 9.2a2.8 2.8 0 1 1-.01 0z"/><path d="M7 7.5l1.2.8M15.5 6.5l1.2-.6M17.5 12.5l.4 1.3M6.3 13.5l1.3-.3M10.5 16.8l1.2.5M14.8 16.5l1-.8" stroke="D" stroke-width="1.1" stroke-linecap="round"/>'],
    ['der Keks', '<path d="M12 3a9 9 0 1 0 9 9 2.6 2.6 0 0 1-2.8-2.7A2.6 2.6 0 0 1 15 6a2.6 2.6 0 0 1-3-3z"/><circle cx="8" cy="10" r="1.1" fill="D"/><circle cx="11" cy="15.5" r="1.1" fill="D"/><circle cx="15.5" cy="14" r="1.1" fill="D"/><circle cx="7.5" cy="15" r=".9" fill="D"/><circle cx="12" cy="9.5" r=".9" fill="D"/>'],
    ['die Brezel', '<path d="M12 19.5c-6 0-9-4-7.8-8.5 1.1-4.2 6.4-4.4 7.8.6 1.4-5 6.7-4.8 7.8-.6C21 15.5 18 19.5 12 19.5zM8 18.2l7.2-7.8M16 18.2l-7.2-7.8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>'],
    ['der Lebkuchenmann', '<circle cx="12" cy="5" r="3.3"/><path d="M8 8.6h8l4.6 2.8-1.4 2.4-3-1.4.4 3.6 2.4 5.4h-3.6L12 17.4l-3.4 4H5l2.4-5.4.4-3.6-3 1.4-1.4-2.4z"/><circle cx="12" cy="11" r=".8" fill="D"/><circle cx="12" cy="13.8" r=".8" fill="D"/><circle cx="10.9" cy="4.6" r=".55" fill="D"/><circle cx="13.1" cy="4.6" r=".55" fill="D"/><path d="M10.8 6.2q1.2.8 2.4 0" stroke="D" stroke-width=".7" fill="none"/>'],
    ['die Erdbeere', '<path d="M12 21.5C6.3 18.8 4 13.6 4.8 10.4 5.6 7.6 8.8 7 12 8.4c3.2-1.4 6.4-.8 7.2 2 .8 3.2-1.5 8.4-7.2 11.1z"/><path d="M12 8.4L9 4.6l2.4 1L12 2.6l.6 3 2.4-1z"/><g fill="D"><circle cx="9" cy="11.6" r=".6"/><circle cx="12" cy="11" r=".6"/><circle cx="15" cy="11.6" r=".6"/><circle cx="10.5" cy="14.5" r=".6"/><circle cx="13.5" cy="14.5" r=".6"/><circle cx="12" cy="17.6" r=".6"/></g>'],
    ['die Kochmütze', '<path d="M6 14.2q-3.6-.6-3.2-4.4Q3.4 6 7 6.6q1-3.8 5-3.8t5 3.8q3.6-.6 4.2 3.2.4 3.8-3.2 4.4z"/><rect x="6" y="14" width="12" height="6.5" rx="1"/><path d="M6 14.3h12M9 15.5V19M12 15.5V19M15 15.5V19" stroke="D" stroke-width=".9"/>'],
    ['das Brot', '<path d="M2.5 15Q2.5 6.8 12 6.8T21.5 15q0 3.5-3 3.5h-13q-3 0-3-3.5z"/><path d="M7 10.5l2 3M11 9.4l2 3.2M15 9.8l2 3" stroke="D" stroke-width="1.3" stroke-linecap="round"/>'],
    ['das Kirschpaar', '<circle cx="7.5" cy="17" r="4"/><circle cx="16.5" cy="16.2" r="4"/><path d="M7.5 13Q9 6 15 2.6M16.5 12.2Q16 6.5 15 2.6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M15 2.6q4-.8 6 2-4 1-6-2z"/><circle cx="6.2" cy="15.6" r=".9" fill="D"/><circle cx="15.2" cy="14.8" r=".9" fill="D"/>'],
    ['das Ei', '<path d="M12 2.5c4.6 0 7.2 7.3 7.2 11.5a7.2 7.2 0 0 1-14.4 0C4.8 9.8 7.4 2.5 12 2.5z"/><ellipse cx="9.2" cy="9.2" rx="1.1" ry="2" transform="rotate(20 9.2 9.2)" fill="D"/>'],
    ['das Nudelholz', '<g transform="rotate(-35 12 12)"><rect x="5" y="9.3" width="14" height="5.4" rx="2.2"/><rect x=".6" y="11" width="4.8" height="2" rx="1"/><rect x="18.6" y="11" width="4.8" height="2" rx="1"/></g>'],
    ['der Schneebesen', '<path d="M12 15C6.5 12 7 3 12 3s5.5 9 0 12zM12 15c-2.6-3.8-2.4-10.8 0-12 2.4 1.2 2.6 8.2 0 12z" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="10.6" y="14.5" width="2.8" height="8" rx="1.4"/>'],
    ['die Zitrone', '<path d="M2.6 12.6q.7-1.6 2.1-1.8Q7.4 5.2 13 5.2q5.8 0 7.4 4.4 1.5.8 1 2.4-1.4.6-1.8 2Q17.4 19 11.8 19q-5.2 0-6.9-4.4-1.5-.4-2.3-2z"/><path d="M8 9.5q2.5-1.7 5.5-1.5" stroke="D" stroke-width="1.2" fill="none" stroke-linecap="round"/>'],
    ['die Schokolade', '<rect x="5" y="2.5" width="14" height="19" rx="1.6"/><path d="M5 8.8h14M5 15.2h14M12 2.5v19" stroke="D" stroke-width="1.1"/><path d="M13.5 21.5L19 16v5.5z" fill="D" opacity=".55"/>']
  ];

  // ---------- Baustelle & Straße ----------
  const bau = [
    ['der Leitkegel', '<path d="M10.2 2.5h3.6l4.8 16H5.4z"/><rect x="3" y="18.3" width="18" height="3.2" rx="1.2"/><path d="M8.8 7.3h6.4l.7 2.5H8.1zM7.3 12.3h9.4l.7 2.5H6.6z" fill="D"/>'],
    ['die Ampel', '<rect x="7" y="1.5" width="10" height="21" rx="3"/><path d="M7 4L4 4.8 7 8zM17 4l3 .8L17 8z"/><circle cx="12" cy="6" r="2.3" fill="D"/><circle cx="12" cy="12" r="2.3" fill="D" opacity=".6"/><circle cx="12" cy="18" r="2.3" fill="D" opacity=".35"/>'],
    ['der Bauhelm', '<path d="M3.5 16Q3.5 6.5 12 6t8.5 10z"/><rect x="1.5" y="15.6" width="21" height="3.2" rx="1.6"/><rect x="10.9" y="6.4" width="2.2" height="9.4" fill="D" opacity=".85"/>'],
    ['der Bagger', '<rect x="2" y="11" width="12" height="6" rx="1"/><rect x="3.5" y="6.5" width="6" height="5" rx="1"/><rect x="4.5" y="7.5" width="4" height="2.8" fill="D"/><rect x="1.5" y="17.6" width="13.5" height="4.2" rx="2.1"/><circle cx="4" cy="19.7" r="1" fill="D"/><circle cx="8.2" cy="19.7" r="1" fill="D"/><circle cx="12.4" cy="19.7" r="1" fill="D"/><path d="M12 12.5L16.8 5l4.2 5.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M18.6 10.4h4.6l-1.4 4.8h-2.6z"/>'],
    ['der Kipplaster', '<path d="M1.8 7.5L14 5.5V15H3z"/><rect x="15" y="8.6" width="7.2" height="8" rx="1.2"/><rect x="16.6" y="10" width="4" height="3" fill="D"/><rect x="1.8" y="15" width="20.4" height="2.6" rx=".8"/><circle cx="6" cy="19.4" r="2.6"/><circle cx="18" cy="19.4" r="2.6"/><circle cx="6" cy="19.4" r="1" fill="D"/><circle cx="18" cy="19.4" r="1" fill="D"/>'],
    ['die Brücke', '<path d="M1 9.5h22v3.3h-1.8v8.7h-3.4v-4Q12 11.4 6.2 17.5v4H2.8v-8.7H1z"/><path d="M2 9.5v-3M6.5 9.5v-3M11 9.5v-3M15.5 9.5v-3M20 9.5v-3M2 6.5h20" stroke="currentColor" stroke-width="1.3" fill="none"/>'],
    ['das Stoppschild', '<path d="M8 1.5h8L22.5 8v8L16 22.5H8L1.5 16V8z"/><rect x="5.5" y="10.6" width="13" height="2.8" rx=".6" fill="D"/>'],
    ['die Absperrbake', '<rect x="1.5" y="7" width="21" height="6.5" rx="1.2"/><path d="M5 7h3.5l-3 6.5H2zM11 7h3.5l-3 6.5H8zM17 7h3.5l-3 6.5H14z" fill="D"/><rect x="4" y="13.2" width="2.2" height="8.8"/><rect x="17.8" y="13.2" width="2.2" height="8.8"/><rect x="2.5" y="21" width="5.2" height="1.6" rx=".8"/><rect x="16.3" y="21" width="5.2" height="1.6" rx=".8"/><circle cx="12" cy="4.2" r="2.2"/><rect x="11.3" y="5.5" width="1.4" height="2"/>'],
    ['der Kran', '<rect x="6.2" y="4" width="3.2" height="17"/><path d="M6.4 7l2.8 3-2.8 3 2.8 3-2.8 3" stroke="D" stroke-width=".9" fill="none"/><rect x="1.5" y="3" width="21" height="2.4" rx=".6"/><rect x="1.5" y="5.4" width="3.6" height="3"/><path d="M18.5 5.4v7.8M7.8 3V.8" stroke="currentColor" stroke-width="1.3"/><path d="M18.5 13q2.1.4 1.8 2.4-.5 1.8-2.3 1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><rect x="3" y="20.5" width="9.6" height="2.2" rx=".6"/>'],
    ['die Schaufel', '<rect x="10.9" y="2" width="2.2" height="11"/><rect x="8.8" y="1.2" width="6.4" height="2.4" rx="1.2"/><path d="M7 12.6h10v3.9q0 6-5 6t-5-6z"/><path d="M12 14.5v5" stroke="D" stroke-width="1.1" stroke-linecap="round"/>'],
    ['die Walze', '<rect x="1" y="13.5" width="9.5" height="8.5" rx="4.25"/><rect x="2.4" y="16.6" width="6.7" height="2.3" rx="1.15" fill="D" opacity=".7"/><rect x="9" y="11" width="12.5" height="6.5" rx="1"/><path d="M11.5 11V4h9v7" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="10.5" y="3" width="11" height="1.8" rx=".6"/><circle cx="17.5" cy="19" r="3"/><circle cx="17.5" cy="19" r="1.1" fill="D"/>'],
    ['der Tunnel', '<path d="M1 21.5L8.3 6l3.5 4.5 3.8-6 7.4 17z"/><path d="M7.5 21.5V17q4.5-6.5 9 0v4.5z" fill="D"/><path d="M12 21.5v-2.3M12 17.5v-1.3" stroke="currentColor" stroke-width="1"/>'],
    ['das Vorfahrtsschild', '<path d="M12 1l11 11-11 11L1 12z"/><path d="M12 5l7 7-7 7-7-7z" fill="D"/><path d="M12 8.2l3.8 3.8-3.8 3.8L8.2 12z"/>'],
    ['der Kreisverkehr', '<circle cx="12" cy="12" r="10.5"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="D" stroke-width="2"/><path d="M12 4.6l3 2.2-3.4 1.4zM18.4 15.7l-3.6.7 1.5-3.3zM5.6 15.7l1-3.5 2.2 2.9z" fill="D"/>'],
    ['die Straßenlaterne', '<rect x="6.8" y="5" width="2.4" height="16"/><path d="M8 6q0-3.6 3.6-3.6H17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M14 2.6h6.4l-1.2 3.8h-4z"/><path d="M15.4 6.8H19l1.6 5.2h-6.8z" opacity=".35"/><rect x="4.4" y="20.6" width="7.2" height="2" rx=".7"/>'],
    ['die Mauer', '<rect x="1.5" y="3.5" width="21" height="17" rx="1"/><path d="M1.5 7.8h21M1.5 12h21M1.5 16.2h21M8 3.5v4.3M16 3.5v4.3M4.5 7.8V12M12 7.8V12M19.5 7.8V12M8 12v4.2M16 12v4.2M4.5 16.2v4.3M12 16.2v4.3M19.5 16.2v4.3" stroke="D" stroke-width="1.1"/>']
  ];

  // ---------- Reisen 2027: Barcelona, Schweiz, London, Edinburgh ----------
  const reisen = [
    ['der Big Ben', '<path d="M12 .8L13.2 4h-2.4z"/><path d="M9.6 4h4.8l1 3.5H8.6z"/><rect x="8.6" y="7.5" width="6.8" height="14.5"/><rect x="7.4" y="21.4" width="9.2" height="1.6" rx=".5"/><circle cx="12" cy="10.6" r="2.3" fill="D"/><path d="M12 9.3v1.4l.9.5" stroke="currentColor" stroke-width=".7" fill="none"/><path d="M10.4 14.5V20M12 14.5V20M13.6 14.5V20" stroke="D" stroke-width=".9"/>'],
    ['die Tower Bridge', '<rect x="3" y="6" width="4.4" height="16"/><rect x="16.6" y="6" width="4.4" height="16"/><path d="M2.6 6.2l2.6-4.7 2.6 4.7zM16.2 6.2l2.6-4.7 2.6 4.7z"/><rect x="7.4" y="7.4" width="9.2" height="1.8"/><rect x=".8" y="15" width="22.4" height="2.4"/><path d="M4.4 10H6v2.4H4.4zM18 10h1.6v2.4H18zM4.4 18.8H6v2H4.4zM18 18.8h1.6v2H18z" fill="D"/>'],
    ['der Doppeldeckerbus', '<rect x="1.2" y="3.5" width="21.6" height="15.5" rx="2.4"/><path d="M3.2 6h3.6v3.2H3.2zM8.4 6H12v3.2H8.4zM13.6 6h3.6v3.2h-3.6zM18.6 6H21v3.2h-2.4zM3.2 11.6h3.6v3.2H3.2zM8.4 11.6H12v3.2H8.4zM13.6 11.6h3.6v3.2h-3.6z" fill="D"/><rect x="18.6" y="11.6" width="2.4" height="6" fill="D" opacity=".7"/><circle cx="6" cy="19.6" r="2.6"/><circle cx="17" cy="19.6" r="2.6"/><circle cx="6" cy="19.6" r="1" fill="D"/><circle cx="17" cy="19.6" r="1" fill="D"/>'],
    ['die Telefonzelle', '<path d="M5.5 4.5Q12 .6 18.5 4.5V6h-13z"/><rect x="6" y="5.5" width="12" height="16.5"/><rect x="5" y="21.4" width="14" height="1.6" rx=".5"/><rect x="7.6" y="6.6" width="8.8" height="1.6" fill="D" opacity=".9"/><path d="M8.2 9.6h3.2v2.6H8.2zM12.6 9.6h3.2v2.6h-3.2zM8.2 13.2h3.2v2.6H8.2zM12.6 13.2h3.2v2.6h-3.2zM8.2 16.8h3.2v2.6H8.2zM12.6 16.8h3.2v2.6h-3.2z" fill="D"/>'],
    ['die Sagrada Família', '<path d="M1.8 22.5v-10l2.1-8 2.1 8v-2l2.4-7.7 2.2 7.2v-.8L12 .8l1.4 8.4v.8l2.2-7.2 2.4 7.7v2l2.1-8 2.1 8v10z"/><path d="M9.6 22.5v-5q2.4-3.5 4.8 0v5z" fill="D"/><circle cx="12" cy="13" r="1.3" fill="D"/>'],
    ['die Palme', '<path d="M11.2 9q2.6 6 1.4 12.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M11.2 9Q6.5 4.5 1.8 7.6 6.5 7.2 11.2 9zM11.2 9q2.6-6 9.2-4.6Q15 5.6 11.2 9zM11.2 9q6.4-.6 10.4 4-5.2-2.6-10.4-4zM11.2 9q-5.4.8-7.6 5.2Q7 10.4 11.2 9zM11.2 9Q9 3 4.6 2q5 2.8 6.6 7z"/><circle cx="10.2" cy="10.4" r="1.2"/><circle cx="12.6" cy="10.2" r="1.2"/><path d="M5 22.5q7-3.9 14 0z"/>'],
    ['der Berg', '<path d="M.8 21.5l7-13.3 3 4.4 4.4-8.2 8 17.1z"/><path d="M15.2 4.4l2.4 5.6-1-.6-1.4 1.4-1.4-1.6-1.2.6zM7.8 8.2l1.8 3.4-1-.4-1 1-1-1-.4.6z" fill="D"/>'],
    ['der Bär', '<circle cx="5.6" cy="6.4" r="3.2"/><circle cx="18.4" cy="6.4" r="3.2"/><circle cx="12" cy="13.4" r="8.4"/><circle cx="5.6" cy="6.4" r="1.4" fill="D" opacity=".7"/><circle cx="18.4" cy="6.4" r="1.4" fill="D" opacity=".7"/><ellipse cx="12" cy="16.3" rx="3.6" ry="2.8" fill="D"/><path d="M10.7 15.2h2.6L12 16.6z"/><circle cx="8.8" cy="11.8" r="1.2" fill="D"/><circle cx="15.2" cy="11.8" r="1.2" fill="D"/>'],
    ['die Burg', '<path d="M1 22.5q.6-6.9 4.6-9.1h13.2q4 2.4 4.2 9.1z"/><path d="M3.4 13.6V8h2v1.8h1.8V8h2v1.8h1V5.2h1v-2h1.6v2h1v4.6h1V8h2v1.8h1.8V8h2v5.6z"/><path d="M11.4 3.2V.6" stroke="currentColor" stroke-width=".8"/><path d="M11.8.6l2.4.8-2.4.8z"/><path d="M5.8 11h1.4v1.6H5.8zM16.8 11h1.4v1.6h-1.4zM11.3 7h1.4v2h-1.4z" fill="D"/>'],
    ['die Echse', '<path d="M12 1.8q2 .2 2 2.6 0 1.2-.8 2 1.8 1.6 1.6 4.6-.2 3.6-1.4 5.4.2 3.2 3 4.2 2 .6 2.4-1 .6 3-2.8 3-4.4-.2-4.6-5.8-1.8-2.2-2-5.8-.2-3 1.4-4.6-.8-.8-.8-2 0-2.4 2-2.6z"/><path d="M10 8.6L6.2 6.8 5 4.6M14 8.6l3.8-1.8L19 4.6M10 13.6l-3.6 2.2-1.2 2.4M14 13.6l3.6 2.2 1.2 2.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><g fill="D"><circle cx="12" cy="8.6" r=".75"/><circle cx="11" cy="10.6" r=".75"/><circle cx="13" cy="10.6" r=".75"/><circle cx="12" cy="12.6" r=".75"/><circle cx="12" cy="3.6" r=".6"/></g>'],
    ['die Paella', '<ellipse cx="12" cy="13" rx="9" ry="6.5"/><rect x=".4" y="11.6" width="3.6" height="2.4" rx="1.2"/><rect x="20" y="11.6" width="3.6" height="2.4" rx="1.2"/><ellipse cx="12" cy="12.4" rx="7" ry="4.6" fill="D" opacity=".35"/><g fill="D"><circle cx="9" cy="11.4" r="1.1"/><circle cx="13.6" cy="10.6" r="1.1"/><circle cx="15.4" cy="13.6" r="1.1"/><circle cx="10.6" cy="14.4" r="1.1"/><path d="M12.4 12.8l1.6-.8-.2 1.8z"/></g>'],
    ['die Gondel', '<path d="M.8 3.6l22.4 3.8" stroke="currentColor" stroke-width="1.3"/><path d="M12 5.6v3.8" stroke="currentColor" stroke-width="1.6"/><rect x="9.6" y="4.4" width="4.8" height="2.2" rx=".8"/><rect x="5.4" y="9.2" width="13.2" height="12" rx="2.4"/><path d="M7.4 11.4h3.8v4.2H7.4zM12.8 11.4h3.8v4.2h-3.8z" fill="D"/>'],
    ['der Käse', '<path d="M2 18.5h20v-7.7L2 5.6z"/><g fill="D"><circle cx="7" cy="12.4" r="1.6"/><circle cx="14" cy="14.6" r="2"/><circle cx="18.6" cy="12.8" r="1.1"/><circle cx="10.4" cy="16.6" r="1"/></g>'],
    ['die Distel', '<path d="M6.6 9.6l-1-6.2 2.8 3.8.4-5.4 2 4.8L12 1.2l1.2 5.4 2-4.8.4 5.4 2.8-3.8-1 6.2z"/><ellipse cx="12" cy="12" rx="5" ry="3.6"/><path d="M9 10.4l6 3.2M15 10.4l-6 3.2M12 8.6v6.8" stroke="D" stroke-width=".8"/><rect x="11.2" y="15" width="1.6" height="8" rx=".6"/><path d="M12 19q-5 0-7.4-4 4 .6 7.4 3.4zM12 20.4q5 0 7.4-4-4 .6-7.4 3.4z"/>'],
    ['der Dudelsack', '<path d="M3.2 14.4q0-6 6.2-6.2 6.4.2 6.4 6.2t-6.4 6.2q-6.2-.2-6.2-6.2z"/><path d="M12.4 9.2l4-7.4M14.6 10.4l5-6.8M15.6 12.6l6.8-4.4M7.6 19.8l-2.2 3.4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M5 12h9M5 16h9M7.4 9v11M11.4 9v11" stroke="D" stroke-width=".9" opacity=".8"/>'],
    ['das Schottenkaro', '<rect x="2" y="2" width="20" height="20" rx="2.5"/><path d="M2 8h20M2 16h20M8 2v20M16 2v20" stroke="D" stroke-width="2.2" opacity=".55"/><path d="M2 12h20M12 2v20" stroke="D" stroke-width=".8" opacity=".9"/>']
  ];

  const SETS = {
    zahlen: { label: 'Zahlen', items: null },
    katzen: { label: 'Katzen', items: katzen },
    backen: { label: 'Backstube', items: backen },
    bau: { label: 'Baustelle', items: bau },
    reisen: { label: 'Reisen 2027', items: reisen }
  };
  const ORDER = ['zahlen', 'katzen', 'backen', 'bau', 'reisen'];

  function inject() {
    let defs = '';
    for (const key of ORDER) {
      const items = SETS[key].items; if (!items) continue;
      items.forEach(([, svg], k) => { defs += `<symbol id="sym-${key}-${k + 1}" viewBox="0 0 24 24" fill="currentColor">${d(svg)}</symbol>`; });
    }
    const holder = document.createElement('div');
    holder.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${defs}</defs></svg>`;
    document.body.prepend(holder.firstChild);
  }

  // Name für Tipp-Texte (Nominativ mit Artikel)
  function name(set, v) { return set === 'zahlen' || !SETS[set] ? `die ${v}` : SETS[set].items[v - 1][0]; }

  // HTML für ein Symbol (Zahl oder Bild)
  function html(set, v, cls) {
    if (set === 'zahlen' || !SETS[set]) return `<span class="${cls || 'big'}">${v}</span>`;
    return `<svg class="sym ${cls || 'big'}" style="color:var(--s${v});--sym-detail:var(--d${v},#fff)" aria-label="${SETS[set].items[v - 1][0]}"><use href="#sym-${set}-${v}"/></svg>`;
  }

  root.Symbols = { SETS, ORDER, inject, name, html };
})(window);
