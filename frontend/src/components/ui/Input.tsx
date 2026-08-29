import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      leftElement,
      rightElement,
      className = '',
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
            {label}
            {required && <span className="text-brand-danger" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {(leftIcon || leftElement) && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {leftElement || leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${errorId || ''} ${hintId || ''}`.trim() || undefined}
            className={`
              w-full bg-bg-primary border rounded-xl text-text-primary
              placeholder:text-text-muted
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftIcon || leftElement ? 'pl-10' : 'pl-4'}
              ${rightIcon || rightElement ? 'pr-10' : 'pr-4'}
              py-2.5 text-sm
              ${error
                ? 'border-brand-danger focus:ring-brand-danger'
                : 'border-border-primary hover:border-border-secondary'
              }
              ${className}
            `}
            {...props}
          />
          {(rightIcon || rightElement) && (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-auto">
    {rightElement || rightIcon}
  </div>
)}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-brand-danger flex items-center gap-1" role="alert">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs text-text-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';