const paletteOptions = [
  { value: 'classic', label: 'Classic' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'teal', label: 'Teal' },
  { value: 'forest', label: 'Forest' },
  { value: 'plum', label: 'Plum' },
  { value: 'walnut', label: 'Walnut' },
  { value: 'ember', label: 'Ember' },
  { value: 'crimson', label: 'Crimson' },
] as const;

export type ThemePalette = (typeof paletteOptions)[number]['value'];

export interface ThemePaletteSelectProps {
  palette: ThemePalette;
  onPaletteChange: (palette: ThemePalette) => void;
  label?: string;
  disabled?: boolean;
}

export function ThemePaletteSelect({
  palette,
  onPaletteChange,
  label = 'Color palette',
  disabled,
}: ThemePaletteSelectProps) {
  return (
    <label className="uik-field">
      <span className="uik-field-label">{label}</span>
      <select
        className="uik-input"
        value={palette}
        disabled={disabled}
        onChange={({ currentTarget }) => {
          const next = paletteOptions.find(({ value }) => value === currentTarget.value);
          if (next) onPaletteChange(next.value);
        }}
      >
        {paletteOptions.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}
