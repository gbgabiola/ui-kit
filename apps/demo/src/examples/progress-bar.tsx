import * as React from 'react';
import { Button, ProgressBar } from '@gbgabiola/ui';
import type { DemoMetadata } from '../demo-entry';

export const meta = {
  "component": "ProgressBar",
  "category": "Feedback",
  "description": "Show determinate or indeterminate progress.",
  "order": 9
} satisfies DemoMetadata;

export function Example() {
  const [progress, setProgress] = React.useState(35);
  return <><ProgressBar label="Upload progress" value={progress} /><label htmlFor="example-progress">Adjust progress</label><input id="example-progress" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} /><Button variant="secondary" onClick={() => setProgress(0)}>Reset progress</Button></>;
}
