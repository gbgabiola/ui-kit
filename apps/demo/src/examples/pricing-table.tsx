import * as React from 'react';
import { Button, PricingTable } from '@gbgabiola/ui';
import type { DemoMetadata } from '../demo-entry';

export const meta = {
  "component": "PricingTable",
  "category": "Blocks",
  "description": "Compare plans with clear feature lists and actions.",
  "order": 13,
  "wide": true
} satisfies DemoMetadata;

export function Example() {
  const [message, setMessage] = React.useState('');
  const status = <p role="status">{message}</p>;
  return <><PricingTable title="Choose a plan" plans={['Basic', 'Pro', 'Studio'].map((name, index) => ({ id: name.toLowerCase(), name, price: ['$9', '$19', '$29'][index], period: '/ month', features: ['Project workspace', 'Email support'], highlight: index === 1 ? 'Popular' : undefined, action: <Button onClick={() => setMessage(`${name} selected.`)}>Choose {name}</Button> }))} />{status}</>;
}
