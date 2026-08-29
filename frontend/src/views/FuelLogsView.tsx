import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { FuelLog } from '../types';
import {
  Fuel,
  Search,
  Trash2,
  Download,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Plus,
  TrendingDown,
  TrendingUp,
  IndianRupee,
  Droplets
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';

export const FuelLogsView: React.FC = () => {
  const {
    fuelLogs,
    setFuelLogs,
    vehicles,
    addToast,
    addLog,
    triggerAutoSave
  } = useApp();

  // Grid states
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof FuelLog>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [density, setDensity] = useState<'compact' | 'standard' | 'relaxed'>('standard');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    vehicle: true,
    date: true,
    liters: true,
    cost: true,
    odometer: true,
    efficiency: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Add Fuel Log Form State
  const [formVehicleId, setFormVehicleId] = useState('');
  const [formLiters, setFormLiters] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formOdometer, setFormOdometer] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Form validations
  const isFormValid = useMemo(() => {
    return (
      formVehicleId !== '' &&
      formLiters !== '' &&
      Number(formLiters) > 0 &&
      formCost !== '' &&
      Number(formCost) >= 0 &&
      formOdometer !== '' &&
      Number(formOdometer) >= 0 &&
      formDate !== ''
    );
  }, [formVehicleId, formLiters, formCost, formOdometer, formDate]);

  // Handle row sorting
  const handleSort = (field: keyof FuelLog) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort
  const processedLogs = useMemo(() => {
    let result = [...fuelLogs];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        f =>
          f.id.toLowerCase().includes(q) ||
          f.vehicle_id.toLowerCase().includes(q)
      );
    }

    if (vehicleFilter !== 'All') {
      result = result.filter(f => f.vehicle_id === vehicleFilter);
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
  }, [fuelLogs, searchQuery, vehicleFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedLogs.length / pageSize);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedLogs.slice(start, start + pageSize);
  }, [processedLogs, currentPage, pageSize]);

  // Summary stats
  const totalLiters = fuelLogs.reduce((acc, f) => acc + f.liters, 0);
  const totalCost = fuelLogs.reduce((acc, f) => acc + f.cost, 0);
  const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

  // Bulk actions
  const handleToggleSelectAll = () => {
    if (selectedRowIds.length === paginatedLogs.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(paginatedLogs.map(f => f.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedRowIds.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedRowIds.length} fuel logs?`);
    if (!confirmDelete) return;

    setFuelLogs(prev => prev.filter(f => !selectedRowIds.includes(f.id)));
    addToast(`${selectedRowIds.length} fuel logs deleted.`, 'danger');
    addLog('vehicle', `Bulk deleted ${selectedRowIds.length} fuel records.`, 'danger');
    setSelectedRowIds([]);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    triggerAutoSave();

    setTimeout(() => {
      const newLog: FuelLog = {
        id: `FUEL-${Math.floor(1000 + Math.random() * 9000)}`,
        vehicle_id: formVehicleId,
        liters: Number(formLiters),
        cost: Number(formCost),
        date: new Date(formDate).toISOString(),
        odometer: Number(formOdometer)
      };

      setFuelLogs(prev => [newLog, ...prev]);
      addToast(`Fuel log ${newLog.id} recorded.`, 'success');
      addLog('vehicle', `Recorded fuel fill for vehicle ${formVehicleId}`, 'info');
      setIsAddModalOpen(false);

      // Reset form variables
      setFormVehicleId('');
      setFormLiters('');
      setFormCost('');
      setFormOdometer('');
      setFormDate(new Date().toISOString().split('T')[0]);
    }, 800);
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-40 bg-bg-primary p-8 overflow-y-auto' : ''}`}>

      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
            <span>Core Telemetry Node</span>
            <span>/</span>
            <span className="text-white/60">Fuel Logs</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Fuel Logs</h1>
          <p className="text-xs text-white/50 font-medium mt-0.5">
            Track fuel consumption, costs, and efficiency across the fleet
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
            Log Fuel Fill
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-bg-secondary border border-white/5 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/20 shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold">Total Fuel Used</p>
            <p className="text-2xl font-black text-white mt-0.5">{totalLiters.toLocaleString()} <span className="text-sm font-semibold text-white/50">L</span></p>
            <p className="text-[10px] text-white/40 mt-0.5">across all vehicles</p>
          </div>
        </div>

        <div className="p-4 bg-bg-secondary border border-white/5 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center border border-brand-secondary/20 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold">Total Fuel Cost</p>
            <p className="text-2xl font-black text-white mt-0.5">₹{totalCost.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-white/40 mt-0.5">cumulative expenditure</p>
          </div>
        </div>

        <div className="p-4 bg-bg-secondary border border-white/5 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-success/10 text-brand-success flex items-center justify-center border border-brand-success/20 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase font-bold">Avg Cost / Liter</p>
            <p className="text-2xl font-black text-white mt-0.5">₹{avgCostPerLiter.toFixed(2)}</p>
            <p className="text-[10px] text-white/40 mt-0.5">fleet average rate</p>
          </div>
        </div>
      </div>

      {/* Grid Configuration Toolbar */}
      <Card variant="outlined" padding="md" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <Input
            placeholder="Search by ID or vehicle..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="max-w-sm min-w-[200px] flex-1"
          />

          <Select
            value={vehicleFilter}
            onChange={e => setVehicleFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Vehicles' },
              ...vehicles.map(v => ({ value: v.id, label: `${v.registration_number} - ${v.model}` }))
            ]}
            className="w-auto min-w-[200px]"
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
                    Log ID {sortField === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.vehicle && <th className="p-4 text-xs font-bold text-white/40 uppercase">Vehicle</th>}

                {visibleColumns.date && (
                  <th
                    onClick={() => handleSort('date')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Date {sortField === 'date' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.liters && (
                  <th
                    onClick={() => handleSort('liters')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Liters {sortField === 'liters' && (sortDirection === 'asc' ? '▲' : '▼')}
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

                {visibleColumns.odometer && (
                  <th
                    onClick={() => handleSort('odometer')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Odometer {sortField === 'odometer' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.efficiency && (
                  <th className="p-4 text-xs font-bold text-white/40 uppercase">Cost/Liter</th>
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
                  const costPerLiter = log.liters > 0 ? log.cost / log.liters : 0;
                  const isHighCost = costPerLiter > 2;

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
                          <div>
                            <p className="font-semibold text-white">{v?.model || log.vehicle_id}</p>
                            <p className="text-[10px] text-white/40 font-mono">{v?.registration_number}</p>
                          </div>
                        </td>
                      )}

                      {visibleColumns.date && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          {new Date(log.date).toLocaleDateString()}
                        </td>
                      )}

                      {visibleColumns.liters && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          {log.liters.toLocaleString()} L
                        </td>
                      )}

                      {visibleColumns.cost && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          ₹{log.cost.toLocaleString('en-IN')}
                        </td>
                      )}

                      {visibleColumns.odometer && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          {log.odometer.toLocaleString()} mi
                        </td>
                      )}

                      {visibleColumns.efficiency && (
                        <td className={`${paddingClass} text-xs font-mono font-semibold`}>
                          <div className={`flex items-center gap-1 ${isHighCost ? 'text-brand-danger' : 'text-brand-success'}`}>
                            {isHighCost
                              ? <TrendingUp className="w-3 h-3" />
                              : <TrendingDown className="w-3 h-3" />
                            }
                            ₹{costPerLiter.toFixed(2)}/L
                          </div>
                        </td>
                      )}

                      <td className={paddingClass} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const confirmDelete = window.confirm(`Delete fuel log ${log.id}?`);
                              if (confirmDelete) {
                                setFuelLogs(prev => prev.filter(f => f.id !== log.id));
                                addToast('Fuel log deleted.', 'danger');
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
                      <Fuel className="w-12 h-12 text-white/10" />
                      <p className="font-bold">No Fuel Records Found</p>
                      <p className="text-xs">Log a new fuel fill or adjust your filters.</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setVehicleFilter('All');
                        }}
                      >
                        Reset Filters
                      </Button>
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
                <Fuel className="w-5 h-5 text-brand-primary" />
                Log Fuel Fill
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form id="add-fuel-form" onSubmit={handleAddSubmit} className="space-y-5 text-sm">

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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60">Liters Filled <span className="text-brand-danger">*</span></label>
                    <Input type="number" min="1" step="0.1" placeholder="e.g., 120" value={formLiters} onChange={e => setFormLiters(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60">Total Cost (₹) <span className="text-brand-danger">*</span></label>
                    <Input type="number" min="0" step="0.01" placeholder="e.g., 9200" value={formCost} onChange={e => setFormCost(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60">Odometer Reading (mi) <span className="text-brand-danger">*</span></label>
                    <Input type="number" min="0" placeholder="e.g., 142500" value={formOdometer} onChange={e => setFormOdometer(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60">Date <span className="text-brand-danger">*</span></label>
                    <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} required />
                  </div>
                </div>

                {formLiters && formCost && Number(formLiters) > 0 && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 font-mono">
                    Cost per Liter: <span className="text-white font-bold">₹{(Number(formCost) / Number(formLiters)).toFixed(2)}</span>
                  </div>
                )}

              </form>
            </div>

            <div className="p-4 border-t border-white/5 flex items-center justify-end gap-3 bg-black/20">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" form="add-fuel-form" disabled={!isFormValid}>
                Save Fuel Log
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
