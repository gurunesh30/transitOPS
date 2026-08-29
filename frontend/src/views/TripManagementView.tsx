import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Trip } from '../types';
import {
  Route,
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
  Plus,
  MapPin
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/common/StatusBadge';

export const TripManagementView: React.FC = () => {
  const {
    trips,
    setTrips,
    vehicles,
    setVehicles,
    drivers,
    setDrivers,
    addToast,
    addLog,
    triggerAutoSave
  } = useApp();

  // Grid states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<keyof Trip>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [density, setDensity] = useState<'compact' | 'standard' | 'relaxed'>('standard');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    id: true,
    source: true,
    destination: true,
    cargo_weight: true,
    planned_distance: true,
    vehicle: true,
    driver: true,
    status: true,
    created_at: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Modal / Drawer states
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'details' | 'tracking'>('details');

  // Bulk operation states
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Add Trip Form State
  const [formSource, setFormSource] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formCargoWeight, setFormCargoWeight] = useState('');
  const [formDistance, setFormDistance] = useState('');
  const [formVehicleId, setFormVehicleId] = useState('');
  const [formDriverId, setFormDriverId] = useState('');

  // Form validations
  const selectedVehicleForForm = useMemo(() => vehicles.find(v => v.id === formVehicleId), [vehicles, formVehicleId]);
  
  const isFormValid = useMemo(() => {
    return (
      formSource.trim() !== '' &&
      formDestination.trim() !== '' &&
      formCargoWeight !== '' &&
      Number(formCargoWeight) > 0 &&
      selectedVehicleForForm && 
      Number(formCargoWeight) <= selectedVehicleForForm.max_load_capacity &&
      formDistance !== '' &&
      Number(formDistance) > 0 &&
      formVehicleId !== '' &&
      formDriverId !== ''
    );
  }, [formSource, formDestination, formCargoWeight, formDistance, formVehicleId, formDriverId, selectedVehicleForForm]);

  // Handle row sorting
  const handleSort = (field: keyof Trip) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort core telemetry dataset
  const processedTrips = useMemo(() => {
    let result = [...trips];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        t =>
          t.id.toLowerCase().includes(q) ||
          t.source.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
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
  }, [trips, searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(processedTrips.length / pageSize);
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTrips.slice(start, start + pageSize);
  }, [processedTrips, currentPage, pageSize]);

  // Bulk actions
  const handleToggleSelectAll = () => {
    if (selectedRowIds.length === paginatedTrips.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(paginatedTrips.map(t => t.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRowIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedRowIds.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedRowIds.length} selected trips?`);
    if (!confirmDelete) return;

    setTrips(prev => prev.filter(t => !selectedRowIds.includes(t.id)));
    addToast(`${selectedRowIds.length} trips deleted successfully.`, 'danger', 'Bulk Operations');
    addLog('trip', `Bulk deleted ${selectedRowIds.length} trips.`, 'danger');
    setSelectedRowIds([]);
    setSelectedTrip(null);
  };

  const handleBulkExport = () => {
    if (selectedRowIds.length === 0) return;
    addToast(`Exporting ${selectedRowIds.length} trip details to CSV/JSON format.`, 'success', 'Export Menu');
  };

  const handleOpenDrawer = (trip: Trip) => {
    setSelectedTrip(trip);
    setActiveDrawerTab('details');
  };

  const handleAddTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      if (selectedVehicleForForm && Number(formCargoWeight) > selectedVehicleForForm.max_load_capacity) {
        addToast(`Cargo weight exceeds vehicle max capacity of ${selectedVehicleForForm.max_load_capacity}`, 'danger');
      }
      return;
    }

    triggerAutoSave();
    
    setTimeout(() => {
      const newTrip: Trip = {
        id: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
        source: formSource.trim(),
        destination: formDestination.trim(),
        status: 'Draft',
        cargo_weight: Number(formCargoWeight),
        planned_distance: Number(formDistance),
        vehicle_id: formVehicleId,
        driver_id: formDriverId,
        created_at: new Date().toISOString()
      };

      setTrips(prev => [newTrip, ...prev]);
      addToast(`Trip ${newTrip.id} created successfully.`, 'success');
      addLog('trip', `Created new trip: ${newTrip.id}`, 'success');
      setIsAddModalOpen(false);

      // Reset form variables
      setFormSource('');
      setFormDestination('');
      setFormCargoWeight('');
      setFormDistance('');
      setFormVehicleId('');
      setFormDriverId('');
    }, 800);
  };

  // Status transitions
  const handleDispatchTrip = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    
    const v = vehicles.find(v => v.id === trip.vehicle_id);
    const d = drivers.find(d => d.id === trip.driver_id);
    
    if (v?.status === 'In Shop' || v?.status === 'Retired' || v?.status === 'On Trip') {
      addToast('Vehicle is not available for dispatch', 'danger');
      return;
    }
    
    if (d?.status === 'Suspended' || d?.status === 'On Trip' || d?.status === 'Off Duty') {
      addToast('Driver is not available for dispatch', 'danger');
      return;
    }

    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'Dispatched' } : t));
    setVehicles(prev => prev.map(v => v.id === trip.vehicle_id ? { ...v, status: 'On Trip' } : v));
    setDrivers(prev => prev.map(d => d.id === trip.driver_id ? { ...d, status: 'On Trip' } : d));
    
    addToast(`Trip ${tripId} has been dispatched.`, 'success');
    addLog('trip', `Dispatched trip ${tripId}`, 'success');
    setSelectedTrip(null);
  };

  const handleCompleteTrip = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'Completed', completed_at: new Date().toISOString() } : t));
    setVehicles(prev => prev.map(v => v.id === trip.vehicle_id ? { ...v, status: 'Available' } : v));
    setDrivers(prev => prev.map(d => d.id === trip.driver_id ? { ...d, status: 'Available' } : d));
    
    addToast(`Trip ${tripId} completed.`, 'success');
    addLog('trip', `Completed trip ${tripId}`, 'success');
    setSelectedTrip(null);
  };

  const handleCancelTrip = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'Cancelled' } : t));
    if (trip.status === 'Dispatched') {
      setVehicles(prev => prev.map(v => v.id === trip.vehicle_id ? { ...v, status: 'Available' } : v));
      setDrivers(prev => prev.map(d => d.id === trip.driver_id ? { ...d, status: 'Available' } : d));
    }
    
    addToast(`Trip ${tripId} cancelled.`, 'warning');
    addLog('trip', `Cancelled trip ${tripId}`, 'warning');
    setSelectedTrip(null);
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-40 bg-bg-primary p-8 overflow-y-auto' : ''}`}>
      
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
            <span>Core Telemetry Node</span>
            <span>/</span>
            <span className="text-white/60">Trip Management</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Trip Management</h1>
          <p className="text-xs text-white/50 font-medium mt-0.5">
            Create, dispatch, and track active delivery operations across the fleet network
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
            Create Trip
          </Button>
        </div>
      </div>

      {/* Grid Configuration Toolbar */}
      <Card variant="outlined" padding="md" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <Input
            placeholder="Search by ID, Source, or Destination..."
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
              { value: 'Draft', label: 'Draft' },
              { value: 'Dispatched', label: 'Dispatched' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Cancelled', label: 'Cancelled' }
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
              {selectedRowIds.length} trips selected
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

      {/* Grid Table */}
      <Card variant="elevated" padding="none" className="overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedTrips.length > 0 && selectedRowIds.length === paginatedTrips.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-bg-tertiary text-brand-primary bg-bg-primary"
                  />
                </th>
                
                {visibleColumns.id && (
                  <th
                    onClick={() => handleSort('id')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Trip ID {sortField === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.source && (
                  <th
                    onClick={() => handleSort('source')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Source {sortField === 'source' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.destination && (
                  <th
                    onClick={() => handleSort('destination')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Destination {sortField === 'destination' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.cargo_weight && (
                  <th
                    onClick={() => handleSort('cargo_weight')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Cargo Wgt {sortField === 'cargo_weight' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.planned_distance && (
                  <th
                    onClick={() => handleSort('planned_distance')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Distance {sortField === 'planned_distance' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                
                {visibleColumns.vehicle && <th className="p-4 text-xs font-bold text-white/40 uppercase">Vehicle</th>}
                {visibleColumns.driver && <th className="p-4 text-xs font-bold text-white/40 uppercase">Driver</th>}

                {visibleColumns.status && (
                  <th
                    onClick={() => handleSort('status')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Status {sortField === 'status' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}

                {visibleColumns.created_at && (
                  <th
                    onClick={() => handleSort('created_at')}
                    className="p-4 text-xs font-bold text-white/40 uppercase cursor-pointer hover:text-white transition-colors"
                  >
                    Created {sortField === 'created_at' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                )}
                
                <th className="p-4 text-xs font-bold text-white/40 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrips.length > 0 ? (
                paginatedTrips.map((trip) => {
                  const isSelected = selectedRowIds.includes(trip.id);
                  const paddingClass =
                    density === 'compact'
                      ? 'py-2 px-4'
                      : density === 'relaxed'
                      ? 'py-5 px-4'
                      : 'py-3.5 px-4';
                      
                  const v = vehicles.find(v => v.id === trip.vehicle_id);
                  const d = drivers.find(d => d.id === trip.driver_id);

                  return (
                    <tr
                      key={trip.id}
                      onClick={() => handleOpenDrawer(trip)}
                      className={`border-b border-white/5 transition-all hover:bg-white/2 cursor-pointer group ${
                        isSelected ? 'bg-gradient-to-r from-brand-primary/5 to-transparent' : ''
                      }`}
                    >
                      <td className={paddingClass} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(trip.id)}
                          className="rounded border-bg-tertiary text-brand-primary bg-bg-primary"
                        />
                      </td>

                      {visibleColumns.id && (
                        <td className={`${paddingClass} font-mono font-bold text-white text-xs`}>
                          {trip.id}
                        </td>
                      )}

                      {visibleColumns.source && (
                        <td className={`${paddingClass} text-xs font-semibold text-white`}>
                          {trip.source}
                        </td>
                      )}

                      {visibleColumns.destination && (
                        <td className={`${paddingClass} text-xs font-semibold text-white`}>
                          {trip.destination}
                        </td>
                      )}

                      {visibleColumns.cargo_weight && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          {trip.cargo_weight.toLocaleString()} lbs
                        </td>
                      )}

                      {visibleColumns.planned_distance && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          {trip.planned_distance.toLocaleString()} mi
                        </td>
                      )}
                      
                      {visibleColumns.vehicle && (
                        <td className={`${paddingClass} text-xs text-white/80 font-medium`}>
                          {v?.model || trip.vehicle_id}
                        </td>
                      )}

                      {visibleColumns.driver && (
                        <td className={`${paddingClass} text-xs text-white/80 font-medium`}>
                          {d?.name || trip.driver_id}
                        </td>
                      )}

                      {visibleColumns.status && (
                        <td className={paddingClass}>
                          <StatusBadge status={trip.status as any} size="sm" dot />
                        </td>
                      )}
                      
                      {visibleColumns.created_at && (
                        <td className={`${paddingClass} text-xs text-white/60 font-mono`}>
                          {new Date(trip.created_at).toLocaleDateString()}
                        </td>
                      )}

                      <td className={paddingClass} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDrawer(trip)} aria-label="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const confirmDelete = window.confirm(`Delete trip ${trip.id}?`);
                              if (confirmDelete) {
                                setTrips(prev => prev.filter(t => t.id !== trip.id));
                                addToast('Trip deleted.', 'danger');
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
                  <td colSpan={11} className="py-12 text-center text-white/30 text-sm">
                    <div className="flex flex-col items-center gap-3">
                      <Route className="w-12 h-12 text-white/10" />
                      <p className="font-bold">No Trips Found</p>
                      <p className="text-xs">Create a new trip or adjust your filters.</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All');
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
              Showing {processedTrips.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, processedTrips.length)} of {processedTrips.length} trips
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

      {/* Right Drawer Slide-out for Trip Details */}
      {selectedTrip && (
        <div className="fixed inset-y-0 right-0 w-full max-w-lg z-50 bg-bg-secondary border-l border-white/10 shadow-2xl flex flex-col animate-slide-in">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center border border-brand-primary/20">
                <Route className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">Trip {selectedTrip.id}</h3>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">
                  <StatusBadge status={selectedTrip.status as any} size="sm" dot />
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedTrip(null)}
              className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center border-b border-white/5 bg-black/10 p-1 px-4 overflow-x-auto scrollbar-none shrink-0">
            {(['details', 'tracking'] as const).map(tab => (
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

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeDrawerTab === 'details' && (
              <div className="space-y-5 animate-fade-in text-xs">
                
                {/* Action Buttons for State Transitions */}
                <div className="flex flex-wrap gap-2">
                  {selectedTrip.status === 'Draft' && (
                    <Button size="sm" variant="primary" onClick={() => handleDispatchTrip(selectedTrip.id)}>
                      Dispatch Trip
                    </Button>
                  )}
                  {selectedTrip.status === 'Dispatched' && (
                    <Button size="sm" variant="success" onClick={() => handleCompleteTrip(selectedTrip.id)}>
                      Mark Completed
                    </Button>
                  )}
                  {(selectedTrip.status === 'Draft' || selectedTrip.status === 'Dispatched') && (
                    <Button size="sm" variant="danger" onClick={() => handleCancelTrip(selectedTrip.id)}>
                      Cancel Trip
                    </Button>
                  )}
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center relative">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold">A</div>
                      <span className="font-semibold text-white text-center w-20">{selectedTrip.source}</span>
                    </div>
                    
                    <div className="flex-1 border-b-2 border-dashed border-white/20 mx-4 relative top-[-10px]">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-secondary px-2 text-[10px] text-white/50 font-mono">
                        {selectedTrip.planned_distance} mi
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-secondary/20 text-brand-secondary flex items-center justify-center font-bold">B</div>
                      <span className="font-semibold text-white text-center w-20">{selectedTrip.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                    <p className="text-white/40 uppercase text-[9px] font-bold">Vehicle</p>
                    <p className="text-base font-bold text-white mt-1">
                      {vehicles.find(v => v.id === selectedTrip.vehicle_id)?.model || selectedTrip.vehicle_id}
                    </p>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                    <p className="text-white/40 uppercase text-[9px] font-bold">Driver</p>
                    <p className="text-base font-bold text-white mt-1">
                      {drivers.find(d => d.id === selectedTrip.driver_id)?.name || selectedTrip.driver_id}
                    </p>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                    <p className="text-white/40 uppercase text-[9px] font-bold">Cargo Weight</p>
                    <p className="text-base font-bold text-white mt-1">{selectedTrip.cargo_weight.toLocaleString()} lbs</p>
                  </div>
                  <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                    <p className="text-white/40 uppercase text-[9px] font-bold">Created</p>
                    <p className="text-sm font-bold text-white mt-1">{new Date(selectedTrip.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

              </div>
            )}
            
            {activeDrawerTab === 'tracking' && (
              <div className="space-y-5 animate-fade-in text-xs flex flex-col items-center text-white/50 py-10">
                <MapPin className="w-12 h-12 text-white/20 mb-4" />
                <p>GPS tracking module offline for this trip.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-bg-secondary border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Route className="w-5 h-5 text-brand-primary" />
                Create New Trip
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/40 hover:text-white p-1 rounded hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="add-trip-form" onSubmit={handleAddTripSubmit} className="space-y-5 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60">Source <span className="text-brand-danger">*</span></label>
                    <Input placeholder="e.g., Chicago, IL" value={formSource} onChange={e => setFormSource(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60">Destination <span className="text-brand-danger">*</span></label>
                    <Input placeholder="e.g., Dallas, TX" value={formDestination} onChange={e => setFormDestination(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60">Planned Distance (mi) <span className="text-brand-danger">*</span></label>
                    <Input type="number" min="1" placeholder="e.g., 900" value={formDistance} onChange={e => setFormDistance(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60">Cargo Weight (lbs) <span className="text-brand-danger">*</span></label>
                    <Input type="number" min="1" placeholder="e.g., 20000" value={formCargoWeight} onChange={e => setFormCargoWeight(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60">Assign Vehicle <span className="text-brand-danger">*</span></label>
                    <Select
                      value={formVehicleId}
                      onChange={e => setFormVehicleId(e.target.value)}
                      required
                      options={[
                        { value: '', label: 'Select Available Vehicle' },
                        ...vehicles.filter(v => v.status === 'Available').map(v => ({ value: v.id, label: `${v.registration_number} - ${v.model} (${v.max_load_capacity} lbs)` }))
                      ]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60">Assign Driver <span className="text-brand-danger">*</span></label>
                    <Select
                      value={formDriverId}
                      onChange={e => setFormDriverId(e.target.value)}
                      required
                      options={[
                        { value: '', label: 'Select Available Driver' },
                        ...drivers.filter(d => d.status === 'Available').map(d => ({ value: d.id, label: d.name }))
                      ]}
                    />
                  </div>
                </div>

                {selectedVehicleForForm && formCargoWeight && Number(formCargoWeight) > selectedVehicleForForm.max_load_capacity && (
                  <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl text-brand-danger text-xs font-semibold">
                    Warning: Cargo weight ({formCargoWeight}) exceeds vehicle maximum capacity ({selectedVehicleForForm.max_load_capacity}).
                  </div>
                )}
              </form>
            </div>

            <div className="p-4 border-t border-white/5 flex items-center justify-end gap-3 bg-black/20 shrink-0">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" form="add-trip-form" disabled={!isFormValid || (selectedVehicleForForm && Number(formCargoWeight) > selectedVehicleForForm.max_load_capacity)}>
                Create Trip
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
