const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 430" fill="none" role="img" aria-label="NODUS network mark">
<g stroke="#F6C489" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M200 40 120 285 200 365 280 285 200 40"/>
  <path d="M120 130 120 285M120 130 200 365M280 130 280 285M280 130 200 365"/>
</g>
<g fill="#F6C489">
  <circle cx="200" cy="40" r="15"/>
  <circle cx="120" cy="130" r="15"/>
  <circle cx="280" cy="130" r="15"/>
  <circle cx="120" cy="285" r="15"/>
  <circle cx="280" cy="285" r="15"/>
  <circle cx="200" cy="365" r="15"/>
</g>
</svg>`;
export const NODUS_MARK = `data:image/svg+xml,${encodeURIComponent(svg)}`;
