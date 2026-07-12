import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, Users, Compass, TrendingUp, MapPin, Filter, RefreshCw, Plus, CloudSun, ShieldAlert, ArrowUpRight, ArrowUp, ArrowDown, Wrench, AlertTriangle } from 'lucide-react';
import { FleetUtilizationChart, VehicleStatusChart, FuelUsageChart, MaintenanceTrendsChart } from '../components/CustomCharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Button, Select } from '../components/ui';

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

  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

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
        <polyline fill="none" stroke={stroke} strokeWidth="2" points={svgPoints} />
      </svg>
    );
  };

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

  const activeVehiclesCount = vehicles.filter(v => v.status === 'On Trip').length;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'Available').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'In Shop').length;
  const totalActiveTrips = trips.filter(t => t.status === 'Dispatched').length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Trip' || d.status === 'Available').length;
  
  const getGreeting = () => {
    return `Welcome, ${currentUser?.name || 'Officer'}`;
  };

  const showReorderControls = (index: number) => (
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

  const KPICard = ({ icon: Icon, iconColor, sparkline, value, label, trend }: {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    sparkline?: number[];
    value: string | number;
    label: string;
    trend?: { value: string; color: string };
  }) => (
    <Card padding="md" className="flex flex-col justify-between h-[120px]">
      <div className="flex justify-between items-start text-text-muted">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        {trend && (
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${trend.color}15`, color: trend.color, borderColor: `${trend.color}33` }}>
            {trend.value}
          </span>
        )}
        {sparkline && <span className="w-20">{renderSparkline(sparkline, iconColor)}</span>}
      </div>
      <div>
        <p className="text-2xl font-black text-text-primary mt-2">{value}</p>
        <p className="text-[10px] text-text-muted font-semibold truncate uppercase mt-0.5">{label}</p>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header section with greetings and quick actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm" dot>{currentUser?.role || 'Fleet Manager'}</Badge>
            <span className="text-xs text-text-muted font-mono">Terminal Active</span>
          </div>
          <h1 className="text-2xl font-black text-text-primary mt-1">{getGreeting()}</h1>
          <p className="text-xs text-text-muted font-medium mt-0.5">
            {currentUser?.role === 'Driver'
              ? 'Your personal trip & status overview'
              : `Operational Overview for ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(currentUser?.role === 'Fleet Manager' || currentUser?.role === 'Administrator') && (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setTourStep(0); setTourActive(true); }}>
                Start Operations Guide
              </Button>
              <Button onClick={() => { setActivePage('vehicles'); addToast('Adding new vehicle. Complete details below.', 'info'); }}>
                <Plus className="w-4 h-4" />
                <span>Deploy Vehicle</span>
              </Button>
            </>
          )}

          {currentUser?.role === 'Dispatcher' && (
            <Button onClick={() => { setActivePage('vehicles'); addToast('Select a vehicle to dispatch.', 'info'); }}>
              <Plus className="w-4 h-4" />
              <span>New Dispatch</span>
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters card */}
      {currentUser?.role !== 'Driver' && (
        <Card variant="default" padding="lg" className="bg-bg-secondary/60 backdrop-blur-md border-border-primary">
          <CardHeader className="flex flex-row items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <Filter className="w-4 h-4 text-brand-warning" />
              <span>Advanced Telemetry Filters</span>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">Vehicle Type</label>
              <Select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Classifications' },
                  { value: 'Semi-Truck', label: 'Semi-Truck' },
                  { value: 'Box Truck', label: 'Box Truck' },
                  { value: 'Cargo Van', label: 'Cargo Van' }
                ]}
                placeholder="All Classifications"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">Operating Status</label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Operating States' },
                  { value: 'Available', label: 'Available' },
                  { value: 'On Trip', label: 'In-Transit' },
                  { value: 'In Shop', label: 'In Maintenance' }
                ]}
                placeholder="All Operating States"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase">Regional Sector</label>
              <Select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Sectors' },
                  { value: 'North', label: 'North' },
                  { value: 'South', label: 'South' },
                  { value: 'East', label: 'East' },
                  { value: 'West', label: 'West' },
                  { value: 'Central', label: 'Central' },
                  { value: 'North-East', label: 'North-East' }
                ]}
                placeholder="All Sectors"
              />
            </div>

            <div className="flex items-end gap-2.5">
              <Button onClick={handleApplyFilters} className="flex-1">
                Apply Filter
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClearFilters} title="Clear all filters">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Widget Order mapping */}
      <div className="space-y-6">
        {widgetOrder.map((widgetId, index) => {
          if (widgetId === 'kpis') {
            return (
              <div key="widget_kpi" className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider">
                  <span>Operational KPI Metrics</span>
                  {showReorderControls(index)}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  <KPICard
                    icon={Truck}
                    iconColor="text-brand-success"
                    value={activeVehiclesCount}
                    label="Active Fleet"
                    trend={{ value: '+12%', color: 'var(--color-brand-success)' }}
                  />
                  <KPICard
                    icon={Truck}
                    iconColor="text-brand-secondary"
                    sparkline={[4, 5, 4, 3, 5, 4, 3]}
                    value={availableVehiclesCount}
                    label="Available Vehicles"
                  />
                  <KPICard
                    icon={Wrench}
                    iconColor="text-brand-warning"
                    value={maintenanceCount}
                    label="In Maintenance"
                  />
                  <KPICard
                    icon={Compass}
                    iconColor="text-purple-400"
                    value={totalActiveTrips}
                    label="Active Trips"
                  />
                  <KPICard
                    icon={Users}
                    iconColor="text-brand-info"
                    sparkline={[2, 3, 3, 2, 4, 3, 3]}
                    value={driversOnDuty}
                    label="Drivers On Duty"
                  />
                  <KPICard
                    icon={TrendingUp}
                    iconColor="text-indigo-400"
                    value="87.5%"
                    label="Utilization rate"
                    trend={{ value: '89%', color: 'var(--color-brand-primary)' }}
                  />
                </div>
              </div>
            );
          }

          if (widgetId === 'charts') {
            return (
              <div key="widget_charts" className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider">
                  <span>Interactive Visualizations</span>
                  {showReorderControls(index)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card variant="elevated" padding="lg" className="min-h-[260px] flex flex-col justify-between">
                    <CardHeader>
                      <CardTitle>Fleet Utilization Rate</CardTitle>
                      <CardDescription>Daily average occupancy percentage over last week</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 mt-6">
                      <FleetUtilizationChart />
                    </CardContent>
                    <CardFooter className="border-0 pt-0">
                      <Badge variant="success" size="sm" className="flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>+4.2%</span>
                      </Badge>
                    </CardFooter>
                  </Card>

                  <Card variant="elevated" padding="lg" className="min-h-[260px] flex flex-col justify-between">
                    <CardHeader>
                      <CardTitle>Vehicle Distribution by Status</CardTitle>
                      <CardDescription>Distribution of fleet trucks across operational status</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 mt-6">
                      <VehicleStatusChart />
                    </CardContent>
                  </Card>

                  <Card variant="elevated" padding="lg" className="min-h-[260px] flex flex-col justify-between">
                    <CardHeader>
                      <CardTitle>Maintenance Costs & Audits</CardTitle>
                      <CardDescription>Preventative workshop expenses and audit counts</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 mt-6">
                      <MaintenanceTrendsChart />
                    </CardContent>
                  </Card>

                  <Card variant="elevated" padding="lg" className="min-h-[260px] flex flex-col justify-between">
                    <CardHeader>
                      <CardTitle>Average Fuel Economy (MPG)</CardTitle>
                      <CardDescription>MPG targets vs actual performance across classes</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 mt-6 flex flex-col justify-center">
                      <FuelUsageChart />
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          }

          if (widgetId === 'timeline') {
            return (
              <div key="widget_timeline" className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="welcome">
                <Card variant="elevated" padding="lg" className="lg:col-span-2 flex flex-col">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-3 mb-4">
                    <div>
                      <CardTitle className="text-sm">Live Activity Audit Log</CardTitle>
                      <CardDescription className="text-[10px]">Real-time system telemetry and dispatch audit trail</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-3 border-r border-white/5 pr-4">
                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-success" /><span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Success</span></div>
                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" /><span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Info</span></div>
                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-warning" /><span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Warning</span></div>
                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-danger" /><span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Danger</span></div>
                      </div>
                      {showReorderControls(index)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 mt-4 overflow-y-auto max-h-[300px] pr-1">
                    {logs.map((log) => {
                      const colorMap = {
                        success: 'bg-brand-success',
                        warning: 'bg-brand-warning',
                        danger: 'bg-brand-danger',
                        info: 'bg-brand-secondary'
                      };
                      return (
                        <div key={log.id} className="flex gap-4 items-start text-xs group relative">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${colorMap[log.status] || 'bg-text-muted'}`} />
                          <div className="flex-1 space-y-1">
                            <p className="text-text-primary/80 leading-relaxed font-medium">{log.message}</p>
                            <div className="flex items-center gap-3 text-[10px] text-text-muted">
                              <span className="font-semibold text-text-secondary">{log.user}</span>
                              <span>•</span>
                              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card variant="elevated" padding="lg" className="flex flex-col justify-between">
                  <CardHeader className="border-b border-white/5 pb-3 mb-4">
                    <CardTitle className="text-sm">Compliance & Alerts</CardTitle>
                    {showReorderControls(index)}
                  </CardHeader>
                  <CardContent className="space-y-3 mt-4 flex-1">
                    <div className="p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-brand-danger shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-text-primary">CDL Expired (Suspended)</p>
                        <p className="text-text-secondary text-[10px] mt-0.5">Dave Rodriguez CDL has expired. Status suspended.</p>
                      </div>
                    </div>
                    <div className="p-3 bg-brand-warning/10 border border-brand-warning/20 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-brand-warning shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-text-primary">Insurance Expiring Soon</p>
                        <p className="text-text-secondary text-[10px] mt-0.5">Isuzu NPR (NY-448-BOX) insurance renewal required in 16 days.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          }

          if (widgetId === 'widgets') {
            return (
              <div key="widget_misc" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="elevated" padding="lg" className="min-h-[160px] flex flex-col justify-between">
                  <CardHeader className="flex flex-row items-center justify-between mb-4">
                    <CardTitle className="text-sm">Weather Diagnostics</CardTitle>
                    {showReorderControls(index)}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <CloudSun className="w-10 h-10 text-brand-warning" />
                      <div>
                        <p className="text-2xl font-black text-text-primary">78°F</p>
                        <p className="text-xs text-text-muted font-semibold uppercase mt-0.5">Scattered Clouds</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-text-muted font-semibold space-y-1">
                      <p className="flex items-center justify-end gap-1"><MapPin className="w-3.5 h-3.5" /><span>Miami Hub</span></p>
                      <p>Humidity: 62%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="elevated" padding="lg" className="min-h-[160px] md:col-span-2 flex flex-col justify-between">
                  <CardHeader className="flex flex-row items-center justify-between mb-4">
                    <div>
                      <CardTitle className="text-sm">Ongoing Dispatches</CardTitle>
                      <CardDescription className="text-[10px]">Currently active delivery dispatches in the region</CardDescription>
                    </div>
                    {showReorderControls(index)}
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {trips.filter(t => t.status === 'Dispatched').slice(0, 2).map((trip) => {
                      const truckModel = vehicles.find(v => v.id === trip.vehicle_id)?.model || 'Semi-Truck';
                      return (
                        <div key={trip.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col gap-2 hover:border-white/10 transition-colors">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-mono font-bold text-text-primary">{trip.id}</span>
                            <Badge variant="info" size="sm">Dispatched</Badge>
                          </div>
                          <div className="text-xs text-text-secondary">
                            <p className="font-semibold text-text-primary">{truckModel}</p>
                            <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-text-muted" />
                              <span>{trip.source} ➔ {trip.destination}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};