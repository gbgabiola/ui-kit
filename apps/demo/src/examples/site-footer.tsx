import { SiteFooter } from '@gbgabiola/ui';
import type { DemoMetadata } from '../catalog/demo-entry';

export const meta = {
  "component": "SiteFooter",
  "category": "Blocks",
  "description": "Grouped links and flexible footer content.",
  "order": 11,
  "wide": true
} satisfies DemoMetadata;

export function Example() {
  return <><p id="example-projects">Studio projects</p><p id="example-contact">Contact the studio</p><SiteFooter brand="Oak Studio" description="Furniture and interiors" linkGroups={[{ label: 'Explore', links: [{ label: 'Projects', href: '#example-projects' }] }, { label: 'Support', links: [{ label: 'Contact', href: '#example-contact' }] }]} bottom="© Oak Studio" /></>;
}
