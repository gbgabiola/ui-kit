import type { ComponentPropsWithRef } from 'react';
import { FieldMessages, useFieldDescription, type FieldText } from './field.js';

export type TextareaProps = ComponentPropsWithRef<'textarea'> & FieldText;

export function Textarea({
  label,
  hint,
  error,
  id,
  className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...inputProps
}: TextareaProps) {
  const { inputId, hintId, errorId, description } = useFieldDescription(id, describedBy, hint, error);

  return (
    <div className="uik-field">
      <label htmlFor={inputId}>{label}</label>
      <textarea
        {...inputProps}
        id={inputId}
        className={className ? `uik-input uik-textarea ${className}` : 'uik-input uik-textarea'}
        aria-describedby={description}
        aria-invalid={error ? true : invalid}
      />
      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}
