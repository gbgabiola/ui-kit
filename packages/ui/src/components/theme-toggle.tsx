export type Theme = 'light' | 'dark';

export interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  disabled?: boolean;
}

export function ThemeToggle({ theme, onThemeChange, disabled }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className="uik-button"
      aria-pressed={theme === 'dark'}
      disabled={disabled}
      onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
    >
      Dark mode
    </button>
  );
}
