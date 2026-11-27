/* Shared appearance state and demo workspace controls. */
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
  }
  apply(read());
  window.UIKitAppearance = { get: () => appearance, set,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); } };
  system.addEventListener('change', () => {
    if (appearance.preference === 'system') apply(normalize({ palette: appearance.palette }));
  });
  window.addEventListener('storage', (event) => { if (event.key === key || event.key === null) apply(read()); });
  document.addEventListener('DOMContentLoaded', () => {
    const metadata = document.getElementById('uik-demo-metadata');
    if (!metadata || embedded) return;
    const demo = JSON.parse(metadata.textContent);
    const heading = document.createElement('header');
    heading.className = 'demo-info';
    const titleRow = document.createElement('div');
    titleRow.className = 'demo-title-row';
    const title = document.createElement('h1');
    title.id = 'demo-title'; title.textContent = demo.title;
    const technology = document.createElement('span');
    technology.className = 'demo-technology'; technology.textContent = demo.technology;
    titleRow.append(title, technology);
    const description = document.createElement('p');
    description.textContent = demo.description;
    heading.append(titleRow, description);
    const navigation = document.createElement('nav');
    navigation.className = 'demo-navigation'; navigation.setAttribute('aria-label', 'Demo navigation');
    for (const [label, href] of [['← All demos', '/ui-kit/#demos'], ['View source', demo.sourceHref], ...(demo.docsHref ? [['Documentation', demo.docsHref]] : [])]) {
      const link = document.createElement('a'); link.href = href; link.textContent = label;
      navigation.append(link);
    }
    const select = document.createElement('select');
    select.className = 'demo-palette'; select.setAttribute('aria-label', 'Color palette');
    palettes.forEach((palette) => select.add(new Option(palette[0].toUpperCase() + palette.slice(1), palette)));
    select.addEventListener('change', () => set({ palette: select.value }));
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'demo-theme-toggle';
    toggle.addEventListener('click', () => set({ theme: appearance.theme === 'dark' ? 'light' : 'dark' }));
    navigation.append(select, toggle);
    document.body.prepend(heading);
    document.body.append(navigation);
    apply(appearance);
    const measure = () => {
      document.documentElement.style.setProperty('--demo-header-height', `${Math.ceil(heading.getBoundingClientRect().height)}px`);
      document.documentElement.style.setProperty('--demo-controls-height', `${Math.ceil(navigation.getBoundingClientRect().height)}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(heading); observer.observe(navigation); measure();
  });
})();
