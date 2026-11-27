import { Navbar } from '@gbgabiola/ui';
import type { DemoMetadata } from '../demo-entry';

export const meta = {
  "component": "Navbar",
  "category": "Navigation",
  "description": "Responsive navigation with keyboard-friendly controls.",
  "order": 7,
  "wide": true
} satisfies DemoMetadata;

export function Example() {
  return <><Navbar label="Example navigation" brand="Studio" homeHref="#example-overview" links={[{ href: '#example-overview', label: 'Overview' }, { href: '#example-projects', label: 'Projects' }]} /><h2 id="example-overview">Studio overview</h2><p id="example-projects">Browse the navigation with your keyboard or open its menu on a narrow screen.</p></>;
}
