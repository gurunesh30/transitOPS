import React, { forwardRef } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, placeholder, options, fullWidth = true, className = '', id, ...props }, ref) => {
    const selectId = id || `select_${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${selectId}_error`;
    const hintId = `${selectId}_hint`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full appearance-none rounded-xl border bg-bg-primary/60 text-text-primary
              pl-4 pr-10 py-2.5 text-sm
              ${error
                ? 'border-brand-danger focus:border-brand-danger focus:ring-2 focus:ring-brand-danger/20'
                : 'border-border-primary hover:border-border-secondary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
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

Select.displayName = 'Select';