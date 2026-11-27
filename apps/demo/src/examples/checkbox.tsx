import * as React from 'react';
import { Checkbox } from '@gbgabiola/ui';
import type { DemoMetadata } from '../demo-entry';

export const meta = {
  "component": "Checkbox",
  "category": "Forms",
  "description": "An accessible checkbox with a descriptive label.",
  "order": 4
} satisfies DemoMetadata;

export function Example() {
  const [checked, setChecked] = React.useState(false);
  return <><Checkbox label="Email updates" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><p role="status">{checked ? 'Updates enabled.' : 'Updates disabled.'}</p></>;
}
