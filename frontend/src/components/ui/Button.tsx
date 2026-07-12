import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-brand-primary-hover/90 shadow-lg shadow-brand-primary-glow focus-visible:ring-brand-primary',
      secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary/90 active:bg-brand-secondary focus-visible:ring-brand-secondary',
      outline: 'border-2 border-border-primary bg-transparent hover:bg-bg-tertiary active:bg-bg-tertiary focus-visible:ring-brand-primary',
      ghost: 'bg-transparent hover:bg-bg-tertiary active:bg-bg-tertiary focus-visible:ring-brand-primary',
      danger: 'bg-brand-danger text-white hover:bg-brand-danger/90 active:bg-brand-danger focus-visible:ring-brand-danger',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
      icon: 'p-2.5',
    };

    const width = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <>
            {leftIcon && !loading && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && !loading && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';