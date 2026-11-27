import { ContentCard } from '@gbgabiola/ui';
import type { Demo } from '../catalog';
import { technologies } from '../catalog';
import { base } from '../catalog/links';
import { useAppearance } from '../theme/appearance';

export function DemoGrid({ demos }: { demos: Demo[] }) {
  const appearance = useAppearance();
  return <div className="demo-grid">{demos.map((demo) => <ContentCard key={demo.slug} headingLevel={3} eyebrow={demo.category} title={demo.title} description={demo.description}
          media={<img className="card-preview" src={`${base}${demo.previews[appearance.theme]}`} alt="" loading="lazy" width="960" height="640" />}
          metadata={technologies.find((item) => item.value === demo.implementation)?.label} actions={<a className="uik-button" href={`${base}demos/${demo.slug}/`}>Open {demo.title}<span aria-hidden="true"> ↗</span></a>} />)}</div>;
}
