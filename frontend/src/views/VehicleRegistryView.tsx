import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { ExtendedVehicle } from '../data/mockData';
import {
  Truck,
  Search,
  Eye,
  Trash2,
  Download,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Star,
  Plus,
  Wrench,
  Compass,
  FileCheck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/common/StatusBadge';

export const VehicleRegistryView: React.FC = () => {
  const {
    vehicles,
    setVehicles,
    favorites,
    toggleFavorite,
    addRecentView,
    addToast,
    addLog,
    triggerAutoSave,
    autoSaveActive
  } = useApp();

  // Grid states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof ExtendedVehicle>('model');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [density, setDensity] = useState<'compact' | 'standard' | 'relaxed'>('standard');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    image: true,
    reg_number: true,
    name: true,
    type: true,
    capacity: true,
    odometer: true,
    cost: true,
    status: true,
    favorite: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Modal / Drawer states
  const [selectedVehicle, setSelectedVehicle] = useState<ExtendedVehicle | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'details' | 'maintenance' | 'trips' | 'fuel' | 'docs'>('details');

  // Bulk operation states
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Add Vehicle Form State
  const [formRegNo, setFormRegNo] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formType, setFormType] = useState('Semi-Truck');
  const [formCapacity, setFormCapacity] = useState('');
  const [formOdometer, setFormOdometer] = useState('');
  const [formCost, setFormCost] = useState('');
  const formFuelType = 'Diesel';
  const formPurchaseDate = new Date().toISOString().split('T')[0];
  const [formInsuranceExpiry, setFormInsuranceExpiry] = useState('');
  const [formStatus, setFormStatus] = useState<ExtendedVehicle['status']>('Available');
  const [formNotes, setFormNotes] = useState('');

  // Form validations
  const regNoExists = useMemo(() => {
    return vehicles.some(v => v.registration_number.toLowerCase() === formRegNo.trim().toLowerCase());
  }, [formRegNo, vehicles]);

  const isFormValid = useMemo(() => {
    return (
      formRegNo.trim() !== '' &&
      !regNoExists &&
      formModel.trim() !== '' &&
      formCapacity !== '' &&
      Number(formCapacity) > 0 &&
      formOdometer !== '' &&
      Number(formOdometer) >= 0 &&
      formCost !== '' &&
      Number(formCost) > 0 &&
      formInsuranceExpiry !== ''
    );
  }, [formRegNo, regNoExists, formModel, formCapacity, formOdometer, formCost, formInsuranceExpiry]);

  // Handle row sorting
  const handleSort = (field: keyof ExtendedVehicle) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort core telemetry dataset
  const processedVehicles = useMemo(() => {
    let result = [...vehicles];

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        v =>
          v.model.toLowerCase().includes(q) ||
          v.registration_number.toLowerCase().includes(q) ||
          v.notes.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(v => v.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'All') {
      result = result.filter(v => v.type === typeFilter);
    }

    // Sort operations
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [vehicles, searchQuery, statusFilter, typeFilter, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(processedVehicles.length / pageSize);
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedVehicles.slice(start, start + pageSize);
  }, [processedVehicles, currentPage, pageSize]);

  // Bulk actions
  const handleToggleSelectAll = () => {
    if (selectedRowIds.length === paginatedVehicles.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(paginatedVehicles.map(v => v.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedRowIds.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedRowIds.length} selected vehicles?`);
    if (!confirmDelete) return;

    setVehicles(prev => prev.filter(v => !selectedRowIds.includes(v.id)));
    addToast(`${selectedRowIds.length} vehicles deleted successfully.`, 'danger', 'Bulk Operations');
    addLog('vehicle', `Bulk deleted ${selectedRowIds.length} vehicle registrations from nodes.`, 'danger');
    setSelectedRowIds([]);
    setSelectedVehicle(null);
  };

  const handleBulkExport = () => {
    if (selectedRowIds.length === 0) return;
    addToast(`Exporting ${selectedRowIds.length} vehicle details to CSV/JSON format.`, 'success', 'Export Menu');
  };

  // Row selection details drawer
  const handleOpenDrawer = (vehicle: ExtendedVehicle) => {
    setSelectedVehicle(vehicle);
    setActiveDrawerTab('details');
    addRecentView(vehicle.id, 'vehicle', vehicle.model);
  };

  // Add Vehicle Submit handler
  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    triggerAutoSave();
    
    setTimeout(() => {
      const newVehicle: ExtendedVehicle = {
        id: `v_${Date.now()}`,
        registration_number: formRegNo.trim().toUpperCase(),
        model: formModel.trim(),
        type: formType,
        max_load_capacity: Number(formCapacity),
        odometer: Number(formOdometer),
        acquisition_cost: Number(formCost),
        status: formStatus,
        fuel_type: formFuelType,
        purchase_date: formPurchaseDate,
        insurance_expiry: formInsuranceExpiry,
        photo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop&q=60',
        notes: formNotes,
        region: 'North-East',
        timeline: [{ id: `t_${Date.now()}`, date: new Date().toISOString().split('T')[0], event: 'Vehicle deployed and added to active registry.', type: 'success' }],
        maintenance_history: [],
        trip_history: [],
        fuel_statistics: { avg_mpg: 8.0, current_level: 100, monthly_cost: 0 }
      };

      setVehicles(prev => [newVehicle, ...prev]);
      addToast(`Vehicle ${formModel} registry entry created.`, 'success');
      addLog('vehicle', `Registered new vehicle: ${formModel} (${formRegNo})`, 'success');
      setIsAddModalOpen(false);

      // Reset form variables
      setFormRegNo('');
      setFormModel('');
      setFormCapacity('');
      setFormOdometer('');
      setFormCost('');
      setFormNotes('');
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
            <span className="text-white/60">Vehicle Registrations</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Vehicle Registry</h1>
          <p className="text-xs text-white/50 font-medium mt-0.5">
            Configure, deploy, and audit assets across all regional operations sectors
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Registry'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Deploy Vehicle
          </Button>
        </div>
      </div>

      {/* Grid Configuration Toolbar */}
      <Card variant="outlined" padding="md" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Type filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <Input
            placeholder="Search by model or reg number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="max-w-sm min-w-[200px] flex-1"
          />

          <Select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Vehicle Types' },
              { value: 'Semi-Truck', label: 'Semi-Truck' },
              { value: 'Box Truck', label: 'Box Truck' },
              { value: 'Cargo Van', label: 'Cargo Van' }
            ]}
            className="w-auto min-w-[180px]"
          />

          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Available', label: 'Available' },
              { value: 'On Trip', label: 'On Trip' },
              { value: 'In Shop', label: 'In Shop' },
              { value: 'Retired', label: 'Retired' }
            ]}
            className="w-auto min-w-[180px]"
          />
        </div>

        {/* Visibility, density config */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Columns Visibility dropdown */}
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

          {/* Density Selector */}
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
              {selectedRowIds.length} vehicle registries selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleBulkExport}
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

      {/* Registry Grid Table */}
      <Card variant="elevated" padding="none" className="overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedVehicles.length > 0 && selectedRowIds.length === paginatedVehicles.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-bg-tertiary text-brand-primary bg-bg-primary"
                  />
                </th>
                
                {visibleColumns.image && <th className="p-4 text-xs font-bold text-white/40 uppercase">Photo</th>}
                
                {visibleColumns.reg_number && (
                  <th
                    onClick={() => handleSort('registration_number')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Reg Number {sortField === 'registration_number' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.name && (
                  <th
                    onClick={() => handleSort('model')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Vehicle Name {sortField === 'model' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.type && (
                  <th
                    onClick={() => handleSort('type')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Type {sortField === 'type' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.capacity && (
                  <th
                    onClick={() => handleSort('max_load_capacity')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Capacity {sortField === 'max_load_capacity' && (sortDirection === 'asc' ? '▲' : '▼')}
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

                {visibleColumns.cost && (
                  <th
                    onClick={() => handleSort('acquisition_cost')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Acquisition Cost {sortField === 'acquisition_cost' && (sortDirection === 'asc' ? '▲' : '▼')}
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

                {visibleColumns.favorite && <th className="p-4 text-xs font-bold text-white/40 uppercase text-center">Fav</th>}
                <th className="p-4 text-xs font-bold text-white/40 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.length > 0 ? (
                paginatedVehicles.map((vehicle) => {
                  const isSelected = selectedRowIds.includes(vehicle.id);
                  const isFav = favorites.includes(vehicle.id);
                  
                  // Row density spacing calculation
                  const paddingClass =
                    density === 'compact'
                      ? 'py-2 px-4'
                      : density === 'relaxed'
                      ? 'py-5 px-4'
                      : 'py-3.5 px-4';

                  return (
                    <tr
                      key={vehicle.id}
                      onClick={() => handleOpenDrawer(vehicle)}
                      className={`border-b border-white/5 transition-all hover:bg-white/2 cursor-pointer group ${
                        isSelected ? 'bg-gradient-to-r from-brand-primary/5 to-transparent' : ''
                      }`}
                    >
                      {/* Bulk Select check */}
                      <td className={paddingClass} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(vehicle.id)}
                          className="rounded border-bg-tertiary text-brand-primary bg-bg-primary"
                        />
                      </td>

                      {/* Photo */}
                      {visibleColumns.image && (
                        <td className={paddingClass}>
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/5 shrink-0 flex items-center justify-center">
                            {vehicle.photo ? (
                              <img src={vehicle.photo} alt={vehicle.model} className="w-full h-full object-cover" />
                            ) : (
                              <Truck className="w-5 h-5 text-white/30" />
                            )}
                          </div>
                        </td>
                      )}

                      {/* Reg Number */}
                      {visibleColumns.reg_number && (
                        <td className={`${paddingClass} font-mono font-bold text-white text-xs`}>
                          {vehicle.registration_number}
                        </td>
                      )}

                      {/* Model Name */}
                      {visibleColumns.name && (
                        <td className={`${paddingClass} text-xs font-semibold text-white`}>
                          {vehicle.model}
                        </td>
                      )}

                      {/* Classification Type */}
                      {visibleColumns.type && (
                        <td className={`${paddingClass} text-xs text-white/60 font-semibold`}>
                          {vehicle.type}
                        </td>
                      )}

                      {/* Max capacity weight */}
                      {visibleColumns.capacity && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          {vehicle.max_load_capacity.toLocaleString()} lbs
                        </td>
                      )}

                      {/* Mileage */}
                      {visibleColumns.odometer && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          {vehicle.odometer.toLocaleString()} mi
                        </td>
                      )}

                      {/* Cost */}
                      {visibleColumns.cost && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          ₹{vehicle.acquisition_cost.toLocaleString('en-IN')}
                        </td>
                      )}

                      {/* Status */}
                      {visibleColumns.status && (
                        <td className={paddingClass}>
                          <StatusBadge status={vehicle.status} size="sm" dot />
                        </td>
                      )}

                      {/* Favorite Toggle */}
                      {visibleColumns.favorite && (
                        <td className={paddingClass} onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => toggleFavorite(vehicle.id)}>
                            <Star className={`w-4 h-4 ${isFav ? 'text-brand-primary fill-brand-primary' : 'text-white/20'}`} />
                          </Button>
                        </td>
                      )}

                      {/* Actions Column */}
                      <td className={paddingClass} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDrawer(vehicle)} aria-label="Quick Audit">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const confirmDelete = window.confirm(`Delete vehicle ${vehicle.model}?`);
                              if (confirmDelete) {
                                setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
                                addToast('Vehicle deleted.', 'danger');
                                addLog('vehicle', `Deleted vehicle ${vehicle.model}`, 'danger');
                              }
                            }}
                            aria-label="Remove registration"
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
                  <td colSpan={11} className="py-12 text-center text-white/30 text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <Truck className="w-12 h-12 text-white/10" />
                      <p className="font-bold">No Vehicle Records Found</p>
                      <p className="text-xs">Adjust your telemetry filter fields or deploy a new asset.</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All');
                          setTypeFilter('All');
                        }}
                      >
                        Reset Table Filters
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
              Showing {processedVehicles.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, processedVehicles.length)} of {processedVehicles.length} vehicles
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

      {/* Right Drawer Slide-out for vehicle details */}
      {selectedVehicle && (
        <div className="fixed inset-y-0 right-0 w-full max-w-lg z-50 bg-bg-secondary border-l border-white/10 shadow-2xl flex flex-col animate-slide-in">
          {/* Drawer Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{selectedVehicle.model}</h3>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">{selectedVehicle.registration_number}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedVehicle(null)}
              className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Tabs */}
          <div className="flex items-center border-b border-white/5 bg-black/10 p-1 px-4 overflow-x-auto scrollbar-none shrink-0">
            {(['details', 'maintenance', 'trips', 'fuel', 'docs'] as const).map(tab => (
              <Button
                key={tab}
                variant={activeDrawerTab === tab ? 'primary' : 'ghost'}
                size="sm"
                className="px-3 py-2 rounded-lg text-xs font-bold uppercase shrink-0"
                onClick={() => setActiveDrawerTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Drawer Body Scroll panel */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* TAB CONTENT: DETAILS */}
            {activeDrawerTab === 'details' && (
              <div className="space-y-5 animate-fade-in text-xs">
                {/* Photo frame */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                  <img src={selectedVehicle.photo} alt={selectedVehicle.model} className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white border border-white/10 rounded-full">
                    {selectedVehicle.region} Sector
                  </span>
                </div>

                {/* Primary specs list */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                    <p className="text-white/40 uppercase text-[9px] font-bold">Acquisition cost</p>
                    <p className="text-base font-bold text-white mt-1">₹{selectedVehicle.acquisition_cost.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                    <p className="text-white/40 uppercase text-[9px] font-bold">Odometer mileage</p>
                    <p className="text-base font-bold text-white mt-1">{selectedVehicle.odometer.toLocaleString()} mi</p>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                    <p className="text-white/40 uppercase text-[9px] font-bold">Max Load Capacity</p>
                    <p className="text-base font-bold text-white mt-1">{selectedVehicle.max_load_capacity.toLocaleString()} lbs</p>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                    <p className="text-white/40 uppercase text-[9px] font-bold">Fuel configuration</p>
                    <p className="text-base font-bold text-white mt-1">{selectedVehicle.fuel_type}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3 pt-3">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Operational Audit timeline</p>
                  <div className="space-y-3.5 border-l border-white/5 pl-4 ml-1">
                    {selectedVehicle.timeline.map((event) => (
                      <div key={event.id} className="relative space-y-1">
                        <span className="absolute -left-[20px] top-1.5 w-2 h-2 rounded-full bg-brand-primary" />
                        <p className="font-semibold text-white/80">{event.event}</p>
                        <p className="text-[10px] text-white/40 font-mono">{event.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MAINTENANCE */}
            {activeDrawerTab === 'maintenance' && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-white text-sm">Service History Records</h4>
                  <Button variant="ghost" size="sm" leftIcon={<Wrench className="w-3.5 h-3.5" />} onClick={() => addToast('Simulating: Create workshop task order.', 'info')}>
                    Create Service Ticket
                  </Button>
                </div>

                {selectedVehicle.maintenance_history.length > 0 ? (
                  selectedVehicle.maintenance_history.map((record) => (
                    <div key={record.id} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between font-semibold">
                        <span className="text-white text-xs">{record.type}</span>
                        <span className="text-brand-warning font-mono">₹{record.cost}</span>
                      </div>
                      <p className="text-white/60 text-[11px] leading-relaxed">{record.notes}</p>
                      <p className="text-[9px] text-white/40 font-mono">{record.date}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-white/30 space-y-2">
                    <Wrench className="w-8 h-8 text-white/10 mx-auto" />
                    <p className="font-semibold">No Maintenance History</p>
                    <p className="text-[11px]">No active work tickets or shop logs associated with this asset.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: TRIPS */}
            {activeDrawerTab === 'trips' && (
              <div className="space-y-4 animate-fade-in text-xs">
                <h4 className="font-bold text-white text-sm">Asset Dispatch Log</h4>

                {selectedVehicle.trip_history.length > 0 ? (
                  selectedVehicle.trip_history.map((trip) => (
                    <div key={trip.id} className="p-4 bg-white/2 border border-bg-tertiary rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-white/90">{trip.route}</p>
                        <p className="text-[10px] text-white/40">Driver: {trip.driver}</p>
                        <p className="text-[9px] text-white/30 font-mono">{trip.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="success" size="sm">{trip.status}</Badge>
                        <p className="text-[10px] font-mono text-white/50 mt-1">{trip.distance} mi</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-white/30 space-y-2">
                    <Compass className="w-8 h-8 text-white/10 mx-auto" />
                    <p className="font-semibold">No Historic Dispatches</p>
                    <p className="text-[11px]">No past cargo loops mapped to this telemetry registry node.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: FUEL */}
            {activeDrawerTab === 'fuel' && (
              <div className="space-y-5 animate-fade-in text-xs">
                <h4 className="font-bold text-white text-sm">Fuel Economics & Efficiency</h4>
                <div className="grid grid-cols-3 gap-3.5">
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-center">
                    <p className="text-[9px] font-bold text-white/40 uppercase">Average Economy</p>
                    <p className="text-base font-bold text-white mt-1">{selectedVehicle.fuel_statistics.avg_mpg} MPG</p>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-center">
                    <p className="text-[9px] font-bold text-white/40 uppercase">Tank Capacity</p>
                    <p className="text-base font-bold text-white mt-1">{selectedVehicle.fuel_statistics.current_level}%</p>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-center">
                    <p className="text-[9px] font-bold text-white/40 uppercase">Monthly Fuel Exp</p>
                    <p className="text-base font-bold text-white mt-1">₹{selectedVehicle.fuel_statistics.monthly_cost}</p>
                  </div>
                </div>

                <div className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-2">
                  <p className="font-bold text-white">Efficiency Diagnostics</p>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Based on standard operating limits, this truck is running within normal parameters. Odometer logs suggest clean injection nozzles and stable differential ratios.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DOCS */}
            {activeDrawerTab === 'docs' && (
              <div className="space-y-4 animate-fade-in text-xs">
                <h4 className="font-bold text-white text-sm">Documentation Compliance Checklist</h4>
                <div className="space-y-2">
                  <div className="p-3.5 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-brand-success" />
                      <div>
                        <p className="font-semibold text-white">Vehicle Registration Certificate (RC)</p>
                        <p className="text-[10px] text-white/40">Status: Verified node sync</p>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-brand-success" />
                  </div>

                  <div className="p-3.5 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-brand-success" />
                      <div>
                        <p className="font-semibold text-white">Commercial Fleet Insurance</p>
                        <p className="text-[10px] text-white/40">Expires: {selectedVehicle.insurance_expiry}</p>
                      </div>
                    </div>
                    {new Date(selectedVehicle.insurance_expiry) < new Date('2026-08-01') ? (
                      <AlertTriangle className="w-5 h-5 text-brand-warning" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-brand-success" />
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-5 border-t border-white/5 flex gap-2.5 bg-black/15 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toggleFavorite(selectedVehicle.id);
              }}
            >
              Toggle Favorite
            </Button>
            
            <Button
              className="flex-1"
              size="sm"
              onClick={() => {
                const statusOrder: ExtendedVehicle['status'][] = ['Available', 'On Trip', 'In Shop', 'Retired'];
                const nextIdx = (statusOrder.indexOf(selectedVehicle.status) + 1) % statusOrder.length;
                const nextStatus = statusOrder[nextIdx];
                
                setVehicles(prev =>
                  prev.map(v => (v.id === selectedVehicle.id ? { ...v, status: nextStatus } : v))
                );
                setSelectedVehicle(prev => prev ? { ...prev, status: nextStatus } : null);
                addToast(`Vehicle status changed to ${nextStatus}`, 'info');
                addLog('vehicle', `Altered state of ${selectedVehicle.model} to ${nextStatus}`, 'info');
              }}
            >
              Cycle Status State
            </Button>
          </div>
        </div>
      )}

      {/* Deploy Vehicle Form Modal popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl overflow-hidden bg-bg-secondary border border-white/10 shadow-2xl rounded-2xl flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Deploy Fleet Asset</h3>
                <p className="text-[10px] text-white/50 font-medium">Add new telemetry logging node to TransitOps registry</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body form */}
            <form onSubmit={handleAddVehicleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[450px]">
              
              {/* Image upload simulator */}
              <div className="p-4 border border-dashed border-white/10 rounded-xl text-center space-y-1.5 bg-black/10">
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center mx-auto text-white/40">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="text-xs text-white/60">Upload High-Res Vehicle Photo</div>
                <div className="text-[10px] text-white/30">Drag-and-drop or select JPG, PNG (Max 5MB)</div>
              </div>

              {/* Grid 2-cols */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Reg number with validation warnings */}
                <div className="space-y-1">
                  <label className="font-semibold text-white/60">Registration Number*</label>
                  <Input
                    required
                    placeholder="e.g. TX-409-BOX"
                    value={formRegNo}
                    onChange={e => setFormRegNo(e.target.value)}
                    error={regNoExists ? 'Registration number must be unique.' : undefined}
                    className={regNoExists ? 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger/20' : ''}
                  />
                </div>

                {/* Model name */}
                <div className="space-y-1">
                  <label className="font-semibold text-white/60">Vehicle Name*</label>
                  <Input
                    required
                    placeholder="e.g. Volvo FH16 2024"
                    value={formModel}
                    onChange={e => setFormModel(e.target.value)}
                  />
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <label className="font-semibold text-white/60">Capacity Limit (lbs)*</label>
                  <Input
                    type="number"
                    required
                    placeholder="e.g. 42000"
                    value={formCapacity}
                    onChange={e => setFormCapacity(e.target.value)}
                    className="font-mono"
                  />
                </div>

                {/* Mileage Odometer */}
                <div className="space-y-1">
                  <label className="font-semibold text-white/60">Odometer Mileage (mi)*</label>
                  <Input
                    type="number"
                    required
                    placeholder="e.g. 120500"
                    value={formOdometer}
                    onChange={e => setFormOdometer(e.target.value)}
                    className="font-mono"
                  />
                </div>

                {/* Cost */}
                <div className="space-y-1">
                  <label className="font-semibold text-white/60">Acquisition Cost (₹)*</label>
                  <Input
                    type="number"
                    required
                    placeholder="e.g. 135000"
                    value={formCost}
                    onChange={e => setFormCost(e.target.value)}
                    className="font-mono"
                  />
                </div>

                {/* Insurance Date */}
                <div className="space-y-1">
                  <label className="font-semibold text-white/60">Insurance Expiry Date*</label>
                  <Input
                    type="date"
                    required
                    value={formInsuranceExpiry}
                    onChange={e => setFormInsuranceExpiry(e.target.value)}
                  />
                </div>

                {/* Type Selection */}
                <div className="space-y-1">
                  <label className="font-semibold text-white/60">Vehicle Class</label>
                  <Select
                    value={formType}
                    onChange={e => setFormType(e.target.value)}
                    options={[
                      { value: 'Semi-Truck', label: 'Semi-Truck' },
                      { value: 'Box Truck', label: 'Box Truck' },
                      { value: 'Cargo Van', label: 'Cargo Van' }
                    ]}
                  />
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="font-semibold text-white/60">Initial Status</label>
                  <Select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    options={[
                      { value: 'Available', label: 'Available' },
                      { value: 'On Trip', label: 'On Trip' },
                      { value: 'In Shop', label: 'In Shop' }
                    ]}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-white/60">Compliance & Registry Notes</label>
                <Textarea
                  rows={2}
                  placeholder="Notes on emissions certifications, predictive cruise limits, etc."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                />
              </div>

            </form>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/5 flex justify-between items-center bg-black/15">
              {/* Auto save indicator */}
              <div className="text-[10px] text-white/40 flex items-center gap-1.5">
                {autoSaveActive ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-brand-success animate-ping" />
                    <span>Auto-saving telemetry config...</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span>Autosave active</span>
                  </>
                )}
              </div>

              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const confirmClose = window.confirm('Discard unsaved operator profile modifications?');
                    if (confirmClose) setIsAddModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form={formRegNo ? undefined : undefined}
                  disabled={!isFormValid || autoSaveActive}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  size="sm"
                >
                  Deploy Registry Node
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};