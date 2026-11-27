import * as React from 'react';
import { Button, ContentCard } from '@gbgabiola/ui';
import type { DemoMetadata } from '../demo-entry';

export const meta = {
  "component": "ContentCard",
  "category": "Blocks",
  "description": "Present projects, articles, or products.",
  "order": 12
} satisfies DemoMetadata;

export function Example() {
  const [checked, setChecked] = React.useState(false);
  return <><ContentCard title="Reading nook" description="Built-in shelving for a small room." href="#project-details" actions={<Button aria-pressed={checked} onClick={() => setChecked(!checked)}>{checked ? 'Saved' : 'Save project'}</Button>} /><p id="project-details">Oak shelving and a quiet place to read.</p><p role="status">{checked ? 'Project saved.' : 'Project not saved.'}</p></>;
}
