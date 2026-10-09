// Adım oynatıcı: rehberli tur, ışık yolu ve uzayda açılış anlatımlarını yönetir.
import { t } from '../i18n.js';

/**
 * @param {HTMLElement} root
 * @param {{reducedMotion?: boolean, onChange?: (kind: string|null) => void}} opts
 */
export function createPlayer(root, { onChange } = {}) {
  const title = root.querySelector('#player-title');
  const count = root.querySelector('#player-count');
  const text = root.querySelector('#player-text');
  const dots = root.querySelector('#player-dots');
  const toggle = root.querySelector('[data-action="player-toggle"]');
  let seq = null;
  let timer = 0;

  const plain = (html) => html.replace(/<[^>]+>/g, '');

  function render() {
    if (!seq) return;
    const { steps, index } = seq;
    title.textContent = t(seq.titleKey);
    count.textContent = t('player.count', { n: index + 1, total: steps.length });
    text.innerHTML = steps[index]();
    dots.innerHTML = steps
      .map((_, i) => `<span class="${i < index ? 'is-done' : i === index ? 'is-current' : ''}"></span>`)
      .join('');
    const playing = seq.playing;
    toggle.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play');
    toggle.setAttribute('aria-label', t(playing ? 'player.pause' : 'player.play'));
    toggle.title = t(playing ? 'player.pause' : 'player.play');
    root.classList.toggle('player--amber', Boolean(seq.amber));
  }

  function schedule() {
    clearTimeout(timer);
    if (!seq?.playing) return;
    if (seq.index >= seq.steps.length - 1) {
      seq.playing = false;
      render();
      return;
    }
    const chars = plain(seq.steps[seq.index]()).length;
    const duration = seq.duration ?? Math.min(15000, 3800 + chars * 42);
    timer = setTimeout(() => go(seq.index + 1), duration);
  }

  function go(index) {
    if (!seq) return;
    seq.index = Math.max(0, Math.min(seq.steps.length - 1, index));
    render();
    seq.onStep(seq.index);
    schedule();
  }

  /**
   * @param {{kind: string, titleKey: string, steps: Array<() => string>, onStep: (i: number) => void,
   *          onClose?: () => void, amber?: boolean, duration?: number, autoplay?: boolean}} config
   */
  function start(config) {
    stop();
    seq = { ...config, index: 0, playing: config.autoplay !== false };
    root.hidden = false;
    onChange?.(seq.kind);
    go(0);
  }

  function stop() {
    if (!seq) return;
    clearTimeout(timer);
    const closing = seq;
    seq = null;
    root.hidden = true;
    closing.onClose?.();
    onChange?.(null);
  }

  return {
    start,
    stop,
    next() { if (seq) go(seq.index + 1); },
    prev() { if (seq) go(seq.index - 1); },
    toggle() {
      if (!seq) return;
      if (!seq.playing && seq.index >= seq.steps.length - 1) {
        seq.playing = true;
        go(0);
        return;
      }
      seq.playing = !seq.playing;
      render();
      schedule();
    },
    pause() {
      if (!seq || !seq.playing) return;
      seq.playing = false;
      clearTimeout(timer);
      render();
    },
    rerender: render,
    get kind() { return seq?.kind ?? null; },
    get index() { return seq?.index ?? -1; },
  };
}
