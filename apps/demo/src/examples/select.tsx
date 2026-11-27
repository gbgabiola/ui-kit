import * as React from 'react';
import { Select } from '@gbgabiola/ui';
import type { DemoMetadata } from '../demo-entry';

export const meta = {
  "component": "Select",
  "category": "Forms",
  "description": "A labeled native select control.",
  "order": 3
} satisfies DemoMetadata;

export function Example() {
  const [selected, setSelected] = React.useState('personal');
  return <><Select label="Workspace" value={selected} onChange={(event) => setSelected(event.target.value)}><option value="personal">Personal</option><option value="team">Team</option></Select><p role="status">Selected workspace: {selected}</p></>;
}
