import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Users,
  Compass,
  TrendingUp,
  MapPin,
  Filter,
  RefreshCw,
  Plus,
  CloudSun,
  ShieldAlert,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import {
  FleetUtilizationChart,
  VehicleStatusChart,
  FuelUsageChart,
  MaintenanceTrendsChart
} from '../components/CustomCharts';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    vehicles,
    drivers,
    trips,
    logs,
    addToast,
    widgetOrder,
    setWidgetOrder,
    setTourActive,
    setTourStep,
    setActivePage
  } = useApp();

  // Filter states
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sparkline generator helper
  const renderSparkline = (points: number[], stroke: string) => {
    const width = 80;
    const height = 30;
    const maxVal = Math.max(...points, 1);
    const minVal = Math.min(...points, 0);
    const range = maxVal - minVal;
    
    const svgPoints = points.map((p, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((p - minVal) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          points={svgPoints}
        />
      </svg>
    );
  };

  // Reorder widget positions
  const moveWidget = (direction: 'up' | 'down', index: number) => {
    const newOrder = [...widgetOrder];
    if (direction === 'up' && index > 0) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;
    } else if (direction === 'down' && index < newOrder.length - 1) {
      const temp = newOrder[index];
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;
    }
    setWidgetOrder(newOrder);
    addToast('Dashboard layout updated and saved locally.', 'success');
  };

  const handleApplyFilters = () => {
    addToast('Telemetry filters applied successfully.', 'success');
  };

  const handleClearFilters = () => {
    setVehicleTypeFilter('All');
    setRegionFilter('All');
    setStatusFilter('All');
    addToast('Telemetry filters cleared.', 'info');
  };

  // Derived KPI metrics
  const activeVehiclesCount = vehicles.filter(v => v.status === 'On Trip').length;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'Available').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'In Shop').length;
  const totalActiveTrips = trips.filter(t => t.status === 'Dispatched').length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Trip' || d.status === 'Available').length;
  
  // Dynamic greetings matching user role
  const getGreeting = () => {
    return `Welcome, ${currentUser?.name || 'Officer'}`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header section with greetings and quick actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
              {currentUser?.role || 'Fleet Manager'}
            </span>
            <span className="text-xs text-white/40 font-mono">Terminal Active</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">{getGreeting()}</h1>
          <p className="text-xs text-white/50 font-medium mt-0.5">
            {currentUser?.role === 'Driver'
              ? 'Your personal trip & status overview'
              : `Operational Overview for ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Only Fleet Managers & Admins see these action buttons */}
          {(currentUser?.role === 'Fleet Manager' || currentUser?.role === 'Administrator') && (
            <>
              <button
                onClick={() => {
                  setTourStep(0);
                  setTourActive(true);
                }}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all text-xs font-semibold text-white/80"
              >
                Start Operations Guide
              </button>
              
              <button
                onClick={() => {
                  setActivePage('vehicles');
                  addToast('Adding new vehicle. Complete details below.', 'info');
                }}
                className="px-4 py-2.5 rounded-xl btn-primary transition-all flex items-center gap-1.5 text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Deploy Vehicle</span>
              </button>
            </>
          )}

          {/* Dispatchers can deploy but not manage */}
          {currentUser?.role === 'Dispatcher' && (
            <button
              onClick={() => {
                setActivePage('vehicles');
                addToast('Select a vehicle to dispatch.', 'info');
              }}
              className="px-4 py-2.5 rounded-xl btn-primary transition-all flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Dispatch</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced filters card — only visible to Managers, Admins, Dispatchers */}
      {currentUser?.role !== 'Driver' && (
      <div className="theme-card bg-[#1B1E24]/60 backdrop-blur-md p-5 border border-[#2A2E36] rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white/80">
          <Filter className="w-4 h-4 text-amber-500" />
          <span>Advanced Telemetry Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Vehicle Type</label>
            <select
              value={vehicleTypeFilter}
              onChange={e => setVehicleTypeFilter(e.target.value)}
              className="w-full theme-input p-2.5 text-xs"
            >
              <option value="All">All Classifications</option>
              <option value="Semi-Truck">Semi-Truck</option>
              <option value="Box Truck">Box Truck</option>
              <option value="Cargo Van">Cargo Van</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Operating Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full theme-input p-2.5 text-xs"
            >
              <option value="All">All Operating States</option>
              <option value="Available">Available</option>
              <option value="On Trip">In-Transit</option>
              <option value="In Shop">In Maintenance</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-white/40 uppercase">Regional Sector</label>
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="w-full theme-input p-2.5 text-xs"
            >
              <option value="All">All Sectors</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              <option value="Central">Central</option>
              <option value="North-East">North-East</option>
            </select>
          </div>

          <div className="flex items-end gap-2.5">
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-2.5 rounded-xl btn-primary text-xs"
            >
              Apply Filter
            </button>
            <button
              onClick={handleClearFilters}
              className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Clear all filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Dynamic Widget Order mapping */}
      <div className="space-y-6">
        {widgetOrder.map((widgetId, index) => {
          const showReorderControls = (
            <div className="flex items-center gap-1.5">
              {index > 0 && (
                <button
                  onClick={() => moveWidget('up', index)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  title="Move Widget Up"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
              )}
              {index < widgetOrder.length - 1 && (
                <button
                  onClick={() => moveWidget('down', index)}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  title="Move Widget Down"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              )}
            </div>
          );

          if (widgetId === 'kpis') {
            return (
              <div key="widget_kpi" className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-white/40 uppercase tracking-wider">
                  <span>Operational KPI Metrics</span>
                  {showReorderControls}
                </div>
                {/* Stat cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* KPI 1 */}
                  <div className="theme-card p-4 flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-start text-white/40">
                      <Truck className="w-5 h-5 text-emerald-500" />
                      <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        +12%
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white mt-2">{activeVehiclesCount}</p>
                      <p className="text-[10px] text-white/50 font-semibold truncate uppercase mt-0.5">Active Fleet</p>
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div className="theme-card p-4 flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-start text-white/40">
                      <Truck className="w-5 h-5 text-blue-400" />
                      {renderSparkline([4, 5, 4, 3, 5, 4, 3], 'var(--color-secondary)')}
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white mt-2">{availableVehiclesCount}</p>
                      <p className="text-[10px] text-white/50 font-semibold truncate uppercase mt-0.5">Available Vehicles</p>
                    </div>
                  </div>

                  {/* KPI 3 */}
                  <div className="theme-card p-4 flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-start text-white/40">
                      <Wrench className="w-5 h-5 text-amber-500" />
                      <span className="text-[10px] font-mono text-amber-500 font-semibold">Bay Active</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white mt-2">{maintenanceCount}</p>
                      <p className="text-[10px] text-white/50 font-semibold truncate uppercase mt-0.5">In Maintenance</p>
                    </div>
                  </div>

                  {/* KPI 4 */}
                  <div className="theme-card p-4 flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-start text-white/40">
                      <Compass className="w-5 h-5 text-purple-400" />
                      <span className="text-[10px] font-mono text-white/30">Live Dispatch</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white mt-2">{totalActiveTrips}</p>
                      <p className="text-[10px] text-white/50 font-semibold truncate uppercase mt-0.5">Active Trips</p>
                    </div>
                  </div>

                  {/* KPI 5 */}
                  <div className="theme-card p-4 flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-start text-white/40">
                      <Users className="w-5 h-5 text-cyan-400" />
                      {renderSparkline([2, 3, 3, 2, 4, 3, 3], '#06B6D4')}
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white mt-2">{driversOnDuty}</p>
                      <p className="text-[10px] text-white/50 font-semibold truncate uppercase mt-0.5">Drivers On Duty</p>
                    </div>
                  </div>

                  {/* KPI 6 */}
                  <div className="theme-card p-4 flex flex-col justify-between h-[120px]">
                    <div className="flex justify-between items-start text-white/40">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                      <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        89%
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white mt-2">87.5%</p>
                      <p className="text-[10px] text-white/50 font-semibold truncate uppercase mt-0.5">Utilization rate</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (widgetId === 'charts') {
            return (
              <div key="widget_charts" className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-white/40 uppercase tracking-wider">
                  <span>Interactive Visualizations</span>
                  {showReorderControls}
                </div>
                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Utilization Area Chart */}
                  <div className="theme-card bg-[#1B1E24]/65 backdrop-blur-md p-5 border border-[#2A2E36] rounded-2xl flex flex-col justify-between min-h-[260px]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug">Fleet Utilization rate</h3>
                        <p className="text-[10px] text-white/50 font-medium">Daily average occupancy percentage over last week</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <span>+4.2%</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <div className="flex-1 mt-6">
                      <FleetUtilizationChart />
                    </div>
                  </div>

                  {/* Status Donut Chart */}
                  <div className="theme-card bg-[#1B1E24]/65 backdrop-blur-md p-5 border border-[#2A2E36] rounded-2xl flex flex-col justify-between min-h-[260px]">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">Vehicle Distribution by Status</h3>
                      <p className="text-[10px] text-white/50 font-medium">Distribution of fleet trucks across operational status</p>
                    </div>
                    <div className="flex-1 mt-6">
                      <VehicleStatusChart />
                    </div>
                  </div>

                  {/* Maintenance Trends */}
                  <div className="theme-card bg-[#1B1E24]/65 backdrop-blur-md p-5 border border-[#2A2E36] rounded-2xl flex flex-col justify-between min-h-[260px]">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">Maintenance Costs & Audits</h3>
                      <p className="text-[10px] text-white/50 font-medium">Preventative workshop expenses and audit counts</p>
                    </div>
                    <div className="flex-1 mt-6">
                      <MaintenanceTrendsChart />
                    </div>
                  </div>

                  {/* Fuel Usage preview bar */}
                  <div className="theme-card bg-[#1B1E24]/65 backdrop-blur-md p-5 border border-[#2A2E36] rounded-2xl flex flex-col justify-between min-h-[260px]">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">Average Fuel Economy (MPG)</h3>
                      <p className="text-[10px] text-white/50 font-medium">MPG targets vs actual performance across classes</p>
                    </div>
                    <div className="flex-1 mt-6 flex flex-col justify-center">
                      <FuelUsageChart />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (widgetId === 'timeline') {
            return (
              <div key="widget_timeline" className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="welcome">
                {/* Recent Activities Timeline (2/3 width) */}
                <div className="lg:col-span-2 theme-card bg-[#1B1E24]/60 backdrop-blur-md p-5 border border-[#2A2E36] rounded-2xl flex flex-col">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Live Activity Audit Log</h3>
                      <p className="text-[10px] text-white/50 font-medium mt-0.5">Real-time system telemetry and dispatch audit trail</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-3 border-r border-white/5 pr-4">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider">Success</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider">Info</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider">Warning</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider">Danger</span>
                        </div>
                      </div>
                      {showReorderControls}
                    </div>
                  </div>
                  <div className="space-y-4 mt-4 overflow-y-auto max-h-[300px] pr-1">
                    {logs.map((log) => {
                      const colorMap = {
                        success: 'bg-emerald-500',
                        warning: 'bg-amber-500',
                        danger: 'bg-red-500',
                        info: 'bg-blue-400'
                      };
                      return (
                        <div key={log.id} className="flex gap-4 items-start text-xs group relative">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colorMap[log.status] || 'bg-slate-400'}`} />
                          <div className="flex-1 space-y-1">
                            <p className="text-white/80 leading-relaxed font-medium">{log.message}</p>
                            <div className="flex items-center gap-3 text-[10px] text-white/40">
                              <span className="font-semibold text-white/50">{log.user}</span>
                              <span>•</span>
                              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Compliance widgets */}
                <div className="theme-card bg-[#1B1E24]/60 backdrop-blur-md p-5 border border-[#2A2E36] rounded-2xl flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <h3 className="text-sm font-bold text-white">Compliance & Alerts</h3>
                    {showReorderControls}
                  </div>
                  
                  <div className="space-y-3 mt-4 flex-1">
                    {/* Alert 1 */}
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-white">CDL Expired (Suspended)</p>
                        <p className="text-white/60 text-[10px] mt-0.5">Dave Rodriguez CDL has expired. Status suspended.</p>
                      </div>
                    </div>

                    {/* Alert 2 */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-white">Insurance Expiring Soon</p>
                        <p className="text-white/60 text-[10px] mt-0.5">Isuzu NPR (NY-448-BOX) insurance renewal required in 16 days.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (widgetId === 'widgets') {
            return (
              <div key="widget_misc" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Weather Widget */}
                <div className="theme-card p-5 flex flex-col justify-between min-h-[160px]">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-white">Weather Diagnostics</h3>
                    {showReorderControls}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <CloudSun className="w-10 h-10 text-amber-500" />
                      <div>
                        <p className="text-2xl font-black text-white">78°F</p>
                        <p className="text-xs text-white/50 font-semibold uppercase mt-0.5">Scattered Clouds</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-white/40 font-semibold space-y-1">
                      <p className="flex items-center justify-end gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Miami Hub</span>
                      </p>
                      <p>Humidity: 62%</p>
                    </div>
                  </div>
                </div>

                {/* Today's Dispatched Trips Widget */}
                <div className="theme-card p-5 flex flex-col justify-between min-h-[160px] md:col-span-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-white">Ongoing Dispatches</h3>
                      <p className="text-[10px] text-white/50 font-medium">Currently active delivery dispatches in the region</p>
                    </div>
                    {showReorderControls}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {trips.filter(t => t.status === 'Dispatched').slice(0, 2).map((trip) => {
                      const truckModel = vehicles.find(v => v.id === trip.vehicle_id)?.model || 'Semi-Truck';
                      return (
                        <div key={trip.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-2 hover:border-white/10 transition-colors">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-mono font-bold text-white">{trip.id}</span>
                            <span className="px-2 py-0.5 text-[9px] bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 rounded">
                              Dispatched
                            </span>
                          </div>
                          <div className="text-xs text-white/80">
                            <p className="font-semibold text-white">{truckModel}</p>
                            <p className="text-[10px] text-white/40 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-white/30" />
                              <span>{trip.source} ➔ {trip.destination}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
