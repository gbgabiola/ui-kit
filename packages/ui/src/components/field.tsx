import { useId } from 'react';

export interface FieldText {
  label: string;
  hint?: string;
  error?: string;
}

export function useFieldDescription(
  id: string | undefined,
  describedBy: string | undefined,
  hint: string | undefined,
  error: string | undefined,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const description = [describedBy, hint && hintId, error && errorId].filter(Boolean).join(' ');
  return { inputId, hintId, errorId, description: description || undefined };
}

export function FieldMessages({
  hint, error, hintId, errorId,
}: Pick<FieldText, 'hint' | 'error'> & { hintId: string; errorId: string }) {
  return (
    <>
      {hint && <p id={hintId} className="uik-hint">{hint}</p>}
      {error && <p id={errorId} className="uik-error">{error}</p>}
    </>
  );
}
