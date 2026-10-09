// Dil yönetimi: arayüz metinleri, dil algılama ve HTML'deki data-i18n öğelerinin çevirisi.
import { UI_STRINGS } from './content/ui-strings.js';

export const LANGUAGES = ['tr', 'en'];
const STORAGE_KEY = 'roman-language';
const EVENT = 'roman:languagechange';

let current = detectLanguage();

function detectLanguage() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGUAGES.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch { /* depolama kapalı olabilir */ }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = String(tag || '').slice(0, 2).toLowerCase();
    if (LANGUAGES.includes(base)) return base;
  }
  return 'en';
}

export function getLanguage() {
  return current;
}

/** Bir arayüz metnini döndürür; {ad} biçimindeki yer tutucular vars ile doldurulur. */
export function t(key, vars) {
  const value = UI_STRINGS[current]?.[key] ?? UI_STRINGS.tr[key] ?? key;
  if (!vars || typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? vars[name] : `{${name}}`));
}

/** {tr: ..., en: ...} biçimindeki içerikten geçerli dilin karşılığını seçer. */
export function pick(entry) {
  if (entry == null) return entry;
  return entry[current] ?? entry.tr;
}

export function formatNumber(value, options) {
  return new Intl.NumberFormat(current === 'tr' ? 'tr-TR' : 'en-US', options).format(value);
}

/** data-i18n ve data-i18n-attr özniteliği taşıyan öğeleri çevirir. */
export function localize(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) {
    const text = t(el.dataset.i18n);
    if (text.includes('<')) el.innerHTML = text;
    else el.textContent = text;
  }
  for (const el of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  }
}

export function setLanguage(lang) {
  if (!LANGUAGES.includes(lang) || lang === current) return;
  current = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* yok say */ }
  // Adreste ?lang= varsa onu da güncelle; yoksa yenileme ve paylaşım eski dili geri getirir
  const url = new URL(location.href);
  if (url.searchParams.has('lang')) {
    url.searchParams.set('lang', lang);
    history.replaceState(history.state, '', url);
  }
  applyDocument();
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { lang } }));
}

export function onLanguageChange(callback) {
  window.addEventListener(EVENT, () => callback(current));
}

function applyDocument() {
  document.documentElement.lang = current;
  document.title = t('app.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('app.description'));
  for (const button of document.querySelectorAll('[data-lang]')) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === current));
  }
  localize();
}

export function initI18n() {
  applyDocument();
}
