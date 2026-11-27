import * as React from 'react';
import type { Demo } from '../catalog';
import { base } from '../catalog/links';
import { changeAppearance, useAppearance } from '../theme/appearance';

export function DemoFrame({ detail }: { detail: Demo }) {
  const appearance = useAppearance();
  const initialAppearance = React.useRef(appearance);
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [frameHeight, setFrameHeight] = React.useState(480);
  React.useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: 'uik-appearance', ...appearance }, location.origin);
  }, [appearance]);
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
  const current = initialAppearance.current;
  return <iframe ref={frame} title={`${detail.title} interactive preview`} className="demo-frame" style={{ height: frameHeight }}
          src={`${base}${detail.kind === 'react' ? 'examples' : 'vanilla'}/${detail.slug}/?embedded=1&theme=${current.theme}&preference=${current.preference}&palette=${current.palette}`} />;
}
