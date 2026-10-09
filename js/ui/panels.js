// Bilgi paneli içerikleri (HTML). Metinler bu projenin kendi içeriğidir; kullanıcı girdisi içermez.
import { t, pick, getLanguage } from '../i18n.js';
import { PARTS, PART_ORDER, groupOf } from '../content/parts.js';
import { MISSION, STATS, SURVEYS, TIMELINE, L2, FOV, ABOUT, SOURCES, REPO_URL } from '../content/mission.js';
import { fovDiagram, l2Diagram } from './diagrams.js';

const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;

const list = (items, cls = '') => `<ul class="${cls}">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;

export function renderPart(id, { inside }) {
  const part = PARTS[id];
  const text = pick(part);
  const inner = part.layer === 'inner';
  const index = PART_ORDER.indexOf(id);
  const prev = PART_ORDER[(index - 1 + PART_ORDER.length) % PART_ORDER.length];
  const next = PART_ORDER[(index + 1) % PART_ORDER.length];
  const actions = part.actions ?? [];

  let html = `<span class="info__tag ${inner ? 'info__tag--inner' : ''}">${index + 1} · ${t(`group.${groupOf(id)}`)} · ${t(inner ? 'layer.inner' : 'layer.outer')}</span>`;
  html += `<h2 class="info__title" id="info-title">${text.name}</h2>`;
  html += `<p class="info__sub ${inner ? 'info__sub--inner' : ''}">${text.sub}</p>`;
  html += `<p>${text.desc}</p>`;
  if (text.specs) {
    html += `<h3>${t('info.specs')}</h3><dl class="specs">${text.specs
      .map(([k, v]) => `<div class="spec"><dt>${k}</dt><dd>${v}</dd></div>`)
      .join('')}</dl>`;
  }
  html += `<h3>${t('info.highlights')}</h3>${list(text.facts, inner ? 'is-inner' : '')}`;

  const buttons = [`<button type="button" class="btn btn--primary" data-action="focus-part">${icon('focus')}${t('info.focus')}</button>`];
  if (actions.includes('inside') && !inside) buttons.push(`<button type="button" class="btn" data-action="inside">${icon('eye')}${t('info.inside')}</button>`);
  if (actions.includes('light')) buttons.push(`<button type="button" class="btn btn--amber" data-action="light">${icon('light')}${t('info.light')}</button>`);
  if (actions.includes('deploy')) buttons.push(`<button type="button" class="btn" data-action="deploy">${icon('deploy')}${t('info.deploy')}</button>`);
  html += `<div class="info__actions">${buttons.join('')}</div>`;

  html += `<nav class="info__nav" aria-label="${t('info.prev')} / ${t('info.next')}">
    <button type="button" class="btn" data-action="prev-part" aria-label="${t('info.prev')}: ${pick(PARTS[prev]).name}">${icon('prev')}<span>${pick(PARTS[prev]).name}</span></button>
    <button type="button" class="btn" data-action="next-part" aria-label="${t('info.next')}: ${pick(PARTS[next]).name}"><span>${pick(PARTS[next]).name}</span>${icon('next')}</button>
  </nav>`;
  return html;
}

function formatDate(value) {
  const lang = getLanguage() === 'tr' ? 'tr-TR' : 'en-GB';
  const [y, m, d] = value.split('-').map(Number);
  if (!m) return String(y);
  const date = new Date(Date.UTC(y, m - 1, d || 1));
  const opts = d ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' } : { month: 'long', year: 'numeric', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(lang, opts).format(date);
}

export function renderMission() {
  const m = pick(MISSION);
  let html = `<span class="info__tag info__tag--neutral">${m.tag}</span>`;
  html += `<h2 class="info__title" id="info-title">${m.title}</h2><p class="info__sub">${m.sub}</p>`;
  html += `<p>${m.intro}</p>`;
  html += `<h3>${m.goalsTitle}</h3>${list(m.goals)}`;
  html += `<h3>${m.numbersTitle}</h3><div class="stats">${STATS.map(
    (s) => `<div class="stat"><strong>${pick(s.value)}</strong><span>${pick(s.label)}</span></div>`,
  ).join('')}</div>`;
  html += `<h3>${m.surveysTitle}</h3>${SURVEYS.map((s) => {
    const x = pick(s);
    return `<div class="survey"><h4>${x.name}</h4><p class="note">${x.meta}</p><p>${x.text}</p></div>`;
  }).join('')}<p class="note">${m.surveysNote}</p>`;

  let nowMarked = false;
  const items = TIMELINE.map((item) => {
    let cls = item.planned ? '' : 'is-done';
    if (item.planned && !nowMarked) {
      cls = 'is-now';
      nowMarked = true;
    }
    const planned = item.planned ? ` · ${m.planned}` : '';
    return `<li class="${cls}"><time datetime="${item.date}">${formatDate(item.date)}${planned}</time>${pick(item)}</li>`;
  });
  html += `<h3>${m.timelineTitle}</h3><ul class="timeline">${items.join('')}</ul>`;
  html += `<h3>${m.nameTitle}</h3><p>${m.name}</p><p class="note">${m.costNote}</p>`;
  html += `<div class="info__actions">
    <button type="button" class="btn" data-action="fov">${icon('fov')}${t('tool.fov')}</button>
    <button type="button" class="btn" data-action="l2">${icon('orbit')}${t('tool.l2')}</button>
    <button type="button" class="btn btn--primary" data-action="tour">${icon('tour')}${t('tool.tour')}</button>
  </div>`;
  return html;
}

export function renderL2() {
  const x = pick(L2);
  let html = `<span class="info__tag info__tag--neutral">${x.tag}</span>`;
  html += `<h2 class="info__title" id="info-title">${x.title}</h2><p class="info__sub">${x.sub}</p>`;
  html += `<figure class="figure">${l2Diagram(x)}</figure>`;
  html += `<p>${x.desc}</p><h3>${t('info.highlights')}</h3>${list(x.facts)}`;
  return html;
}

export function renderFov() {
  const x = pick(FOV);
  let html = `<span class="info__tag info__tag--neutral">${x.tag}</span>`;
  html += `<h2 class="info__title" id="info-title">${x.title}</h2><p class="info__sub">${x.sub}</p>`;
  html += `<figure class="figure">${fovDiagram(x)}<figcaption>${x.scale}</figcaption></figure>`;
  html += `<p>${x.desc}</p><h3>${t('info.highlights')}</h3>${list(x.facts)}`;
  html += `<div class="info__actions"><button type="button" class="btn btn--primary" data-action="show-part" data-part="wfi_detector">${icon('focus')}${pick(PARTS.wfi_detector).name}</button></div>`;
  return html;
}

export function renderAbout() {
  const x = pick(ABOUT);
  let html = `<span class="info__tag info__tag--neutral">${x.tag}</span>`;
  html += `<h2 class="info__title" id="info-title">${x.title}</h2>`;
  html += `<p>${x.desc}</p>`;
  html += `<h3>${x.sourcesTitle}</h3>${list(
    SOURCES.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`),
    'sources',
  )}`;
  html += `<h3>${x.techTitle}</h3><p>${x.tech}</p>`;
  html += `<div class="info__actions"><a class="btn" href="${REPO_URL}" target="_blank" rel="noopener">${icon('code')}${x.code}</a></div>`;
  return html;
}

/** Yardım penceresinin içeriği. */
export function renderHelp() {
  const row = (keys, label) => `<dt>${keys.map((k) => `<kbd>${k}</kbd>`).join('')}</dt><dd>${t(label)}</dd>`;
  return `
    <h3>${t('help.mouse')}</h3>
    ${list([t('help.mouseRotate'), t('help.mouseZoom'), t('help.mousePan'), t('help.mouseClick'), t('help.mouseDouble')])}
    <h3>${t('help.keys')}</h3>
    <dl class="keys">
      ${row(['T'], 'help.keyTour')}
      ${row(['P'], 'help.keyParts')}
      ${row(['I'], 'help.keyInside')}
      ${row(['L'], 'help.keyLight')}
      ${row(['D'], 'help.keyDeploy')}
      ${row(['E'], 'help.keyExplode')}
      ${row(['M'], 'help.keyDims')}
      ${row(['H'], 'help.keyLabels')}
      ${row(['←', '→'], 'help.keyCycle')}
      ${row(['R'], 'help.keyReset')}
      ${row(['O'], 'help.keyRotate')}
      ${row(['F'], 'help.keyFullscreen')}
      ${row(['Esc'], 'help.keyEsc')}
      ${row(['?'], 'help.keyHelp')}
    </dl>
    <p class="note" style="margin-top:18px">${t('help.about')}</p>`;
}
