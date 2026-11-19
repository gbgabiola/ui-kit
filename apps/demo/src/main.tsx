import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  ContentCard, Hero, Navbar, ProgressBar, SiteFooter, TextInput,
  ThemePaletteSelect, ThemeToggle, type Theme, type ThemePalette,
} from '@gbgabiola/ui';
import '@gbgabiola/ui/styles.css';
import catalog from '../../../demos/catalog.json';
import './styles.css';

const storybook = 'https://main--6af71445d0632045e7443388.chromatic.com/';
const categories = ['All demos', ...new Set(catalog.map((demo) => demo.category))];

function readAppearance(): { theme: Theme; palette: ThemePalette } {
  try {
    const saved = JSON.parse(localStorage.getItem('uik-demo-appearance') || '{}');
    const palettes = ['classic', 'ocean', 'teal', 'forest', 'plum', 'walnut', 'ember', 'crimson'];
    return {
      theme: saved.theme === 'light' ? 'light' : 'dark',
      palette: palettes.includes(saved.palette) ? saved.palette : 'teal',
    };
  } catch {
    return { theme: 'dark', palette: 'teal' };
  }
}

function Gallery() {
  const [appearance, setAppearance] = React.useState(readAppearance);
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('All demos');
  const [progress, setProgress] = React.useState(35);
  const search = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    try { localStorage.setItem('uik-demo-appearance', JSON.stringify(appearance)); } catch { /* Storage is optional. */ }
    document.documentElement.style.colorScheme = appearance.theme;
  }, [appearance]);
  React.useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      const target = event.target;
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
          !(target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable]'))) {
        event.preventDefault();
        search.current?.focus();
      }
    }
    document.addEventListener('keydown', focusSearch);
    return () => document.removeEventListener('keydown', focusSearch);
  }, []);
  const visible = catalog.filter((demo) =>
    (category === 'All demos' || demo.category === category) &&
    `${demo.title} ${demo.description} ${demo.slug}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <div className="uik-theme gallery" data-theme={appearance.theme} data-palette={appearance.palette}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar brand="UI Kit" homeHref={import.meta.env.BASE_URL}
        links={[{ href: '#demos', label: 'Demos' }, { href: storybook, label: 'Storybook' },
          { href: 'https://github.com/gbgabiola/ui-kit', label: 'GitHub' }]}
        actions={<ThemeToggle theme={appearance.theme} onThemeChange={(theme) => setAppearance({ ...appearance, theme })} />} />
      <main id="main" className="gallery-main">
        <section className="intro">
          <Hero eyebrow="Components, layouts & experiments" title="Small pieces. Working ideas."
            description="Try reusable React components, explore frontend layouts, and play with interactive demos."
            actions={<><a className="uik-button" href="#demos">Explore demos</a><a className="uik-button secondary" href={storybook}>Browse components</a></>} />
          <section className="preview" aria-labelledby="preview-title">
            <p className="eyebrow">Try the library</p>
            <h2 id="preview-title">Make it your own</h2>
            <ThemePaletteSelect palette={appearance.palette} onPaletteChange={(palette) => setAppearance({ ...appearance, palette })} />
            <ProgressBar label="Sample progress" value={progress} />
            <label className="range-label" htmlFor="progress">Adjust progress <span>{progress}%</span></label>
            <input id="progress" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
          </section>
        </section>
        <section id="demos" aria-labelledby="demos-title">
          <div className="catalog-heading"><div><p className="eyebrow">The collection</p><h2 id="demos-title">Explore the demos</h2></div>
            <div className="search"><TextInput ref={search} label="Search demos" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try pricing, games, or forms" /></div>
          </div>
          <div className="filters" role="group" aria-label="Filter demos by category">
            {categories.map((item) => <button key={item} type="button" aria-pressed={item === category} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <p className="result-count" role="status">{visible.length} of {catalog.length} demos</p>
          <div className="demo-grid">
            {visible.map((demo) => <ContentCard key={demo.slug} headingLevel={3} eyebrow={demo.category} title={demo.title}
              description={demo.description} actions={<a className="uik-button" href={`${import.meta.env.BASE_URL}vanilla/${demo.slug}/`}>Open {demo.title}<span aria-hidden="true"> ↗</span></a>} />)}
          </div>
          {visible.length === 0 && <div className="empty"><p>No demos match these filters.</p><button type="button" className="uik-button" onClick={() => { setQuery(''); setCategory('All demos'); }}>Clear filters</button></div>}
        </section>
      </main>
      <SiteFooter brand="UI Kit" description="Reusable components and frontend experiments by Genesis Gabiola."
        linkGroups={[{ label: 'Explore', links: [{ href: '#demos', label: 'Demos' }, { href: storybook, label: 'Component documentation' }] },
          { label: 'Elsewhere', links: [{ href: 'https://github.com/gbgabiola/ui-kit', label: 'Source code' }, { href: 'https://gbgabiola.vercel.app/', label: 'Portfolio' }] }]}
        bottom={        <div className="gallery-footer-inner">
          <p>© 2018–{new Date().getUTCFullYear()}{' '}
            <a className="gallery-footer-brand" href="https://gbgabiola.vercel.app/">gbgabiola</a>
          </p>
          <nav aria-label="Footer" className="gallery-footer-links">
            <a href="https://github.com/gbgabiola">GitHub <span aria-hidden="true">↗</span></a>
            <a href="https://gbgabiola.vercel.app/blog">Articles</a>
            <a href="https://gbgabiola.vercel.app/contact">Get in touch</a>
          </nav>
        </div>} />

    </div>
  );
}

createRoot(document.getElementById('root')!).render(<Gallery />);
