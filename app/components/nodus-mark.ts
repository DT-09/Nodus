const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" role="img" aria-label="NODUS six-node network mark">
<defs>
  <linearGradient id="nodus-gold" x1="12" y1="8" x2="88" y2="92" gradientUnits="userSpaceOnUse">
    <stop stop-color="#F4D49A"/>
    <stop offset=".52" stop-color="#D5A65F"/>
    <stop offset="1" stop-color="#B98243"/>
  </linearGradient>
</defs>
<g stroke="url(#nodus-gold)" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round">
  <path d="M50 9 19 33 28 68 50 91 72 68 81 33 50 9Z"/>
  <path d="M19 33 81 33M19 33 72 68M81 33 28 68M28 68 72 68"/>
  <path d="M50 9 28 68M50 9 72 68M19 33 50 91M81 33 50 91"/>
</g>
<g fill="url(#nodus-gold)" stroke="#2A2025" stroke-width="1.2">
  <circle cx="50" cy="9" r="5"/>
  <circle cx="19" cy="33" r="5"/>
  <circle cx="81" cy="33" r="5"/>
  <circle cx="28" cy="68" r="5"/>
  <circle cx="72" cy="68" r="5"/>
  <circle cx="50" cy="91" r="5"/>
</g>
</svg>`;
export const NODUS_MARK = `data:image/svg+xml,${encodeURIComponent(svg)}`;
