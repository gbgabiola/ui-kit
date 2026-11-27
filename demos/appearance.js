/* Shared standalone appearance and embedded-preview protocol. */
(() => {
  const palettes = ['classic', 'ocean', 'teal', 'forest', 'plum', 'walnut', 'ember', 'crimson'];
  const key = 'uik-demo-appearance';
  const query = new URLSearchParams(location.search);
  const embedded = query.get('embedded') === '1';
  let appearance;
  function normalize(value) {
    return { theme: value?.theme === 'light' ? 'light' : 'dark', palette: palettes.includes(value?.palette) ? value.palette : 'teal' };
  }
  function read() {
    try { return normalize(JSON.parse(localStorage.getItem(key) || '{}')); }
    catch { return normalize(); }
  }
  function apply(value, persist = false) {
    appearance = normalize(value);
    const html = document.documentElement;
    html.classList.add('uik-theme');
    html.dataset.theme = appearance.theme;
    html.dataset.palette = appearance.palette;
    if (embedded) html.dataset.embedded = 'true';
    if (persist) { try { localStorage.setItem(key, JSON.stringify(appearance)); } catch { /* Storage is optional. */ } }
    const toggle = document.querySelector('.demo-theme-toggle');
    if (toggle) {
      toggle.textContent = appearance.theme === 'dark' ? '☀' : '☾';
      toggle.setAttribute('aria-label', `Switch to ${appearance.theme === 'dark' ? 'light' : 'dark'} mode`);
    }
    const select = document.querySelector('.demo-palette');
    if (select) select.value = appearance.palette;
  }
  apply(embedded && query.has('theme') ? { theme: query.get('theme'), palette: query.get('palette') } : read());
  window.addEventListener('storage', (event) => { if (event.key === key) apply(read()); });
  window.addEventListener('message', (event) => {
    if (!embedded || parent === window || event.origin !== location.origin || event.source !== parent || event.data?.type !== 'uik-appearance') return;
    if (!['light', 'dark'].includes(event.data.theme) || !palettes.includes(event.data.palette)) return;
    apply(event.data);
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (!location.pathname.includes('/vanilla/')) return;
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
      toggle.addEventListener('click', () => apply({ ...appearance, theme: appearance.theme === 'dark' ? 'light' : 'dark' }, true));
      const select = document.createElement('select');
      select.className = 'demo-palette'; select.setAttribute('aria-label', 'Color palette');
      palettes.forEach((palette) => select.add(new Option(palette[0].toUpperCase() + palette.slice(1), palette)));
      select.addEventListener('change', () => apply({ ...appearance, palette: select.value }, true));
      navigation?.append(select, toggle);
      apply(appearance);
    }
  });
})();
