import { ThemeToggle } from '@gbgabiola/ui';
import { changeAppearance, useAppearance } from '../theme/appearance';
import type { DemoMetadata } from '../catalog/demo-entry';

export const meta = {
  "component": "ThemeToggle",
  "category": "Theme",
  "description": "Switch between light and dark appearance.",
  "order": 5
} satisfies DemoMetadata;

export function Example() {
  const appearance = useAppearance();
  return <><ThemeToggle theme={appearance.theme} onThemeChange={(theme) => changeAppearance({ theme })} /><p role="status">Current theme: {appearance.theme}.</p></>;
}
