// Simple SVG avatar generator with initials and deterministic color
export function buildInitials(firstName?: string, lastName?: string, email?: string) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  if (f || l) {
    return `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase() || (email?.[0]?.toUpperCase() || 'U');
  }
  return (email?.[0]?.toUpperCase() || 'U');
}

export function colorFromSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}

export function avatarSvg(initials: string, bg: string, size = 400): string {
  const text = (initials || 'U').trim().slice(0, 2).toUpperCase();
  const single = text.length === 1;

  const fontSize = Math.round(size * (single ? 0.56 : 0.44));
  const letterSpacing = single ? '0' : '-0.05em';

  const capRatio = 0.70;
  const baselineY = (size / 2) + (fontSize * capRatio * 0.5);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${text} avatar">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}" />
      <stop offset="100%" stop-color="${bg}" stop-opacity="0.9" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size/2}" ry="${size/2}" fill="url(#g)"/>
  <text
    x="50%"
    y="${baselineY}"
    text-anchor="middle"
    font-family="DejaVu Sans,Liberation Sans,Arial,sans-serif"
    font-size="${fontSize}"
    font-weight="700"
    fill="#fff"
    style="letter-spacing:${letterSpacing};paint-order:stroke;dominant-baseline:alphabetic;">
    ${text}
  </text>
</svg>`.trim();
}