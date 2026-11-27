import { ThemePaletteSelect } from '@gbgabiola/ui';
import { changeAppearance, useAppearance } from './appearance';

export function AppearanceControls() {
  const appearance = useAppearance();
  return <div className="appearance-controls"><ThemePaletteSelect palette={appearance.palette} onPaletteChange={(palette) => changeAppearance({ palette })} /></div>;
}
