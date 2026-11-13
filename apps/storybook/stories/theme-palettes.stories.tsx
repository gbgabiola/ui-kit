import { useState } from 'react';
import { Navbar, TextInput, ThemePaletteSelect, ThemeToggle, type Theme, type ThemePalette } from '@gbgabiola/ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

function PaletteExample({
  initialTheme,
  initialPalette,
}: {
  initialTheme: Theme;
  initialPalette: ThemePalette;
}) {
  const [theme, setTheme] = useState(initialTheme);
  const [palette, setPalette] = useState(initialPalette);

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
  title: 'Examples/Theme Palettes',
  id: 'theme-palettes',
  tags: ['!autodocs'],
  component: PaletteExample,
  args: { initialTheme: 'light', initialPalette: 'classic' },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PaletteExample>;

export default meta;
export const Playground: StoryObj<typeof meta> = {
  play: async ({ canvas, userEvent }) => {
    const picker = canvas.getByRole('combobox', { name: 'Color palette' });
    const toggle = canvas.getByRole('button', { name: 'Dark mode' });
    await userEvent.selectOptions(picker, 'teal');
    await expect(picker).toHaveValue('teal');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(picker).toHaveValue('teal');
    await userEvent.click(toggle);
    await userEvent.selectOptions(picker, 'classic');
  },
};

export const DarkPalette: StoryObj<typeof meta> = {
  args: { initialTheme: 'dark', initialPalette: 'plum' },
};
