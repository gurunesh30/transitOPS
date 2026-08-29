import React from 'react';

type StatusType =
  | 'Available'
  | 'On Trip'
  | 'In Shop'
  | 'Retired'
  | 'Off Duty'
  | 'Suspended'
  | 'Draft'
  | 'Dispatched'
  | 'Completed'
  | 'Cancelled';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  dot = false,
}) => {
  const variantMap: Record<StatusType, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    Available: 'success',
    'On Trip': 'info',
    'In Shop': 'warning',
    Retired: 'default',
    'Off Duty': 'default',
    Suspended: 'danger',
    Draft: 'info',
    Dispatched: 'info',
    Completed: 'success',
    Cancelled: 'danger',
  };

  const labelMap: Record<StatusType, string> = {
    Available: 'Available',
    'On Trip': 'On Trip',
    'In Shop': 'In Shop',
    Retired: 'Retired',
    'Off Duty': 'Off Duty',
    Suspended: 'Suspended',
    Draft: 'Draft',
    Dispatched: 'Dispatched',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
  };

  const variant = variantMap[status] || 'default';
  const label = labelMap[status] || status;

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border
        ${sizes[size]}
      `}
      data-status={status}
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
          `}
          aria-hidden="true"
        />
      )}
      <span className={`
        ${variant === 'success' && 'bg-brand-success/15 text-brand-success border-brand-success/20'}
        ${variant === 'warning' && 'bg-brand-warning/15 text-brand-warning border-brand-warning/20'}
        ${variant === 'danger' && 'bg-brand-danger/15 text-brand-danger border-brand-danger/20'}
        ${variant === 'info' && 'bg-brand-info/15 text-brand-info border-brand-info/20'}
        ${variant === 'default' && 'bg-bg-tertiary text-text-secondary border-border-primary'}
      `}>
        {label}
      </span>
    </span>
  );
};