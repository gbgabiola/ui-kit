import type { ComponentPropsWithRef } from 'react';
import { FieldMessages, useFieldDescription, type FieldText } from './field.js';

export type SelectProps = ComponentPropsWithRef<'select'> & FieldText;

export function Select({
  label,
  hint,
  error,
  id,
  className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...inputProps
}: SelectProps) {
  const { inputId, hintId, errorId, description } = useFieldDescription(id, describedBy, hint, error);

  return (
    <div className="uik-field">
      <label htmlFor={inputId}>{label}</label>
      <select
        {...inputProps}
        id={inputId}
        className={className ? `uik-input ${className}` : 'uik-input'}
        aria-describedby={description}
        aria-invalid={error ? true : invalid}
      />
      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}
