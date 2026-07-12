import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  rows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, fullWidth = true, rows = 3, className = '', id, ...props }, ref) => {
    const textareaId = id || `textarea_${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${textareaId}_error`;
    const hintId = `${textareaId}_hint`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
            w-full rounded-xl border bg-bg-primary/60 text-text-primary
            p-3.5 text-sm resize-y placeholder:text-text-muted transition-all duration-200
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

Textarea.displayName = 'Textarea';