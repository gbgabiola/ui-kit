import type { Demo } from '../catalog';
import { technologies } from '../catalog';
import { base, storybook } from '../catalog/links';
import { AppearanceControls } from '../theme/appearance-controls';
import { DemoFrame } from '../components/demo-frame';

export function DemoPage({ detail }: { detail: Demo }) {
  return <section className="detail" aria-labelledby="detail-title">
        <div className="detail-actions"><a className="uik-button" href={`${base}#demos`}>← Back to demos</a><a className="uik-button" href={detail.sourceHref}>View source</a>
          {detail.docs && <a className="uik-button" href={`${storybook}?path=/docs/${detail.docs}`}>Documentation</a>}</div>
        <div className="detail-heading"><div className="detail-copy"><div className="detail-title-row"><h1 id="detail-title">{detail.title}</h1>
          <span className="technology-badge">{technologies.find((item) => item.value === detail.implementation)?.label}</span></div><p>{detail.description}</p></div><AppearanceControls /></div>
    <DemoFrame key={detail.slug} detail={detail} />
  </section>;
}
