import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ children, className = '', size = 'md', shape = 'circle', ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-[10px]',
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
    };

    const shapes = {
      circle: 'rounded-full',
      square: 'rounded-xl',
    };

    return (
      <div
        ref={ref}
        className={`
          inline-flex items-center justify-center font-semibold text-white
          bg-gradient-to-br from-brand-primary to-brand-secondary
          overflow-hidden
          ${sizes[size]}
          ${shapes[shape]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <img
        ref={ref}
        className={`w-full h-full object-cover ${className}`}
        {...props}
      />
    );
  }
);

AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`w-full h-full ${className}`} {...props} />
    );
  }
);

AvatarFallback.displayName = 'AvatarFallback';