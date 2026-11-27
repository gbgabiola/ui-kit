import { Sidebar } from '@gbgabiola/ui';
import type { DemoMetadata } from '../demo-entry';

export const meta = {
  "component": "Sidebar",
  "category": "Navigation",
  "description": "Collapsible navigation for application layouts.",
  "order": 8
} satisfies DemoMetadata;

export function Example() {
  return <><Sidebar label="Project navigation" links={[{ href: '#example-projects', label: 'Projects', current: true }, { href: '#example-settings', label: 'Settings' }]} /><p id="example-projects">Your projects</p><p id="example-settings">Workspace settings</p></>;
}
