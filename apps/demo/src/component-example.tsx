import type { DemoModule } from './demo-entry';
import { useAppearance } from './appearance';

const examples = Object.values(import.meta.glob<DemoModule>('./examples/*.tsx', { eager: true }));

export function ComponentExample({ slug }: { slug: string }) {
  const appearance = useAppearance();
  const demo = examples.find(({ meta }) => meta.component.toLowerCase() === slug);
  if (!demo) throw new Error(`Unknown component demo: ${slug}`);
  const { Example, meta } = demo;
  return <main className="uik-theme component-preview" data-theme={appearance.theme} data-palette={appearance.palette} aria-label="Interactive component demo">
    <div className={`component-example${meta.wide ? ' component-example-wide' : ''}`}><Example /></div>
  </main>;
}
