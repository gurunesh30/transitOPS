import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', hoverable = false, className = '', children, ...props }, ref) => {
    const variants = {
      default: 'bg-bg-secondary border border-border-primary',
      elevated: 'bg-bg-elevated border border-border-primary shadow-xl',
      outlined: 'bg-transparent border-2 border-border-primary',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    };

    const hoverStyles = hoverable
      ? 'hover:border-brand-primary/50 hover:shadow-brand-primary-glow transition-all duration-200 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`
          rounded-2xl
          ${variants[variant]}
          ${paddings[padding]}
          ${hoverStyles}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>{children}</div>
);

CardHeader.displayName = 'CardHeader';

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => (
  <h3 className={`text-lg font-bold text-text-primary ${className}`} {...props}>{children}</h3>
);

CardTitle.displayName = 'CardTitle';

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className = '', children, ...props }) => (
  <p className={`text-sm text-text-secondary mt-1 ${className}`} {...props}>{children}</p>
);

CardDescription.displayName = 'CardDescription';

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={className} {...props}>{children}</div>
);

CardContent.displayName = 'CardContent';

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => (
  <div className={`mt-4 pt-4 border-t border-border-secondary flex items-center gap-3 ${className}`} {...props}>
    {children}
  </div>
);

CardFooter.displayName = 'CardFooter';