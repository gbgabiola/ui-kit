import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Button, ContentCard, Hero, Navbar, ProgressBar, SiteFooter, TextInput,
  ThemePaletteSelect, ThemeToggle, type Theme, type ThemePalette,
} from '@gbgabiola/ui';
import '@gbgabiola/ui/styles.css';
import catalog from '../../../demos/catalog.json';
import components from '../../../demos/components.json';
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

const base = import.meta.env.BASE_URL;
const detailSlug = location.pathname.slice(base.length).match(/^demos\/([^/]+)\/?$/)?.[1];
const detail = catalog.find((demo) => demo.slug === detailSlug);
const technologies = [{ value: 'all', label: 'All' }, { value: 'html-css', label: 'HTML/CSS' }, { value: 'html-css-js', label: 'HTML/CSS/JavaScript' }];

function Gallery() {
  const [collection, setCollection] = React.useState(location.hash === '#components' ? 'components' : 'demos');
  const [technology, setTechnology] = React.useState('all');
  const frame = React.useRef<HTMLIFrameElement>(null);
  const initialAppearance = React.useRef(readAppearance());
  const [frameHeight, setFrameHeight] = React.useState(480);
  React.useEffect(() => {
    const onHash = () => setCollection(location.hash === '#components' ? 'components' : 'demos');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const [appearance, setAppearance] = React.useState(readAppearance);
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('All demos');
  const [progress, setProgress] = React.useState(35);
  const search = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    try { localStorage.setItem('uik-demo-appearance', JSON.stringify(appearance)); } catch { /* Storage is optional. */ }
    document.documentElement.style.colorScheme = appearance.theme;
    frame.current?.contentWindow?.postMessage({ type: 'uik-appearance', ...appearance }, location.origin);
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
  React.useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'uik-ready') {
        frame.current?.contentWindow?.postMessage({ type: 'uik-appearance', ...appearance }, location.origin);
      }
      if (event.data?.type === 'uik-height' && Number.isFinite(event.data.height) && event.data.height >= 200 && event.data.height <= 20000) {
        setFrameHeight(Math.ceil(event.data.height));
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [appearance]);
  const visible = catalog.filter((demo) =>
    (technology === 'all' || demo.implementation === technology) &&
    (category === 'All demos' || demo.category === category) &&
    `${demo.title} ${demo.description} ${demo.slug}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <div className="uik-theme gallery" data-theme={appearance.theme} data-palette={appearance.palette}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar brand="UI Kit" homeHref={import.meta.env.BASE_URL}
        links={[{ href: `${base}#components`, label: 'Components' }, { href: `${base}#demos`, label: 'Demos' }, { href: storybook, label: 'Storybook' },
          { href: 'https://github.com/gbgabiola/ui-kit', label: 'GitHub' }]}
        actions={<ThemeToggle theme={appearance.theme} onThemeChange={(theme) => setAppearance({ ...appearance, theme })} />} />
      <main id="main" className="gallery-main">
        {detail ? <section className="detail" aria-labelledby="detail-title">
          <a className="uik-button" href={`${base}#demos`}>← Back to demos</a>
          <div className="detail-heading"><div><p className="eyebrow">{technologies.find((item) => item.value === detail.implementation)?.label}</p>
            <h1 id="detail-title">{detail.title}</h1><p>{detail.description}</p></div>
            <ThemePaletteSelect palette={appearance.palette} onPaletteChange={(palette) => setAppearance({ ...appearance, palette })} /></div>
          <div className="detail-actions"><a className="uik-button" href={`https://github.com/gbgabiola/ui-kit/tree/main/demos/vanilla/${detail.slug}`}>View source</a>
            <a className="uik-button" href={`${base}vanilla/${detail.slug}/`}>Open standalone</a></div>
          <iframe ref={frame} title={`${detail.title} interactive preview`} className="demo-frame" style={{ height: frameHeight }}
            src={`${base}vanilla/${detail.slug}/?embedded=1&theme=${initialAppearance.current.theme}&palette=${initialAppearance.current.palette}`} />
        </section> : <><section className="intro">
          <Hero eyebrow="Components, layouts & experiments" title="Small pieces. Working ideas."
            description="Try reusable React components, explore frontend layouts, and play with interactive demos."
            actions={<><a className="uik-button" href="#demos">Explore demos</a><a className="uik-button secondary" href="#components">Browse components</a></>} />
          <section className="preview" aria-labelledby="preview-title">
            <p className="eyebrow">Try the library</p>
            <h2 id="preview-title">Make it your own</h2>
            <ThemePaletteSelect palette={appearance.palette} onPaletteChange={(palette) => setAppearance({ ...appearance, palette })} />
            <ProgressBar label="Sample progress" value={progress} />
            <label className="range-label" htmlFor="progress">Adjust progress <span>{progress}%</span></label>
            <input id="progress" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
          </section>
        </section>
        <nav className="collections" aria-label="Collections">
          <a href="#components" aria-current={collection === 'components' ? 'page' : undefined}>Components <span>{components.length}</span></a>
          <a href="#demos" aria-current={collection === 'demos' ? 'page' : undefined}>Demos <span>{catalog.length}</span></a>
        </nav>
        {collection === 'components' ? <section id="components" aria-labelledby="components-title">
          <div className="catalog-heading"><div><p className="eyebrow">The library</p><h2 id="components-title">Explore the components</h2></div></div>
          <p>Reusable React components with examples, props, and accessibility checks in Storybook.</p>
          <div className="demo-grid">{components.map((component) => <ContentCard key={component.slug} headingLevel={3} eyebrow={component.category}
            title={component.title} description={component.description}
            media={<img className="card-preview" src={`${base}${component.previews[appearance.theme]}`} alt="" loading="lazy" width="960" height="640" />}
            actions={<a className="uik-button" href={`${storybook}?path=/docs/${component.docs}`}>View {component.title} docs<span aria-hidden="true"> ↗</span></a>} />)}</div>
        </section> : <section id="demos" aria-labelledby="demos-title">
          <div className="catalog-heading"><div><p className="eyebrow">The collection</p><h2 id="demos-title">Explore the demos</h2></div>
            <div className="search"><TextInput ref={search} label="Search demos" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try pricing, games, or forms" /></div>
          </div>
          <div className="filters" role="group" aria-label="Filter demos by technology">
            {technologies.map((item) => <button key={item.value} type="button" aria-pressed={item.value === technology} onClick={() => setTechnology(item.value)}>{item.label}</button>)}
          </div>
          <div className="filters" role="group" aria-label="Filter demos by category">
            {categories.map((item) => <button key={item} type="button" aria-pressed={item === category} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <p className="result-count" role="status">{visible.length} of {catalog.length} demos</p>
          <div className="demo-grid">
            {visible.map((demo) => <ContentCard key={demo.slug} headingLevel={3} eyebrow={demo.category} title={demo.title}
              description={demo.description}
              media={<img className="card-preview" src={`${base}${demo.previews[appearance.theme]}`} alt="" loading="lazy" width="960" height="640" />}
              metadata={technologies.find((item) => item.value === demo.implementation)?.label} actions={<a className="uik-button" href={`${import.meta.env.BASE_URL}demos/${demo.slug}/`}>Open {demo.title}<span aria-hidden="true"> ↗</span></a>} />)}
          </div>
          {visible.length === 0 && <div className="empty"><p>No demos match these filters.</p><Button variant="secondary" onClick={() => { setQuery(''); setCategory('All demos'); setTechnology('all'); }}>Clear filters</Button></div>}
        </section>}</>}
      </main>
      <SiteFooter brand="UI Kit" description="Reusable components and frontend experiments by Genesis Gabiola."
        linkGroups={[{ label: 'Explore', links: [{ href: `${base}#components`, label: 'Components' }, { href: `${base}#demos`, label: 'Demos' }, { href: storybook, label: 'Component documentation' }] },
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
