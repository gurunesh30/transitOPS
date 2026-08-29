import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className = '', size = 'md', required, ...props }, ref) => {
    const sizes = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    return (
      <label
        ref={ref}
        className={`
          block font-medium text-text-secondary
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {children}
        {required && <span className="text-brand-danger ml-0.5" aria-hidden="true">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';