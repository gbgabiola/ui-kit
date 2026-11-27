import { lazy, Suspense } from 'react';
import { libraryDemos } from './catalog';
import { base } from './catalog/links';
import { SiteLayout } from './components/site-layout';
import { GalleryPage } from './pages/gallery-page';

const ComponentPreview = lazy(() => import('./components/component-preview'));

export function App() {
  const path = location.pathname.slice(base.length);
  const slug = path.match(/^(?:demos|examples)\/([^/]+)\/?$/)?.[1];
  const example = libraryDemos.find((demo) => demo.slug === slug);
  if (location.hash === '#components') history.replaceState(null, '', '#demos');
  if (example) return <Suspense fallback={<p role="status">Loading demo…</p>}><ComponentPreview slug={example.slug} /></Suspense>;
  return <SiteLayout><GalleryPage /></SiteLayout>;
}
