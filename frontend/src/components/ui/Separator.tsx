import React from 'react';

export const Separator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
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