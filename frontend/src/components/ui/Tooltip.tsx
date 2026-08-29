import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delay = 200,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (side) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }

    if (align === 'start') {
      if (side === 'top' || side === 'bottom') left = triggerRect.left;
      else top = triggerRect.top;
    } else if (align === 'end') {
      if (side === 'top' || side === 'bottom') left = triggerRect.right - tooltipRect.width;
      else top = triggerRect.bottom - tooltipRect.height;
    }

    setPosition({ top, left });
  }, [side, align]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
  };

  const handleFocus = () => setIsOpen(true);
  const handleBlur = () => setIsOpen(false);

  const triggerProps = {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };

  const tooltipContent = isOpen && createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      className={`
        fixed z-[500] px-3 py-1.5 text-xs font-medium text-text-inverse
        bg-bg-tertiary border border-border-primary rounded-lg shadow-xl
        whitespace-nowrap pointer-events-none animate-fade-in
        ${side === 'top' ? 'bottom-full mb-2' : ''}
        ${side === 'bottom' ? 'top-full mt-2' : ''}
        ${side === 'left' ? 'right-full mr-2' : ''}
        ${side === 'right' ? 'left-full ml-2' : ''}
      `}
      style={{ top: position.top, left: position.left }}
    >
      {content}
    </div>,
    document.body
  );

  return <>{React.cloneElement(children, triggerProps)}{tooltipContent}</>;
};

export const TooltipTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};