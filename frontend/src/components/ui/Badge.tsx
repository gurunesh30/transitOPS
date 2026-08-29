import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary'
  | 'neutral'
  | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  dotColor?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-bg-tertiary text-text-secondary border border-border-primary',
  success: 'bg-brand-success/15 text-brand-success border border-brand-success/20',
  warning: 'bg-brand-warning/15 text-brand-warning border border-brand-warning/20',
  danger: 'bg-brand-danger/15 text-brand-danger border border-brand-danger/20',
  info: 'bg-brand-info/15 text-brand-info border border-brand-info/20',
  primary: 'bg-brand-primary/15 text-brand-primary border border-brand-primary/20',
  neutral: 'bg-bg-tertiary text-text-muted border border-border-primary',
  outline: 'bg-transparent text-text-secondary border border-border-primary',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', dot = false, dotColor, className = '', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5
          font-semibold rounded-full border
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: dotColor || 'currentColor' }}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, size = 'md', className = '', ...props }, ref) => {
    const statusVariants: Record<string, BadgeVariant> = {
      available: 'success',
      'on trip': 'info',
      'in shop': 'warning',
      retired: 'neutral',
      'off duty': 'neutral',
      suspended: 'danger',
      draft: 'primary',
      dispatched: 'info',
      completed: 'success',
      cancelled: 'danger',
      active: 'success',
      pending: 'warning',
      expired: 'danger',
      expiring: 'warning',
      valid: 'success',
      missing: 'danger',
    };

    const normalizedStatus = status.toLowerCase();
    const variant = statusVariants[normalizedStatus] || 'default';

    return (
      <Badge
        ref={ref}
        variant={variant}
        size={size}
        className={className}
        {...props}
      >
        {status}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';