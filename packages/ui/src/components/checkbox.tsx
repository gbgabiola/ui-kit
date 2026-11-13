import type { ComponentPropsWithRef } from 'react';
import { FieldMessages, useFieldDescription, type FieldText } from './field.js';

export type CheckboxProps = Omit<ComponentPropsWithRef<'input'>, 'type'> & FieldText;

export function Checkbox({
  label,
  hint,
  error,
  id,
  className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  ...inputProps
}: CheckboxProps) {
  const { inputId, hintId, errorId, description } = useFieldDescription(id, describedBy, hint, error);

  return (
    <div className="uik-field">
      <div className="uik-checkbox-row">
        <input
          {...inputProps}
          type="checkbox"
          id={inputId}
          className={className ? `uik-checkbox ${className}` : 'uik-checkbox'}
          aria-describedby={description}
          aria-invalid={error ? true : invalid}
        />
        <label htmlFor={inputId}>{label}</label>
      </div>
      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}
