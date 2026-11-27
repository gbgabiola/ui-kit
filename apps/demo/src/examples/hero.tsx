import * as React from 'react';
import { Button, Hero } from '@gbgabiola/ui';
import type { DemoMetadata } from '../catalog/demo-entry';

export const meta = {
  "component": "Hero",
  "category": "Blocks",
  "description": "Introduce a page with text, actions, and optional media.",
  "order": 10,
  "wide": true
} satisfies DemoMetadata;

export function Example() {
  const [message, setMessage] = React.useState('');
  const status = <p role="status">{message}</p>;
  return <><Hero headingLevel={2} eyebrow="Design studio" title="Build a space that works for you" description="Furniture and interiors made for everyday use." actions={<Button onClick={() => setMessage('Projects opened.')}>View projects</Button>} />{status}</>;
}
