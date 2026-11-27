import * as React from 'react';
import { TextInput } from '@gbgabiola/ui';
import type { DemoMetadata } from '../catalog/demo-entry';

export const meta = {
  "component": "TextInput",
  "category": "Forms",
  "description": "Labeled text fields with help and validation messages.",
  "order": 1
} satisfies DemoMetadata;

export function Example() {
  const [text, setText] = React.useState('');
  return <><TextInput label="Your name" hint="Try typing your name." value={text} onChange={(event) => setText(event.target.value)} /><p role="status">{text ? `Hello, ${text}.` : 'Your greeting will appear here.'}</p></>;
}
