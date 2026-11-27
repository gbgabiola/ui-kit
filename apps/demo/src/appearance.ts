import { useSyncExternalStore } from 'react';
import type { Theme, ThemePalette } from '@gbgabiola/ui';
export type Appearance = { theme: Theme; preference: Theme | 'system'; palette: ThemePalette };
export type AppearanceChange = { theme?: Theme | 'system'; palette?: ThemePalette };
declare global {
  interface Window {
    UIKitAppearance: {
      get: () => Appearance;
      set: (change: AppearanceChange) => void;
      subscribe: (callback: () => void) => () => void;
    };
  }
}
export function useAppearance() {
  return useSyncExternalStore(window.UIKitAppearance.subscribe, window.UIKitAppearance.get);
}
export const changeAppearance = (change: AppearanceChange) => window.UIKitAppearance.set(change);
