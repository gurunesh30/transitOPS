import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, disabled, required, ...props }, ref) => {
    const textareaId = id || `textarea-${React.useId()}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const hintId = hint ? `${textareaId}-hint` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
            {label}
            {required && <span className="text-brand-danger" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${errorId || ''} ${hintId || ''}`.trim() || undefined}
          className={`
            w-full bg-bg-primary border rounded-xl text-text-primary resize-none
            placeholder:text-text-muted
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            p-3 text-sm min-h-[80px]
            ${error
              ? 'border-brand-danger focus:ring-brand-danger'
              : 'border-border-primary hover:border-border-secondary'
            }
            ${className}
          `}
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