import type { ComponentPropsWithRef } from 'react';
import { FieldMessages, useFieldDescription, type FieldText } from './field.js';

export type TextInputProps = ComponentPropsWithRef<'input'> & FieldText;

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
  const { inputId, hintId, errorId, description } = useFieldDescription(id, describedBy, hint, error);

  return (
    <div className="uik-field">
      <label htmlFor={inputId}>{label}</label>
      <input
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
