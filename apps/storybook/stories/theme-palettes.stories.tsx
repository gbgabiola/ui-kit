import { useState } from 'react';
import { Navbar, TextInput, ThemePaletteSelect, ThemeToggle, type Theme, type ThemePalette } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

function PaletteExample() {
  const [theme, setTheme] = useState<Theme>('light');
  const [palette, setPalette] = useState<ThemePalette>('classic');

  return (
    <div className="uik-theme" data-theme={theme} data-palette={palette}>
      <Navbar
        brand="Palette preview"
        links={[{ href: '#preview', label: 'Preview', current: true }]}
        actions={<ThemeToggle theme={theme} onThemeChange={setTheme} />}
      />
      <div id="preview" style={{ display: 'grid', gap: '1rem', maxWidth: '24rem', padding: '1rem' }}>
        <ThemePaletteSelect palette={palette} onPaletteChange={setPalette} />
        <TextInput label="Email" type="email" hint="Palette colors apply to inputs and navigation too." />
      </div>
    </div>
  );
}

const meta = {
  component: PaletteExample,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PaletteExample>;

export default meta;
export const Playground: StoryObj<typeof meta> = {};
