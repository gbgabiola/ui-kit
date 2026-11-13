export type Theme = 'light' | 'dark';

export interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  disabled?: boolean;
  variant?: 'pill' | 'icon';
}

export function ThemeToggle({
  theme,
  onThemeChange,
  disabled,
  variant = 'pill',
}: ThemeToggleProps) {
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      className="uik-button uik-theme-toggle"
      data-variant={variant}
      aria-label="Dark mode"
      aria-pressed={dark}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      disabled={disabled}
      onClick={() => onThemeChange(dark ? 'light' : 'dark')}
    >
      <svg
        className="uik-theme-sun"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </svg>
      <svg
        className="uik-theme-moon"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      >
        <path d="M20.5 15A8.5 8.5 0 0 1 9 3.5 8.5 8.5 0 1 0 20.5 15Z" />
      </svg>
    </button>
  );
}
