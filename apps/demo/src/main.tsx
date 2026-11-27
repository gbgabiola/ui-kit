import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button, ContentCard, Hero, Navbar, ProgressBar, SiteFooter, TextInput, ThemePaletteSelect, ThemeToggle } from '@gbgabiola/ui';
import { allDemos, libraryDemos, technologies } from './catalog';
import { changeAppearance, useAppearance } from './appearance';
import { ComponentExample } from './component-example';
import './styles.css';

const storybook = 'https://main--6af71445d0632045e7443388.chromatic.com/';
const base = import.meta.env.BASE_URL;
const path = location.pathname.slice(base.length);
const detail = allDemos.find((demo) => demo.slug === path.match(/^demos\/([^/]+)\/?$/)?.[1]);
const example = libraryDemos.find((demo) => demo.slug === path.match(/^examples\/([^/]+)\/?$/)?.[1]);
const categories = ['All demos', ...new Set(allDemos.map((demo) => demo.category))];
if (location.hash === '#components') history.replaceState(null, '', '#demos');

function AppearanceControls() {
  const appearance = useAppearance();
  return <div className="appearance-controls"><ThemePaletteSelect palette={appearance.palette} onPaletteChange={(palette) => changeAppearance({ palette })} /></div>;
}
function Gallery() {
  const appearance = useAppearance();
  const initialAppearance = React.useRef(appearance);
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = React.useState(480);
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('All demos');
  const [technology, setTechnology] = React.useState('all');
  const [progress, setProgress] = React.useState(35);
  const search = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: 'uik-appearance', ...appearance }, location.origin);
  }, [appearance]);
  React.useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      const target = event.target;
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey &&
          !(target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable]'))) {
        event.preventDefault(); search.current?.focus();
      }
    }
    document.addEventListener('keydown', focusSearch);
    return () => document.removeEventListener('keydown', focusSearch);
  }, []);
  React.useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'uik-ready') frame.current?.contentWindow?.postMessage({ type: 'uik-appearance', ...appearance }, location.origin);
      if (event.data?.type === 'uik-height' && Number.isFinite(event.data.height) && event.data.height >= 200 && event.data.height <= 20000) setFrameHeight(Math.ceil(event.data.height));
      if (event.data?.type === 'uik-preference' && ['system', 'light', 'dark'].includes(event.data.theme) &&
          ['classic', 'ocean', 'teal', 'forest', 'plum', 'walnut', 'ember', 'crimson'].includes(event.data.palette)) changeAppearance({ theme: event.data.theme, palette: event.data.palette });
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [appearance]);
  const visible = allDemos.filter((demo) => (technology === 'all' || demo.implementation === technology) &&
    (category === 'All demos' || demo.category === category) && `${demo.title} ${demo.description} ${demo.slug}`.toLowerCase().includes(query.trim().toLowerCase()));
  const current = initialAppearance.current;
  return <div className="uik-theme gallery" data-theme={appearance.theme} data-palette={appearance.palette}>
    <a className="skip-link" href="#main">Skip to content</a>
    <Navbar brand="UI Kit" homeHref={base} links={[{ href: `${base}#demos`, label: 'Demos' }, { href: storybook, label: 'Storybook' }, { href: 'https://github.com/gbgabiola/ui-kit', label: 'GitHub' }]}
      actions={<ThemeToggle theme={appearance.theme} onThemeChange={(theme) => changeAppearance({ theme })} />} />
    <main id="main" className="gallery-main">
      {detail ? <section className="detail" aria-labelledby="detail-title">
        <div className="detail-actions"><a className="uik-button" href={`${base}#demos`}>← Back to demos</a><a className="uik-button" href={detail.sourceHref}>View source</a>
          {detail.docs && <a className="uik-button" href={`${storybook}?path=/docs/${detail.docs}`}>Documentation</a>}</div>
        <div className="detail-heading"><div className="detail-copy"><div className="detail-title-row"><h1 id="detail-title">{detail.title}</h1>
          <span className="technology-badge">{technologies.find((item) => item.value === detail.implementation)?.label}</span></div><p>{detail.description}</p></div><AppearanceControls /></div>
        <iframe ref={frame} title={`${detail.title} interactive preview`} className="demo-frame" style={{ height: frameHeight }}
          src={`${base}${detail.kind === 'react' ? 'examples' : 'vanilla'}/${detail.slug}/?embedded=1&theme=${current.theme}&preference=${current.preference}&palette=${current.palette}`} />
      </section> : <><section className="intro">
        <Hero eyebrow="Components, layouts & experiments" title="Small pieces. Working ideas." description="Try reusable React components, explore frontend layouts, and play with interactive demos."
          actions={<><a className="uik-button" href="#demos">Explore demos</a><a className="uik-button secondary" href={storybook}>Read the docs</a></>} />
        <section className="preview" aria-labelledby="preview-title"><p className="eyebrow">Try the library</p><h2 id="preview-title">Make it your own</h2><AppearanceControls />
          <ProgressBar label="Sample progress" value={progress} /><label className="range-label" htmlFor="progress">Adjust progress <span>{progress}%</span></label>
          <input id="progress" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} /></section>
      </section>
      <section id="demos" aria-labelledby="demos-title"><div className="catalog-heading"><div><p className="eyebrow">The collection</p><h2 id="demos-title">Explore the demos</h2></div>
        <div className="search"><TextInput ref={search} label="Search demos" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try pricing, games, or forms" /></div></div>
        <div className="filters" role="group" aria-label="Filter demos by technology">{technologies.map((item) => <button key={item.value} type="button" aria-pressed={item.value === technology} onClick={() => setTechnology(item.value)}>{item.label}</button>)}</div>
        <div className="filters" role="group" aria-label="Filter demos by category">{categories.map((item) => <button key={item} type="button" aria-pressed={item === category} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <p className="result-count" role="status">{visible.length} of {allDemos.length} demos</p>
        <div className="demo-grid">{visible.map((demo) => <ContentCard key={demo.slug} headingLevel={3} eyebrow={demo.category} title={demo.title} description={demo.description}
          media={<img className="card-preview" src={`${base}${demo.previews[appearance.theme]}`} alt="" loading="lazy" width="960" height="640" />}
          metadata={technologies.find((item) => item.value === demo.implementation)?.label} actions={<a className="uik-button" href={`${base}demos/${demo.slug}/`}>Open {demo.title}<span aria-hidden="true"> ↗</span></a>} />)}</div>
        {visible.length === 0 && <div className="empty"><p>No demos match these filters.</p><Button variant="secondary" onClick={() => { setQuery(''); setCategory('All demos'); setTechnology('all'); }}>Clear filters</Button></div>}
      </section></>}
    </main>
      <SiteFooter brand="UI Kit" description="Reusable components and frontend experiments by Genesis Gabiola."
        linkGroups={[{ label: 'Explore', links: [{ href: `${base}#demos`, label: 'Demos' }, { href: storybook, label: 'Component documentation' }] },
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
  </div>;
}
createRoot(document.getElementById('root')!).render(example ? <ComponentExample slug={example.slug} /> : <Gallery />);
