const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" role="img" aria-label="NODUS network mark">
<g stroke="#D8C39D" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
  <path d="M256 52 112 146 68 300 256 460 444 300 400 146 256 52"/>
  <path d="M112 146 400 146M112 146 256 460M400 146 256 460M68 300 400 146M444 300 112 146"/>
</g>
<g fill="#D8C39D">
  <circle cx="256" cy="52" r="16"/>
  <circle cx="112" cy="146" r="16"/>
  <circle cx="400" cy="146" r="16"/>
  <circle cx="68" cy="300" r="16"/>
  <circle cx="444" cy="300" r="16"/>
  <circle cx="256" cy="460" r="16"/>
</g>
</svg>`;
export const NODUS_MARK = `data:image/svg+xml,${encodeURIComponent(svg)}`;
