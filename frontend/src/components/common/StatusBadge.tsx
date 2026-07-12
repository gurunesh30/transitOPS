import React from 'react';

type StatusType = 'Available' | 'On Trip' | 'In Shop' | 'Retired' | 'Off Duty' | 'Suspended' | 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
  const mapping: Record<StatusType, string> = {
    Available: 'bg-green-100 text-green-800 border-green-200',
    'On Trip': 'bg-blue-100 text-blue-800 border-blue-200',
    'In Shop': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Retired: 'bg-slate-200 text-slate-800 border-slate-300',
    'Off Duty': 'bg-slate-100 text-slate-600 border-slate-200',
    Suspended: 'bg-red-100 text-red-800 border-red-200',
    Draft: 'bg-purple-100 text-purple-800 border-purple-200',
    Dispatched: 'bg-sky-100 text-sky-800 border-sky-200',
    Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${mapping[status] || 'bg-slate-100'}`}>
      {status}
    </span>
  );
};