import { useId } from 'react';

export interface ProgressBarProps {
  label: string;
  /** Omit to indicate work whose completion amount is unknown. */
  value?: number;
  /** Positive upper bound. Defaults to 100. */
  max?: number;
}

export function ProgressBar({ label, value, max = 100 }: ProgressBarProps) {
  const id = useId();
  const limit = Number.isFinite(max) && max > 0 ? max : 100;
  const progress = value !== undefined && Number.isFinite(value)
    ? Math.min(limit, Math.max(0, value))
    : undefined;

  return (
    <div className="uik-field">
      <label htmlFor={id}>{label}</label>
      <progress className="uik-progress" id={id} max={limit} value={progress} />
    </div>
  );
}
