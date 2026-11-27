import { allDemos, libraryDemos } from './catalog';
import { base } from './catalog/links';
import { ComponentExample } from './component-example';
import { SiteLayout } from './components/site-layout';
import { GalleryPage } from './pages/gallery-page';
import { DemoPage } from './pages/demo-page';

export function App() {
  const path = location.pathname.slice(base.length);
  const detail = allDemos.find((demo) => demo.slug === path.match(/^demos\/([^/]+)\/?$/)?.[1]);
  const example = libraryDemos.find((demo) => demo.slug === path.match(/^examples\/([^/]+)\/?$/)?.[1]);
  if (location.hash === '#components') history.replaceState(null, '', '#demos');
  if (example) return <ComponentExample slug={example.slug} />;
  return <SiteLayout>{detail ? <DemoPage detail={detail} /> : <GalleryPage />}</SiteLayout>;
}
