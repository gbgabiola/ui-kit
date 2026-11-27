import * as React from 'react';
import { Button, Hero, ProgressBar, TextInput } from '@gbgabiola/ui';
import { allDemos } from '../catalog';
import { storybook } from '../catalog/links';
import { AppearanceControls } from '../theme/appearance-controls';
import { DemoFilters } from '../components/demo-filters';
import { DemoGrid } from '../components/demo-grid';

const categories = ['All demos', ...new Set(allDemos.map((demo) => demo.category))];

export function GalleryPage() {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('All demos');
  const [technology, setTechnology] = React.useState('all');
  const [progress, setProgress] = React.useState(35);
  const search = React.useRef<HTMLInputElement>(null);
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
  const visible = allDemos.filter((demo) => (technology === 'all' || demo.implementation === technology) &&
    (category === 'All demos' || demo.category === category) && `${demo.title} ${demo.description} ${demo.slug}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <><section className="intro">
        <Hero eyebrow="Components, layouts & experiments" title="Small pieces. Working ideas." description="Try reusable React components, explore frontend layouts, and play with interactive demos."
          actions={<><a className="uik-button" href="#demos">Explore demos</a><a className="uik-button secondary" href={storybook}>Read the docs</a></>} />
        <section className="preview" aria-labelledby="preview-title"><p className="eyebrow">Try the library</p><h2 id="preview-title">Make it your own</h2><AppearanceControls />
          <ProgressBar label="Sample progress" value={progress} /><label className="range-label" htmlFor="progress">Adjust progress <span>{progress}%</span></label>
          <input id="progress" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} /></section>
      </section>
      <section id="demos" aria-labelledby="demos-title"><div className="catalog-heading"><div><p className="eyebrow">The collection</p><h2 id="demos-title">Explore the demos</h2></div>
        <div className="search"><TextInput ref={search} label="Search demos" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try pricing, games, or forms" /></div></div>
        <DemoFilters categories={categories} technology={technology} category={category} setTechnology={setTechnology} setCategory={setCategory} />
        <p className="result-count" role="status">{visible.length} of {allDemos.length} demos</p>
        <DemoGrid demos={visible} />
        {visible.length === 0 && <div className="empty"><p>No demos match these filters.</p><Button variant="secondary" onClick={() => { setQuery(''); setCategory('All demos'); setTechnology('all'); }}>Clear filters</Button></div>}
      </section></>;
}
