// Arayüz denetleyicisi: araç çubuğu, paneller, oynatıcı, klavye kısayolları, paylaşım ve
// URL durumu. 3D uygulama yüklenmeden önce de çalışan kısımlar (dil, yardım, tam ekran)
// hemen bağlanır; geri kalanı connect(app) ile etkinleşir.
import { t, pick, setLanguage, onLanguageChange } from '../i18n.js';
import { PARTS, GROUPS, partNumber } from '../content/parts.js';
import { TOUR, LIGHT_STEPS, DEPLOY_STEPS } from '../content/sequences.js';
import { renderPart, renderMission, renderL2, renderFov, renderAbout, renderHelp } from './panels.js';
import { createPlayer } from './player.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const isSmall = () => matchMedia('(max-width: 900px)').matches;

export function createUI() {
  const els = {
    loader: $('#loader'),
    progress: $('#loader-progress'),
    loaderError: $('#loader-error'),
    loaderErrorText: $('#loader-error-text'),
    info: $('#info-panel'),
    infoBody: $('#info-body'),
    parts: $('#parts-panel'),
    partsList: $('#parts-list'),
    tooltip: $('#tooltip'),
    hint: $('#hint'),
    toast: $('#toast'),
    help: $('#help-dialog'),
    helpBody: $('#help-body'),
    settings: $('#settings-menu'),
    explode: $('#explode'),
    player: $('#player'),
    canvas: $('#scene'),
  };

  let app = null;
  let info = null; // { kind: 'part'|'mission'|'fov'|'l2'|'about', id? }
  let keyboardMode = false;
  let insideBeforeLight = false;
  let tourOwnsSelection = false;
  let lastInside = false;
  let toastTimer = 0;
  let hintTimer = 0;

  const player = createPlayer(els.player, {
    onChange: (kind) => {
      if (kind) hideHint();
      syncToolbar();
      syncHash();
      updateSheetState();
    },
  });

  /* ------------------------- Yardımcılar ------------------------- */
  function toast(message, duration = 2600) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add('is-visible');
    toastTimer = setTimeout(() => els.toast.classList.remove('is-visible'), duration);
  }

  function setPressed(action, on) {
    for (const el of $$(`[data-action="${action}"][aria-pressed]`)) el.setAttribute('aria-pressed', String(Boolean(on)));
  }

  function updateSheetState() {
    const small = isSmall();
    document.body.classList.toggle('has-sheet', small && (!els.info.hidden || !els.parts.hidden));
    // Masaüstünde açık paneller sahnenin bir kısmını kapatır: görüntüyü boş alana ortala
    if (app) {
      const right = !small && !els.info.hidden ? els.info.offsetWidth + 14 : 0;
      const left = !small && !els.parts.hidden ? els.parts.offsetWidth + 10 : 0;
      // Alt kısımdaki anlatım kutusu açıkken modeli biraz yukarı al
      const bottom = !els.player.hidden ? els.player.offsetHeight * 0.55 : 0;
      const sheet = small && (!els.info.hidden || !els.parts.hidden) ? window.innerHeight * 0.26 : 0;
      app.setViewShift((right - left) / 2, bottom + sheet);
    }
  }

  /* ------------------------- Yükleme ekranı ------------------------- */
  function setProgress(value) {
    els.progress.style.width = `${Math.round(Math.max(0.08, Math.min(1, value)) * 100)}%`;
  }

  function showError(key) {
    els.loaderError.hidden = false;
    els.loaderErrorText.textContent = t(key);
    $('.loader__text').hidden = true;
    $('.loader__bar').hidden = true;
  }

  function hideLoader() {
    setProgress(1);
    els.loader.classList.add('is-done');
    setTimeout(() => els.loader.remove(), 900);
  }

  /* ------------------------- Bilgi paneli ------------------------- */
  function renderInfo() {
    if (!info) return;
    const inside = app?.state.inside ?? false;
    const html = {
      part: () => renderPart(info.id, { inside }),
      mission: renderMission,
      fov: renderFov,
      l2: renderL2,
      about: renderAbout,
    }[info.kind]();
    els.infoBody.innerHTML = html;
  }

  function openInfo(kind, id) {
    info = { kind, id };
    renderInfo();
    els.info.hidden = false;
    els.infoBody.scrollTop = 0;
    if (isSmall()) els.parts.hidden = true;
    updateSheetState();
    syncToolbar();
    syncHash();
    if (keyboardMode) els.info.focus({ preventScroll: true });
  }

  function closeInfo({ deselect = true } = {}) {
    if (!info) return;
    const wasPart = info.kind === 'part';
    info = null;
    els.info.hidden = true;
    updateSheetState();
    syncToolbar();
    syncHash();
    if (wasPart && deselect && app?.state.selected) app.select(null, { source: 'panel' });
  }

  function toggleInfo(kind) {
    if (info?.kind === kind) closeInfo();
    else {
      if (app?.state.selected) app.select(null, { source: 'panel' });
      openInfo(kind);
    }
  }

  /* ------------------------- Parça listesi ------------------------- */
  function renderPartsList() {
    const selected = app?.state.selected;
    els.partsList.innerHTML = GROUPS.map((group) => `
      <section class="parts-group" aria-labelledby="pg-${group.id}">
        <h3 id="pg-${group.id}">${t(`group.${group.id}`)}</h3>
        ${group.parts.map((id) => {
          const text = pick(PARTS[id]);
          const inner = PARTS[id].layer === 'inner';
          return `<button type="button" class="part-item ${inner ? 'part-item--inner' : ''}" data-part="${id}" aria-current="${id === selected}">
            <span class="part-item__num" aria-hidden="true">${partNumber(id)}</span>
            <span class="part-item__text"><span class="part-item__name">${text.name}</span><span class="part-item__sub">${text.sub}</span></span>
          </button>`;
        }).join('')}
      </section>`).join('');
  }

  function toggleParts(force) {
    const open = force ?? els.parts.hidden;
    els.parts.hidden = !open;
    if (open) {
      renderPartsList();
      if (isSmall()) {
        els.info.hidden = true;
        info = null;
      }
      if (keyboardMode) ($('[aria-current="true"]', els.partsList) ?? $('.part-item', els.partsList))?.focus();
    }
    updateSheetState();
    syncToolbar();
  }

  /* ------------------------- Diziler ------------------------- */
  function startTour() {
    closeInfo({ deselect: false });
    if (isSmall()) toggleParts(false);
    player.start({
      kind: 'tour',
      titleKey: 'player.tour',
      steps: TOUR.map((stop) => () => pick(stop)),
      onStep: (i) => app.tourStep(i),
      onClose: () => {
        if (tourOwnsSelection && app.state.selected) app.select(null, { source: 'tour' });
      },
    });
    tourOwnsSelection = true;
  }

  function startLight() {
    closeInfo({ deselect: false });
    insideBeforeLight = app.state.inside;
    app.startLight();
    player.start({
      kind: 'light',
      titleKey: 'player.light',
      amber: true,
      duration: 6200,
      steps: LIGHT_STEPS.map((step) => () => pick(step)),
      onStep: (i) => app.setLightStep(i + 1),
      onClose: () => {
        app.stopLight();
        if (!insideBeforeLight) app.setInside(false);
      },
    });
  }

  function startDeploy() {
    closeInfo();
    player.start({
      kind: 'deploy',
      titleKey: 'player.deploy',
      duration: 4600,
      steps: DEPLOY_STEPS.map((step) => () => pick(step)),
      onStep: (i) => app.deployStep(i),
      onClose: () => app.setDeploy(1, 1800),
    });
  }

  function toggleSequence(kind) {
    if (player.kind === kind) player.stop();
    else ({ tour: startTour, light: startLight, deploy: startDeploy })[kind]();
  }

  /* ------------------------- Durum eşitleme ------------------------- */
  function syncToolbar() {
    const s = app?.state;
    setPressed('tour', player.kind === 'tour');
    setPressed('light', player.kind === 'light' || s?.light);
    setPressed('deploy', player.kind === 'deploy');
    setPressed('parts', !els.parts.hidden);
    setPressed('mission', info?.kind === 'mission');
    setPressed('fov', info?.kind === 'fov');
    setPressed('l2', info?.kind === 'l2');
    if (!s) return;
    setPressed('inside', s.inside);
    setPressed('dims', s.dims);
    setPressed('labels', s.labels);
    setPressed('autorotate', s.autorotate);
  }

  function syncExplode(value) {
    if (document.activeElement !== els.explode) els.explode.value = String(Math.round(value * 100));
    els.explode.style.setProperty('--fill', `${els.explode.value}%`);
  }

  function syncHash() {
    let hash = '';
    if (player.kind) hash = player.kind;
    else if (info?.kind === 'part') hash = `part=${info.id}`;
    else if (info) hash = info.kind;
    const url = `${location.pathname}${location.search}${hash ? `#${hash}` : ''}`;
    if (url !== `${location.pathname}${location.search}${location.hash}`) history.replaceState(null, '', url);
  }

  function applyHash() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) return false;
    const [key, value] = hash.split('=');
    if (key === 'part' && PARTS[value]) {
      app.select(value, { focus: true, source: 'url' });
      return true;
    }
    if (['tour', 'light', 'deploy'].includes(key)) {
      toggleSequence(key);
      return true;
    }
    if (['mission', 'fov', 'l2', 'about'].includes(key)) {
      openInfo(key);
      return false;
    }
    return false;
  }

  /* ------------------------- Eylemler ------------------------- */
  async function share() {
    const data = { title: t('app.title'), text: t('app.description'), url: location.href };
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(location.href);
      toast(t('toast.linkCopied'));
    } catch {
      /* kullanıcı paylaşımı iptal etti */
    }
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  async function screenshot() {
    const blob = await app.screenshot();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roman-teleskop-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(t('toast.screenshot'));
  }

  function openHelp() {
    els.helpBody.innerHTML = renderHelp();
    if (!els.help.open) els.help.showModal();
  }

  function toggleSettings(force) {
    const open = force ?? els.settings.hidden;
    els.settings.hidden = !open;
    $('[data-action="settings"]').setAttribute('aria-expanded', String(open));
  }

  const actions = {
    reload: () => location.reload(),
    help: openHelp,
    'help-close': () => els.help.close(),
    fullscreen: toggleFullscreen,
    share,
    settings: () => toggleSettings(),
    about: () => {
      toggleSettings(false);
      openInfo('about');
    },
    // Aşağıdakiler 3D uygulama gerektirir
    tour: () => toggleSequence('tour'),
    light: () => toggleSequence('light'),
    deploy: () => toggleSequence('deploy'),
    parts: () => toggleParts(),
    'parts-close': () => toggleParts(false),
    inside: () => app.setInside(!app.state.inside),
    dims: () => app.setDims(!app.state.dims),
    labels: () => app.setLabels(!app.state.labels),
    mission: () => toggleInfo('mission'),
    fov: () => toggleInfo('fov'),
    l2: () => toggleInfo('l2'),
    reset: () => app.resetView(),
    autorotate: () => app.setAutorotate(!app.state.autorotate),
    screenshot,
    'info-close': () => closeInfo(),
    'focus-part': () => info?.kind === 'part' && app.focusPart(info.id),
    'prev-part': () => app.cycle(-1),
    'next-part': () => app.cycle(1),
    'show-part': (el) => app.select(el.dataset.part, { focus: true, source: 'panel' }),
    'player-close': () => player.stop(),
    'player-prev': () => player.prev(),
    'player-next': () => player.next(),
    'player-toggle': () => player.toggle(),
  };
  // İlk yedi eylem (yeniden yükle … hakkında) 3D uygulama yüklenmeden de çalışır
  const needsApp = new Set(Object.keys(actions).slice(7));

  document.addEventListener('click', (e) => {
    if (!els.settings.hidden && !e.target.closest('.menu-wrap')) toggleSettings(false);
    const target = e.target.closest('[data-action]');
    if (target) {
      const action = target.dataset.action;
      const handler = actions[action];
      if (handler && (app || !needsApp.has(action))) {
        e.preventDefault();
        handler(target);
      }
      return;
    }
    const lang = e.target.closest('[data-lang]');
    if (lang) setLanguage(lang.dataset.lang);
    const part = e.target.closest('.part-item');
    if (part && app) {
      app.select(part.dataset.part, { focus: true, source: 'list' });
      if (isSmall()) toggleParts(false);
    }
  });

  // Klavye mi fare mi kullanılıyor? (odak yönetimi için)
  document.addEventListener('keydown', () => { keyboardMode = true; }, true);
  document.addEventListener('pointerdown', () => { keyboardMode = false; }, true);

  /* ------------------------- Klavye kısayolları ------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable]') && e.key !== 'Escape') return;
    if (els.help.open) return;
    if (e.key === 'Escape') {
      if (!els.settings.hidden) toggleSettings(false);
      else if (player.kind) player.stop();
      else if (info) closeInfo();
      else if (!els.parts.hidden) toggleParts(false);
      else if (app?.state.inside) app.setInside(false);
      else if (app?.state.selected) app.select(null);
      return;
    }
    if (e.key === '?') {
      openHelp();
      return;
    }
    if (!app) return;
    if (e.target.closest?.('button, a') && (e.key === 'Enter' || e.key === ' ')) return;
    const key = e.key.toLowerCase();
    const map = {
      t: () => toggleSequence('tour'),
      p: () => toggleParts(),
      i: () => app.setInside(!app.state.inside),
      l: () => toggleSequence('light'),
      d: () => toggleSequence('deploy'),
      e: () => app.setExplode(app.state.explodeTarget > 0.5 ? 0 : 1, { frame: true }),
      m: () => app.setDims(!app.state.dims),
      h: () => app.setLabels(!app.state.labels),
      r: () => app.resetView(),
      o: () => app.setAutorotate(!app.state.autorotate),
      f: toggleFullscreen,
      arrowright: () => app.cycle(1),
      arrowleft: () => app.cycle(-1),
    };
    const fn = map[key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  });

  /* ------------------------- Ayarlar ------------------------- */
  for (const radio of $$('input[name="quality"]')) {
    radio.addEventListener('change', () => {
      if (!app) return;
      app.setQuality(radio.value);
      try { localStorage.setItem('roman-quality', radio.value); } catch { /* yok say */ }
    });
  }
  $('#opt-sun').addEventListener('change', (e) => app?.setBodies(e.target.checked));

  els.explode.addEventListener('input', () => {
    app?.setExplode(Number(els.explode.value) / 100);
    els.explode.style.setProperty('--fill', `${els.explode.value}%`);
  });

  // Alt sayfayı aşağı kaydırarak kapatma (telefon)
  {
    let startY = null;
    const grip = $('.panel__grip', els.info);
    grip.addEventListener('pointerdown', (e) => { startY = e.clientY; grip.setPointerCapture(e.pointerId); });
    grip.addEventListener('pointerup', (e) => {
      if (startY !== null && e.clientY - startY > 50) closeInfo();
      startY = null;
    });
  }

  window.addEventListener('resize', updateSheetState);

  /* ------------------------- İpucu ------------------------- */
  function showHint() {
    const touch = matchMedia('(pointer: coarse)').matches;
    els.hint.innerHTML = t(touch ? 'hint.touch' : 'hint.desktop');
    els.hint.classList.remove('is-hidden');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(hideHint, 10000);
  }
  function hideHint() {
    els.hint.classList.add('is-hidden');
  }

  /* ------------------------- Dil değişimi ------------------------- */
  onLanguageChange(() => {
    renderInfo();
    if (!els.parts.hidden) renderPartsList();
    if (els.help.open) els.helpBody.innerHTML = renderHelp();
    player.rerender();
    if (!els.hint.classList.contains('is-hidden')) showHint();
    if (app?.state.hover) showTooltip(app.state.hover);
  });

  /* ------------------------- İmleç etiketi ------------------------- */
  let tooltipPos = { x: 0, y: 0 };
  function showTooltip(id, x = tooltipPos.x, y = tooltipPos.y) {
    tooltipPos = { x, y };
    const text = pick(PARTS[id]);
    const inner = PARTS[id].layer === 'inner';
    els.tooltip.innerHTML = `${partNumber(id)}. ${text.name}<small>${t(inner ? 'layer.inner' : 'layer.outer')}</small>`;
    els.tooltip.classList.toggle('is-inner', inner);
    const pad = 16;
    const w = els.tooltip.offsetWidth;
    const left = Math.min(x + pad, window.innerWidth - w - 8);
    els.tooltip.style.transform = `translate(${left}px, ${y + pad}px)`;
    els.tooltip.classList.add('is-visible');
  }
  function hideTooltip() {
    els.tooltip.classList.remove('is-visible');
  }

  /* ------------------------- 3D uygulamaya bağlan ------------------------- */
  function connect(instance) {
    app = instance;
    document.documentElement.classList.add('is-ready');
    updateSheetState();

    let savedQuality = 'auto';
    try { savedQuality = localStorage.getItem('roman-quality') || 'auto'; } catch { /* yok say */ }
    if (savedQuality !== 'auto') {
      app.setQuality(savedQuality);
      const radio = $(`input[name="quality"][value="${savedQuality}"]`);
      if (radio) radio.checked = true;
    }
    $('#opt-sun').checked = app.state.bodies;

    app.on('state', (s) => {
      syncToolbar();
      syncExplode(s.explodeTarget);
      if (s.inside !== lastInside) {
        lastInside = s.inside;
        if (info?.kind === 'part') renderInfo();
      }
    });

    app.on('select', ({ id, source }) => {
      if (source !== 'tour' && player.kind === 'tour') {
        // Kullanıcı tur sırasında kendisi bir parça seçti: turu bitir, seçimi koru
        tourOwnsSelection = false;
        player.stop();
      }
      if (!els.parts.hidden) renderPartsList();
      if (id && source !== 'tour') openInfo('part', id);
      else if (!id && info?.kind === 'part') closeInfo({ deselect: false });
      else if (id && source === 'tour' && info) closeInfo({ deselect: false });
    });

    app.on('hover', ({ id, x, y, source }) => {
      if (id && source === 'pointer' && x !== undefined) showTooltip(id, x, y);
      else hideTooltip();
      els.canvas.style.cursor = id ? 'pointer' : '';
    });

    app.on('interaction', () => {
      hideHint();
      if (player.kind === 'tour') player.pause();
    });

    app.on('quality-lowered', () => toast(t('toast.lowQuality'), 3600));

    syncToolbar();
    syncExplode(0);
    const handled = applyHash();
    if (!handled) app.intro();
    setTimeout(showHint, 1600);
  }

  return { setProgress, showError, hideLoader, connect, toast };
}
