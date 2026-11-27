import * as React from 'react';
import { Textarea } from '@gbgabiola/ui';
import type { DemoMetadata } from '../catalog/demo-entry';

export const meta = {
  "component": "Textarea",
  "category": "Forms",
  "description": "A multiline field for longer messages.",
  "order": 2
} satisfies DemoMetadata;

export function Example() {
  const [text, setText] = React.useState('');
  return <><Textarea label="Message" value={text} onChange={(event) => setText(event.target.value)} /><p role="status">{text.length} characters</p></>;
}
