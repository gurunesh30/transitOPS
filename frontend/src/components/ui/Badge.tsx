import React, { forwardRef } from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', dot = false, className = '', children, ...props }, ref) => {
    const variants = {
      default: 'bg-bg-tertiary text-text-secondary border border-border-primary',
      success: 'bg-brand-success/15 text-brand-success border border-brand-success/20',
      warning: 'bg-brand-warning/15 text-brand-warning border border-brand-warning/20',
      danger: 'bg-brand-danger/15 text-brand-danger border border-brand-danger/20',
      info: 'bg-brand-info/15 text-brand-info border border-brand-info/20',
      outline: 'bg-transparent text-text-secondary border-2 border-border-primary',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[10px] gap-1',
      md: 'px-2.5 py-1 text-xs gap-1.5',
      lg: 'px-3 py-1.5 text-sm gap-2',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-semibold rounded-full border
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {dot && (
          <span
            className={`
              w-1.5 h-1.5 rounded-full flex-shrink-0
              ${variant === 'success' && 'bg-brand-success'}
              ${variant === 'warning' && 'bg-brand-warning'}
              ${variant === 'danger' && 'bg-brand-danger'}
              ${variant === 'info' && 'bg-brand-info'}
              ${variant === 'default' && 'bg-text-muted'}
              ${variant === 'outline' && 'bg-text-secondary'}
            `}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';