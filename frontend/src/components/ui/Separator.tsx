import React from 'react';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Separator: React.FC<SeparatorProps> = ({
  className = '',
  orientation = 'horizontal',
  ...props
}) => {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`
        ${orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px'}
        bg-border-secondary
        ${className}
      `}
      {...props}
    />
  );
};