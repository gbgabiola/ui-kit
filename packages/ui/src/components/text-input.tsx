import { useId, type ComponentPropsWithRef } from 'react';

export type TextInputProps = ComponentPropsWithRef<'input'> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextInput({
  label,
  hint,
  error,
  id,
  className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...inputProps
}: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const description = [describedBy, hint && hintId, error && errorId].filter(Boolean).join(' ');

  return (
    <div className="uik-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        {...inputProps}
        id={inputId}
        className={className ? `uik-input ${className}` : 'uik-input'}
        aria-describedby={description || undefined}
        aria-invalid={error ? true : invalid}
      />
      {hint && <p id={hintId} className="uik-hint">{hint}</p>}
      {error && <p id={errorId} className="uik-error">{error}</p>}
    </div>
  );
}
