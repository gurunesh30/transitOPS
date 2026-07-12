import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, fullWidth = true, className = '', id, ...props }, ref) => {
    const inputId = id || `input_${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}_error`;
    const hintId = `${inputId}_hint`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-xl border bg-bg-primary/60 text-text-primary
              placeholder:text-text-muted transition-all duration-200
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon ? 'pr-10' : 'pr-4'}
              py-2.5 text-sm
              ${error
                ? 'border-brand-danger focus:border-brand-danger focus:ring-2 focus:ring-brand-danger/20'
                : 'border-border-primary hover:border-border-secondary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {rightIcon}
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