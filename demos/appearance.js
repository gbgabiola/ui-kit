/* Shared standalone appearance and embedded-preview protocol. */
(() => {
  const palettes = ['classic', 'ocean', 'teal', 'forest', 'plum', 'walnut', 'ember', 'crimson'];
  const key = 'uik-demo-appearance';
  const query = new URLSearchParams(location.search);
  const embedded = query.get('embedded') === '1';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const listeners = new Set();
  let appearance;
  function normalize(value) {
    const preference = ['light', 'dark'].includes(value?.theme) ? value.theme : 'system';
    return { theme: preference === 'system' ? (system.matches ? 'dark' : 'light') : preference, preference,
      palette: palettes.includes(value?.palette) ? value.palette : 'teal' };
  }
  function read() {
    try { return normalize(JSON.parse(localStorage.getItem(key) || '{}')); }
    catch { return normalize(); }
  }
  function apply(next) {
    appearance = next;
    const html = document.documentElement;
    html.classList.add('uik-theme');
    html.dataset.theme = appearance.theme;
    html.dataset.palette = appearance.palette;
    html.style.colorScheme = appearance.theme;
    if (embedded) html.dataset.embedded = 'true';
    const toggle = document.querySelector('.demo-theme-toggle');
    if (toggle) {
      toggle.textContent = appearance.theme === 'dark' ? '☀' : '☾';
      toggle.setAttribute('aria-label', `Switch to ${appearance.theme === 'dark' ? 'light' : 'dark'} mode`);
    }
    const select = document.querySelector('.demo-palette');
    if (select) select.value = appearance.palette;
    listeners.forEach((listener) => listener());
  }
  function set(change) {
    apply(normalize({ theme: change.theme ?? appearance.preference, palette: change.palette ?? appearance.palette }));
    try { localStorage.setItem(key, JSON.stringify({ theme: appearance.preference, palette: appearance.palette })); } catch { /* Storage is optional. */ }
    if (embedded && parent !== window) parent.postMessage({ type: 'uik-preference', theme: appearance.preference, palette: appearance.palette }, location.origin);
  }
  apply(embedded && query.has('theme') ? { ...normalize({ theme: query.get('preference') || query.get('theme'), palette: query.get('palette') }), theme: query.get('theme') === 'light' ? 'light' : 'dark' } : read());
  window.UIKitAppearance = { get: () => appearance, set,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); } };
  system.addEventListener('change', () => {
    if (appearance.preference === 'system') apply(normalize({ palette: appearance.palette }));
  });
  window.addEventListener('storage', (event) => { if (event.key === key || event.key === null) apply(read()); });
  window.addEventListener('message', (event) => {
    if (!embedded || parent === window || event.origin !== location.origin || event.source !== parent || event.data?.type !== 'uik-appearance') return;
    if (!['light', 'dark'].includes(event.data.theme) || !palettes.includes(event.data.palette)) return;
    apply({ theme: event.data.theme, palette: event.data.palette, preference: ['system', 'light', 'dark'].includes(event.data.preference) ? event.data.preference : event.data.theme });
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (!embedded && !location.pathname.includes('/vanilla/')) return;
    if (embedded && parent !== window) {
      let lastHeight = 0;
      const report = () => {
        const height = Math.max(480, Math.ceil(document.body.getBoundingClientRect().height + 32));
        if (lastHeight !== height) { parent.postMessage({ type: 'uik-height', height }, location.origin); lastHeight = height; }
      };
      new ResizeObserver(report).observe(document.body);
      window.addEventListener('load', report);
      parent.postMessage({ type: 'uik-ready' }, location.origin);
      report();
    } else if (!embedded) {
      const navigation = document.querySelector('.demo-navigation');
      const toggle = document.createElement('button');
      toggle.type = 'button'; toggle.className = 'demo-theme-toggle';
      toggle.addEventListener('click', () => set({ theme: appearance.theme === 'dark' ? 'light' : 'dark' }));
      const select = document.createElement('select');
      select.className = 'demo-palette'; select.setAttribute('aria-label', 'Color palette');
      palettes.forEach((palette) => select.add(new Option(palette[0].toUpperCase() + palette.slice(1), palette)));
      select.addEventListener('change', () => set({ palette: select.value }));
      navigation?.append(select, toggle);
      apply(appearance);
    }
  });
})();
