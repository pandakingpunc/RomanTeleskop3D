// Panellerde kullanılan SVG diyagramlar.

/**
 * Görüş alanı karşılaştırması (ölçekli; birimler yay dakikası).
 * Roman WFI: 18 dedektör, her biri ≈ 7,5′; Hubble WFC3/IR ≈ 2,05′ × 2,27′; dolunay ≈ 31′.
 */
export function fovDiagram(text) {
  const chip = 7.5;
  const gap = 0.65;
  const lift = [0, 2.1, 3.4, 3.4, 2.1, 0];
  const x0 = 5;
  const yBase = 38;
  let chips = '';
  for (let c = 0; c < 6; c++) {
    for (let r = 0; r < 3; r++) {
      const x = x0 + c * (chip + gap);
      const y = yBase - (r + 1) * chip - r * gap - lift[c];
      chips += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${chip}" height="${chip}" rx="0.4" class="fov-chip"/>`;
    }
  }
  let stars = '';
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 70; i++) {
    stars += `<circle cx="${(rand() * 108).toFixed(1)}" cy="${(rand() * 54).toFixed(1)}" r="${(0.12 + rand() * 0.3).toFixed(2)}" fill="#cfe2ff" opacity="${(0.25 + rand() * 0.6).toFixed(2)}"/>`;
  }
  const hubbleX = x0 + 0.2;
  const hubbleY = 6.2;
  return `
<svg viewBox="0 0 108 54" role="img" aria-label="${text.roman}, ${text.hubble}, ${text.moon}">
  <defs>
    <radialGradient id="fov-moon" cx="40%" cy="38%" r="70%">
      <stop offset="0" stop-color="#f3f1ea"/>
      <stop offset="0.7" stop-color="#bdbab2"/>
      <stop offset="1" stop-color="#8e8b84"/>
    </radialGradient>
    <style>
      .fov-chip { fill: rgba(66,200,255,0.16); stroke: #42c8ff; stroke-width: 0.3; }
      .fov-label { fill: #dbe6f7; font: 600 2.9px system-ui, sans-serif; }
      .fov-small { fill: #9fb0cc; font: 2.4px system-ui, sans-serif; }
    </style>
  </defs>
  <rect width="108" height="54" fill="#03050b"/>
  ${stars}
  ${chips}
  <text x="${x0}" y="${yBase + 5}" class="fov-label">${text.roman}</text>
  <text x="${x0}" y="${yBase + 8.4}" class="fov-small">${text.footprint}</text>
  <rect x="${hubbleX}" y="${hubbleY}" width="2.05" height="2.27" fill="rgba(255,197,61,0.25)" stroke="#ffc53d" stroke-width="0.3"/>
  <path d="M${hubbleX + 2.4} ${hubbleY + 1.1} H ${hubbleX + 6}" stroke="#ffc53d" stroke-width="0.25"/>
  <text x="${hubbleX + 6.6}" y="${hubbleY + 2}" class="fov-label" fill="#ffc53d" style="fill:#ffc53d">${text.hubble}</text>
  <circle cx="84" cy="25" r="15.5" fill="url(#fov-moon)"/>
  <circle cx="79" cy="20" r="2.6" fill="#a6a39b" opacity="0.55"/>
  <circle cx="88.5" cy="30" r="3.4" fill="#a6a39b" opacity="0.45"/>
  <circle cx="86" cy="18.5" r="1.6" fill="#a6a39b" opacity="0.5"/>
  <text x="84" y="47" class="fov-label" text-anchor="middle">${text.moon}</text>
  <path d="M75 51 H85" stroke="#dbe6f7" stroke-width="0.35"/>
  <path d="M75 50.2 V51.8 M85 50.2 V51.8" stroke="#dbe6f7" stroke-width="0.35"/>
  <text x="87" y="51.9" class="fov-small">${text.arcmin}</text>
</svg>`;
}

/** Güneş – Dünya – L2 şeması (ölçekli değil). */
export function l2Diagram(text) {
  return `
<svg viewBox="0 0 360 170" role="img" aria-label="${text.sun}, ${text.earth}, ${text.halo}">
  <defs>
    <radialGradient id="l2-sun">
      <stop offset="0" stop-color="#fff7d6"/>
      <stop offset="0.55" stop-color="#ffd166"/>
      <stop offset="1" stop-color="#f29e1f"/>
    </radialGradient>
    <radialGradient id="l2-sunglow">
      <stop offset="0" stop-color="rgba(255,200,90,0.55)"/>
      <stop offset="1" stop-color="rgba(255,160,40,0)"/>
    </radialGradient>
    <linearGradient id="l2-shadow" x1="0" x2="1">
      <stop offset="0" stop-color="rgba(0,0,0,0.75)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0)"/>
    </linearGradient>
    <radialGradient id="l2-earth" cx="30%" cy="35%" r="75%">
      <stop offset="0" stop-color="#8fd0ff"/>
      <stop offset="0.6" stop-color="#2f7bd6"/>
      <stop offset="1" stop-color="#103a78"/>
    </radialGradient>
    <style>
      .l2-label { fill: #dbe6f7; font: 600 11px system-ui, sans-serif; }
      .l2-small { fill: #9fb0cc; font: 10px system-ui, sans-serif; }
      .l2-dash { stroke: #6f84a8; stroke-width: 1; stroke-dasharray: 3 4; fill: none; }
    </style>
  </defs>
  <rect width="360" height="170" fill="#03050b" rx="8"/>
  <circle cx="34" cy="80" r="46" fill="url(#l2-sunglow)"/>
  <circle cx="34" cy="80" r="22" fill="url(#l2-sun)"/>
  <text x="34" y="124" class="l2-label" text-anchor="middle">${text.sun}</text>
  <path d="M190 18 A 160 160 0 0 1 190 142" class="l2-dash"/>
  <polygon points="206,72 206,88 300,80.6 300,79.4" fill="url(#l2-shadow)"/>
  <line x1="62" y1="80" x2="186" y2="80" class="l2-dash"/>
  <text x="124" y="72" class="l2-small" text-anchor="middle">${text.sunDistance}</text>
  <circle cx="198" cy="80" r="22" class="l2-dash" style="stroke:#55627a"/>
  <circle cx="198" cy="80" r="8.5" fill="url(#l2-earth)"/>
  <circle cx="198" cy="58" r="3" fill="#c8c6c0"/>
  <text x="198" y="122" class="l2-label" text-anchor="middle">${text.earth}</text>
  <text x="212" y="57" class="l2-small">${text.moon}</text>
  <line x1="222" y1="80" x2="292" y2="80" class="l2-dash"/>
  <text x="258" y="96" class="l2-small" text-anchor="middle">${text.distance}</text>
  <ellipse cx="312" cy="80" rx="17" ry="36" fill="none" stroke="#42c8ff" stroke-width="1.6" stroke-dasharray="5 4"/>
  <circle cx="312" cy="80" r="2.2" fill="#fff"/>
  <g transform="translate(324 48) rotate(-20)">
    <rect x="-6" y="-2.5" width="12" height="5" fill="#d8dde6"/>
    <rect x="-5" y="-6.5" width="10" height="3" fill="#2d3c78"/>
  </g>
  <text x="312" y="30" class="l2-label" text-anchor="middle" style="fill:#42c8ff">${text.halo}</text>
  <text x="352" y="162" class="l2-small" text-anchor="end">${text.diagramNote}</text>
</svg>`;
}
