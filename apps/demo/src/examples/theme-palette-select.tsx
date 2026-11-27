import { ThemePaletteSelect } from '@gbgabiola/ui';
import { changeAppearance, useAppearance } from '../theme/appearance';
import type { DemoMetadata } from '../catalog/demo-entry';

export const meta = {
  "component": "ThemePaletteSelect",
  "category": "Theme",
  "description": "Choose an accent palette for the interface.",
  "order": 6
} satisfies DemoMetadata;

export function Example() {
  const appearance = useAppearance();
  return <><ThemePaletteSelect palette={appearance.palette} onPaletteChange={(palette) => changeAppearance({ palette })} /><p role="status">Current palette: {appearance.palette}</p></>;
}
