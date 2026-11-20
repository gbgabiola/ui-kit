import type { ComponentPropsWithRef } from 'react';

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: 'primary' | 'secondary';
};

export function Button({
  variant = 'primary', type = 'button', className, children, ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={['uik-button', 'uik-action-button', className].filter(Boolean).join(' ')}
      data-variant={variant}
    >
      {children}
    </button>
  );
}
