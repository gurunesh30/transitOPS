import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { MaintenanceLog } from '../types';
import {
  Wrench,
  Search,
  CheckCircle,
  Trash2,
  Download,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/common/StatusBadge';

export const MaintenanceView: React.FC = () => {
  const {
    maintenanceLogs,
    setMaintenanceLogs,
    vehicles,
    setVehicles,
    addToast,
    addLog,
    triggerAutoSave
  } = useApp();

  // Grid states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof MaintenanceLog>('opened_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [density, setDensity] = useState<'compact' | 'standard' | 'relaxed'>('standard');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    vehicle: true,
    issue_description: true,
    cost: true,
    status: true,
    opened_at: true,
    closed_at: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Add Maintenance Form State
  const [formVehicleId, setFormVehicleId] = useState('');
  const [formIssue, setFormIssue] = useState('');
  const [formCost, setFormCost] = useState('');

  // Form validations
  const isFormValid = useMemo(() => {
    return (
      formVehicleId !== '' &&
      formIssue.trim() !== '' &&
      formCost !== '' &&
      Number(formCost) >= 0
    );
  }, [formVehicleId, formIssue, formCost]);

  // Handle row sorting
  const handleSort = (field: keyof MaintenanceLog) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort
  const processedLogs = useMemo(() => {
    let result = [...maintenanceLogs];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        m =>
          m.id.toLowerCase().includes(q) ||
          m.issue_description.toLowerCase().includes(q) ||
          m.vehicle_id.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(m => m.status === statusFilter);
    }

    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [maintenanceLogs, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedLogs.length / pageSize);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedLogs.slice(start, start + pageSize);
  }, [processedLogs, currentPage, pageSize]);

  // Bulk actions
  const handleToggleSelectAll = () => {
    if (selectedRowIds.length === paginatedLogs.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(paginatedLogs.map(m => m.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedRowIds.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedRowIds.length} maintenance logs?`);
    if (!confirmDelete) return;

    setMaintenanceLogs(prev => prev.filter(m => !selectedRowIds.includes(m.id)));
    addToast(`${selectedRowIds.length} maintenance logs deleted.`, 'danger');
    addLog('maintenance', `Bulk deleted ${selectedRowIds.length} maintenance logs.`, 'danger');
    setSelectedRowIds([]);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    triggerAutoSave();
    
    setTimeout(() => {
      const newLog: MaintenanceLog = {
        id: `MNT-${Math.floor(1000 + Math.random() * 9000)}`,
        vehicle_id: formVehicleId,
        issue_description: formIssue.trim(),
        cost: Number(formCost),
        status: 'Open',
        opened_at: new Date().toISOString()
      };

      setMaintenanceLogs(prev => [newLog, ...prev]);
      
      // Update vehicle status
      setVehicles(prev => prev.map(v => v.id === formVehicleId ? { ...v, status: 'In Shop' } : v));
      
      addToast(`Maintenance ticket ${newLog.id} opened.`, 'success');
      addLog('maintenance', `Opened maintenance ticket for vehicle ${formVehicleId}`, 'warning');
      setIsAddModalOpen(false);

      // Reset form variables
      setFormVehicleId('');
      setFormIssue('');
      setFormCost('');
    }, 800);
  };

  const handleCloseTicket = (logId: string) => {
    const log = maintenanceLogs.find(m => m.id === logId);
    if (!log) return;
    
    setMaintenanceLogs(prev => prev.map(m => m.id === logId ? { ...m, status: 'Closed', closed_at: new Date().toISOString() } : m));
    setVehicles(prev => prev.map(v => v.id === log.vehicle_id ? { ...v, status: 'Available' } : v));
    
    addToast(`Maintenance ticket ${logId} closed.`, 'success');
    addLog('maintenance', `Closed maintenance ticket ${logId}`, 'success');
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-40 bg-bg-primary p-8 overflow-y-auto' : ''}`}>
      
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
            <span>Core Telemetry Node</span>
            <span>/</span>
            <span className="text-white/60">Maintenance</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Maintenance Center</h1>
          <p className="text-xs text-white/50 font-medium mt-0.5">
            Log repairs, track shop time, and manage service expenses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Record Maintenance
          </Button>
        </div>
      </div>

      {/* Grid Configuration Toolbar */}
      <Card variant="outlined" padding="md" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <Input
            placeholder="Search by issue or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="max-w-sm min-w-[200px] flex-1"
          />

          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Open', label: 'Open' },
              { value: 'Closed', label: 'Closed' }
            ]}
            className="w-auto min-w-[180px]"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
            >
              Columns
            </Button>
            
            {showColumnDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-bg-secondary shadow-xl p-2 z-30 space-y-1">
                <div className="text-[10px] text-white/40 font-bold px-2 py-1 border-b border-white/5 uppercase">Toggle Columns</div>
                {Object.keys(visibleColumns).map(col => (
                  <label key={col} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-xs text-white/70 hover:text-white capitalize">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={() => setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }))}
                      className="rounded border-bg-tertiary text-brand-primary bg-bg-primary"
                    />
                    <span>{col.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-0.5">
            {(['compact', 'standard', 'relaxed'] as const).map(d => (
              <Button
                key={d}
                variant={density === d ? 'primary' : 'ghost'}
                size="sm"
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase"
                onClick={() => setDensity(d)}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Sticky Bulk Action Banner */}
      {selectedRowIds.length > 0 && (
        <div className="p-3 px-5 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-white/15 rounded-2xl flex items-center justify-between animate-scale-up">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-xs font-semibold text-white">
              {selectedRowIds.length} logs selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export Selected
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={handleBulkDelete}
            >
              Delete Selected
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSelectedRowIds([])}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Grid Table */}
      <Card variant="elevated" padding="none" className="overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedLogs.length > 0 && selectedRowIds.length === paginatedLogs.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-bg-tertiary text-brand-primary bg-bg-primary"
                  />
                </th>
                
                {visibleColumns.id && (
                  <th
                    onClick={() => handleSort('id')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Ticket ID {sortField === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.vehicle && <th className="p-4 text-xs font-bold text-white/40 uppercase">Vehicle</th>}
                
                {visibleColumns.issue_description && (
                  <th
                    onClick={() => handleSort('issue_description')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Issue {sortField === 'issue_description' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.cost && (
                  <th
                    onClick={() => handleSort('cost')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Cost {sortField === 'cost' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.status && (
                  <th
                    onClick={() => handleSort('status')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.opened_at && (
                  <th
                    onClick={() => handleSort('opened_at')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Opened {sortField === 'opened_at' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.closed_at && (
                  <th
                    onClick={() => handleSort('closed_at')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Closed {sortField === 'closed_at' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                
                <th className="p-4 text-xs font-bold text-white/40 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => {
                  const isSelected = selectedRowIds.includes(log.id);
                  const paddingClass =
                    density === 'compact'
                      ? 'py-2 px-4'
                      : density === 'relaxed'
                      ? 'py-5 px-4'
                      : 'py-3.5 px-4';
                      
                  const v = vehicles.find(v => v.id === log.vehicle_id);

                  return (
                    <tr
                      key={log.id}
                      className={`border-b border-white/5 transition-all hover:bg-white/2 cursor-pointer group ${
                        isSelected ? 'bg-gradient-to-r from-brand-primary/5 to-transparent' : ''
                      }`}
                    >
                      <td className={paddingClass} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(log.id)}
                          className="rounded border-bg-tertiary text-brand-primary bg-bg-primary"
                        />
                      </td>

                      {visibleColumns.id && (
                        <td className={`${paddingClass} font-mono font-bold text-white text-xs`}>
                          {log.id}
                        </td>
                      )}
                      
                      {visibleColumns.vehicle && (
                        <td className={`${paddingClass} text-xs text-white/80 font-medium`}>
                          {v?.model || log.vehicle_id}
                        </td>
                      )}

                      {visibleColumns.issue_description && (
                        <td className={`${paddingClass} text-xs font-semibold text-white`}>
                          {log.issue_description}
                        </td>
                      )}

                      {visibleColumns.cost && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          ₹{log.cost.toLocaleString('en-IN')}
                        </td>
                      )}

                      {visibleColumns.status && (
                        <td className={paddingClass}>
                          <StatusBadge status={log.status as any} size="sm" dot />
                        </td>
                      )}
                      
                      {visibleColumns.opened_at && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          {new Date(log.opened_at).toLocaleDateString()}
                        </td>
                      )}

                      {visibleColumns.closed_at && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          {log.closed_at ? new Date(log.closed_at).toLocaleDateString() : '-'}
                        </td>
                      )}

                      <td className={paddingClass} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {log.status === 'Open' && (
                            <Button size="sm" variant="success" onClick={() => handleCloseTicket(log.id)}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Close
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const confirmDelete = window.confirm(`Delete maintenance record ${log.id}?`);
                              if (confirmDelete) {
                                setMaintenanceLogs(prev => prev.filter(t => t.id !== log.id));
                                addToast('Record deleted.', 'danger');
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-white/30 text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <Wrench className="w-12 h-12 text-white/10" />
                      <p className="font-bold">No Maintenance Records</p>
                      <p className="text-xs">Record new maintenance or adjust your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer controls & Pagination */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/2 text-xs">
          <div className="flex items-center gap-4 text-white/50">
            <span>
              Showing {processedLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, processedLogs.length)} of {processedLogs.length} logs
            </span>
            <div className="flex items-center gap-2">
              <span>View size:</span>
              <Select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                options={[
                  { value: '5', label: '5 entries' },
                  { value: '10', label: '10 entries' },
                  { value: '20', label: '20 entries' }
                ]}
                className="w-auto"
              />
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? 'primary' : 'ghost'}
                  size="sm"
                  className="px-3 py-1.5 rounded-xl border font-mono"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-bg-secondary border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-brand-primary" />
                Record Maintenance
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form id="add-maint-form" onSubmit={handleAddSubmit} className="space-y-5 text-sm">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Vehicle <span className="text-brand-danger">*</span></label>
                  <Select
                    value={formVehicleId}
                    onChange={e => setFormVehicleId(e.target.value)}
                    required
                    options={[
                      { value: '', label: 'Select Vehicle' },
                      ...vehicles.map(v => ({ value: v.id, label: `${v.registration_number} - ${v.model}` }))
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Issue Description <span className="text-brand-danger">*</span></label>
                  <Input placeholder="e.g., Oil change and tire rotation" value={formIssue} onChange={e => setFormIssue(e.target.value)} required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Estimated Cost (₹) <span className="text-brand-danger">*</span></label>
                  <Input type="number" min="0" placeholder="e.g., 500" value={formCost} onChange={e => setFormCost(e.target.value)} required />
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-white/5 flex items-center justify-end gap-3 bg-black/20">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" form="add-maint-form" disabled={!isFormValid}>
                Record Maintenance
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
