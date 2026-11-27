import * as React from 'react';
import { Button } from '@gbgabiola/ui';
import type { DemoMetadata } from '../demo-entry';

export const meta = {
  "component": "Button",
  "category": "Actions",
  "description": "Primary and secondary actions with native button behavior.",
  "order": 0
} satisfies DemoMetadata;

export function Example() {
  const [count, setCount] = React.useState(0);
  return <><div className="example-actions"><Button onClick={() => setCount(count + 1)}>Add item</Button><Button variant="secondary" onClick={() => setCount(0)}>Reset count</Button></div><p role="status">{count} {count === 1 ? 'item' : 'items'} added.</p></>;
}
