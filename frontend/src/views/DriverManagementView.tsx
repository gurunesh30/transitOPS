import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { ExtendedDriver } from '../data/mockData';
import {
  Users,
  Search,
  Grid,
  List,
  Eye,
  Trash2,
  Plus,
  X,
  Phone,
  Mail,
  Award,
  AlertTriangle,
  Calendar,
  Heart,
  CheckCircle,
  Clock,
  Compass,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusBadge } from '../components/common/StatusBadge';

export const DriverManagementView: React.FC = () => {
  const {
    drivers,
    setDrivers,
    addToast,
    addLog,
    addRecentView,
    triggerAutoSave,
    autoSaveActive
  } = useApp();

  // Filter/layout states
  const [layoutMode, setLayoutMode] = useState<'table' | 'card'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Drawer / Modal states
  const [selectedDriver, setSelectedDriver] = useState<ExtendedDriver | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'profile' | 'violations' | 'documents' | 'contact'>('profile');

  // Add Driver Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLicenseNo, setFormLicenseNo] = useState('');
  const [formCategory, setFormCategory] = useState('Class A CDL');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formBloodGroup, setFormBloodGroup] = useState('O+');
  const [formEmergencyContact, setFormEmergencyContact] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const formStatus: ExtendedDriver['status'] = 'Available';

  // Real-time compliance alerts computations
  const complianceAlerts = useMemo(() => {
    const alerts: { id: string; type: 'danger' | 'warning'; message: string; sub: string }[] = [];
    
    drivers.forEach(d => {
      // CDL Expired / Expiring
      const expiry = new Date(d.license_expiry_date);
      const now = new Date('2026-07-12'); // Current local time context
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        alerts.push({
          id: `alert_exp_${d.id}`,
          type: 'danger',
          message: `Licensing Compliance Breach: ${d.name}`,
          sub: `CDL license expired on ${d.license_expiry_date}. Immediately suspend road dispatches.`
        });
      } else if (diffDays <= 30) {
        alerts.push({
          id: `alert_exp_soon_${d.id}`,
          type: 'warning',
          message: `License Renewal Window: ${d.name}`,
          sub: `Class A CDL expires in ${diffDays} days (${d.license_expiry_date}). Renew immediately.`
        });
      }

      // Safety score warning
      if (d.safety_score < 75) {
        alerts.push({
          id: `alert_safe_${d.id}`,
          type: 'danger',
          message: `Safety Compliance Infraction: ${d.name}`,
          sub: `Telemetry safety rating dropped to ${d.safety_score}%. Mandate driver safety retraining.`
        });
      }

      // Missing documents
      const hasMissing = d.documents.some(doc => doc.status === 'missing');
      if (hasMissing) {
        alerts.push({
          id: `alert_doc_${d.id}`,
          type: 'warning',
          message: `Document Audit Warning: ${d.name}`,
          sub: `Audit report shows one or more compliance documents are missing or invalid.`
        });
      }
    });

    return alerts.slice(0, 3); // Display top 3
  }, [drivers]);

  const handleOpenDrawer = (driver: ExtendedDriver) => {
    setSelectedDriver(driver);
    setActiveDrawerTab('profile');
    addRecentView(driver.id, 'driver', driver.name);
  };

  const handleAddDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formEmail || !formLicenseNo || !formExpiryDate || !formExperience) {
      addToast('Please fill in all required form fields.', 'warning');
      return;
    }

    triggerAutoSave();

    setTimeout(() => {
      const newDriver: ExtendedDriver = {
        id: `d_${Date.now()}`,
        name: formName.trim(),
        license_number: formLicenseNo.trim(),
        license_category: formCategory,
        license_expiry_date: formExpiryDate,
        contact_number: formPhone.trim(),
        safety_score: 95, // Default safety starting rating
        status: formStatus,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
        email: formEmail.trim(),
        address: formAddress.trim(),
        experience: Number(formExperience),
        blood_group: formBloodGroup,
        emergency_contact: formEmergencyContact.trim(),
        notes: formNotes.trim(),
        completed_trips: 0,
        violation_history: [],
        documents: [
          { name: 'CDL License', status: 'valid', expiryDate: formExpiryDate },
          { name: 'DOT Medical Certificate', status: 'valid', expiryDate: '2027-10-12' }
        ],
        rating: 4.8
      };

      setDrivers(prev => [newDriver, ...prev]);
      addToast(`Driver Profile for ${formName} registered.`, 'success');
      addLog('driver', `Registered new driver node: ${formName} (${formLicenseNo})`, 'success');
      setIsAddModalOpen(false);

      // Reset fields
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormAddress('');
      setFormLicenseNo('');
      setFormExperience('');
      setFormEmergencyContact('');
      setFormNotes('');
    }, 800);
  };

  // Filter dataset
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.license_number.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchQuery, statusFilter]);

  // Safety rating circle builder
  const renderSafetyScoreCircle = (score: number) => {
    const radius = 16;
    const stroke = 3;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let color = 'stroke-emerald-500';
    if (score < 75) color = 'stroke-red-500';
    else if (score < 90) color = 'stroke-amber-500';

    return (
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        <svg className="w-10 h-10 transform -rotate-90">
          <circle cx="20" cy="20" r={radius} stroke="var(--color-border)" strokeWidth={stroke} fill="transparent" />
          <circle
            cx="20"
            cy="20"
            r={radius}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${color} transition-all duration-300`}
          />
        </svg>
        <span className="absolute text-[10px] font-mono font-bold text-white">{score}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* View Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
            <span>Human Resource Matrix</span>
            <span>/</span>
            <span className="text-white/60">Active Dispatchers & Operators</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Driver Management</h1>
          <p className="text-xs text-white/50 font-medium mt-0.5">
            Audit CDL compliance, analyze safety metrics, and verify licenses across the contractor network
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-white/5 border border-white/10 p-0.5">
            <Button
              variant={layoutMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              className="p-2"
              onClick={() => setLayoutMode('table')}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={layoutMode === 'card' ? 'primary' : 'ghost'}
              size="sm"
              className="p-2"
              onClick={() => setLayoutMode('card')}
              title="Card View"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Onboard Operator
          </Button>
        </div>
      </div>

      {/* Compliance Warnings Banner */}
      {complianceAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider">Active HR Compliance Audits</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {complianceAlerts.map(alert => {
              const isDanger = alert.type === 'danger';
              return (
                <Card
                  key={alert.id}
                  variant="outlined"
                  padding="md"
                  className={isDanger ? 'border-brand-danger/20 bg-brand-danger/5' : 'border-brand-warning/20 bg-brand-warning/5'}
                >
                  <div className="flex items-start gap-3.5">
                    <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isDanger ? 'text-brand-danger' : 'text-brand-warning'}`} />
                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-white">{alert.message}</p>
                      <p className="text-white/60 leading-relaxed text-[10px]">{alert.sub}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <Card variant="outlined" padding="md" className="bg-bg-secondary/60 backdrop-blur-md border-border-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search driver by name or license..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          options={[
            { value: 'All', label: 'All Operating States' },
            { value: 'Available', label: 'Available' },
            { value: 'On Trip', label: 'On Trip' },
            { value: 'Off Duty', label: 'Off Duty' },
            { value: 'Suspended', label: 'Suspended' }
          ]}
          className="w-auto min-w-[180px] shrink-0"
        />
      </Card>

      {/* LAYOUT 1: TABLE VIEW */}
      {layoutMode === 'table' ? (
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="p-4 text-xs font-bold text-white/40 uppercase">Photo</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase">Full Name</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase">License Details</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase">Expiry Date</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase">Safety Rating</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase">Experience</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map(driver => {
                    const safetyTrend = driver.safety_score >= 90 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-brand-success ml-1 shrink-0" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-brand-danger ml-1 shrink-0" />
                    );

                    return (
                      <tr
                        key={driver.id}
                        onClick={() => handleOpenDrawer(driver)}
                        className="border-b border-white/5 transition-all hover:bg-white/2 cursor-pointer"
                      >
                        {/* Avatar */}
                        <td className="p-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5">
                            {driver.photo ? (
                              <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white text-xs">
                                {driver.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name & Contact info */}
                        <td className="p-4">
                          <div className="text-xs font-bold text-white">{driver.name}</div>
                          <div className="text-[10px] text-white/40 font-mono mt-0.5">{driver.contact_number}</div>
                        </td>

                        {/* License Category and number */}
                        <td className="p-4">
                          <div className="text-xs font-semibold text-white">{driver.license_category}</div>
                          <div className="text-[10px] text-white/40 font-mono mt-0.5">{driver.license_number}</div>
                        </td>

                        {/* Expiry Date */}
                        <td className="p-4 text-xs font-mono text-white/70">
                          {driver.license_expiry_date}
                        </td>

                        {/* Safety rating circle progress */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            {renderSafetyScoreCircle(driver.safety_score)}
                            {safetyTrend}
                          </div>
                        </td>

                        {/* Experience */}
                        <td className="p-4 text-xs text-white/60 font-semibold font-mono">
                          {driver.experience} years
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <StatusBadge status={driver.status} size="sm" dot />
                        </td>

                        {/* Actions */}
                        <td className="p-4" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDrawer(driver)} aria-label="Audit Profile">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const confirmDelete = window.confirm(`Delete driver profile for ${driver.name}?`);
                                if (confirmDelete) {
                                  setDrivers(prev => prev.filter(d => d.id !== driver.id));
                                  addToast('Driver profile deleted.', 'danger');
                                  addLog('driver', `Removed driver ${driver.name} from active contractor database.`, 'danger');
                                }
                              }}
                              aria-label="Delete profile"
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
                    <td colSpan={8} className="py-12 text-center text-white/30 text-sm">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-12 h-12 text-white/10" />
                        <p className="font-bold">No Driver Profiles Found</p>
                        <p className="text-xs">Adjust your search parameters or register an operator.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* LAYOUT 2: CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map(driver => (
              <Card
                key={driver.id}
                variant="default"
                padding="lg"
                hoverable
                onClick={() => handleOpenDrawer(driver)}
                className="space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Image and basic specs */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5">
                      {driver.photo ? (
                        <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white text-xs">
                          {driver.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <div className="text-xs">
                      <h3 className="font-bold text-white text-sm">{driver.name}</h3>
                      <p className="text-white/40 font-mono mt-0.5">{driver.license_category}</p>
                    </div>
                  </div>

                  <StatusBadge status={driver.status} size="sm" />
                </div>

                {/* Safety rating stats */}
                <div className="flex items-center justify-between p-3 bg-black/15 rounded-xl border border-white/5">
                  <div className="text-[10px]">
                    <p className="text-white/40 uppercase font-semibold">Safety Telemetry</p>
                    <p className="text-white font-bold mt-0.5">Rating: {driver.safety_score}%</p>
                  </div>
                  {renderSafetyScoreCircle(driver.safety_score)}
                </div>

                {/* License Expiry warning inside card */}
                <div className="flex items-center justify-between text-[10px] text-white/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-white/30" />
                    <span>Exp: {driver.license_expiry_date}</span>
                  </span>
                  <span className="font-mono">{driver.experience} Yrs Exp</span>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-white/30 text-sm">
              <div className="flex flex-col items-center gap-3">
                <Users className="w-12 h-12 text-white/10" />
                <p className="font-bold">No Driver Profiles Found</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Driver Profile Drawer Panel */}
      {selectedDriver && (
        <div className="fixed inset-y-0 right-0 w-full max-w-lg z-50 bg-bg-secondary border-l border-white/10 shadow-2xl flex flex-col animate-slide-in">
          {/* Drawer Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/15">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 shrink-0">
                <img src={selectedDriver.photo} alt={selectedDriver.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{selectedDriver.name}</h3>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">{selectedDriver.license_category}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDriver(null)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Drawer Tabs */}
          <div className="flex items-center border-b border-white/5 bg-black/10 p-1 px-4 overflow-x-auto shrink-0">
            {(['profile', 'violations', 'documents', 'contact'] as const).map(tab => (
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
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
            
            {/* TAB CONTENT: PROFILE */}
            {activeDrawerTab === 'profile' && (
              <div className="space-y-5 animate-fade-in">
                {/* Specs grids */}
                <div className="grid grid-cols-2 gap-3.5">
                  <Card variant="outlined" padding="md" className="bg-white/2 border-white/5">
                    <p className="text-white/40 uppercase text-[9px] font-bold">Safety rating</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-base font-bold text-white">{selectedDriver.safety_score}%</p>
                      <Badge
                        variant={selectedDriver.safety_score >= 90 ? 'success' : 'danger'}
                        size="sm"
                        className="px-1.5 py-0.5 text-[9px]"
                      >
                        {selectedDriver.safety_score >= 90 ? 'Excellent' : 'Needs Retraining'}
                      </Badge>
                    </div>
                  </Card>
                  <Card variant="outlined" padding="md" className="bg-white/2 border-white/5">
                    <p className="text-white/40 uppercase text-[9px] font-bold">Total completed loops</p>
                    <p className="text-base font-bold text-white mt-1">{selectedDriver.completed_trips} trips</p>
                  </Card>
                </div>

                {/* Personal specs */}
                <Card variant="outlined" padding="lg" className="bg-white/2 border-white/5">
                  <h4 className="font-bold text-white text-xs border-b border-white/5 pb-2">Employment telemetry</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                    <div>
                      <p className="text-white/40 uppercase text-[8px] font-bold">License number</p>
                      <p className="text-white font-semibold font-mono mt-0.5">{selectedDriver.license_number}</p>
                    </div>
                    <div>
                      <p className="text-white/40 uppercase text-[8px] font-bold">Category</p>
                      <p className="text-white font-semibold mt-0.5">{selectedDriver.license_category}</p>
                    </div>
                    <div>
                      <p className="text-white/40 uppercase text-[8px] font-bold">Experience level</p>
                      <p className="text-white font-semibold mt-0.5">{selectedDriver.experience} Years active</p>
                    </div>
                    <div>
                      <p className="text-white/40 uppercase text-[8px] font-bold">Blood group config</p>
                      <p className="text-white font-semibold font-mono mt-0.5">{selectedDriver.blood_group}</p>
                    </div>
                  </div>
                </Card>

                {/* Notes */}
                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Internal dispatcher notes</p>
                  <p className="p-3 bg-bg-primary border border-white/5 rounded-xl text-white/60 leading-relaxed">
                    {selectedDriver.notes || 'No administrative logs attached to this node.'}
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VIOLATIONS */}
            {activeDrawerTab === 'violations' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-bold text-white text-sm">Infraction & Violation Record</h4>

                {selectedDriver.violation_history.length > 0 ? (
                  selectedDriver.violation_history.map(v => (
                    <div key={v.id} className="p-3 bg-brand-danger/5 border border-brand-danger/10 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{v.type}</p>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">{v.date}</p>
                      </div>
                      <Badge variant="danger" size="sm" className="px-2 py-0.5 text-[9px] font-mono font-bold">
                        +{v.points} CDL Points
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-white/30 space-y-2 border border-dashed border-white/10 rounded-2xl">
                    <Award className="w-8 h-8 text-white/10 mx-auto" />
                    <p className="font-semibold text-white">Perfect Safety Compliance</p>
                    <p className="text-[11px]">No hard-braking or license demerit points registered.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: DOCUMENTS */}
            {activeDrawerTab === 'documents' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-bold text-white text-sm font-bold">Verification Checklist</h4>
                
                <div className="space-y-2.5">
                  {selectedDriver.documents.map((doc, idx) => {
                    const iconMap = {
                      valid: <CheckCircle className="w-5 h-5 text-brand-success" />,
                      missing: <AlertTriangle className="w-5 h-5 text-brand-danger" />,
                      expiring: <Clock className="w-5 h-5 text-brand-warning" />
                    };
                    return (
                      <div key={idx} className="p-3.5 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {iconMap[doc.status]}
                          <div>
                            <p className="font-semibold text-white">{doc.name}</p>
                            <p className="text-[10px] text-white/40">
                              {doc.expiryDate ? `Expires: ${doc.expiryDate}` : 'Lifetime verified'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-white/30 capitalize">{doc.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: CONTACT */}
            {activeDrawerTab === 'contact' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-bold text-white text-sm">Emergency & Communications</h4>
                
                <Card variant="outlined" padding="lg" className="bg-white/2 border-white/5 space-y-3.5">
                  <div className="flex items-center gap-3.5">
                    <Phone className="w-4 h-4 text-white/40" />
                    <div>
                      <p className="text-white/40 text-[9px] uppercase font-bold">Phone Number</p>
                      <p className="text-white font-semibold font-mono">{selectedDriver.contact_number}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <Mail className="w-4 h-4 text-white/40" />
                    <div>
                      <p className="text-white/40 text-[9px] uppercase font-bold">Work Email</p>
                      <p className="text-white font-semibold font-mono">{selectedDriver.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <Compass className="w-4 h-4 text-white/40" />
                    <div>
                      <p className="text-white/40 text-[9px] uppercase font-bold">Home Terminal Address</p>
                      <p className="text-white font-semibold leading-relaxed">{selectedDriver.address}</p>
                    </div>
                  </div>
                </Card>

                <div className="p-4 bg-white/2 border border-brand-danger/10 rounded-xl space-y-1 bg-brand-danger/2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-brand-danger shrink-0" />
                    <p className="font-bold text-white">Emergency Contact</p>
                  </div>
                  <p className="text-white/70 font-semibold leading-relaxed mt-1 text-[11px]">
                    {selectedDriver.emergency_contact}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Drawer Actions */}
          <div className="p-5 border-t border-white/5 flex gap-2.5 bg-black/15 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextStatus = selectedDriver.status === 'Suspended' ? 'Available' : 'Suspended';
                setDrivers(prev =>
                  prev.map(d => (d.id === selectedDriver.id ? { ...d, status: nextStatus } : d))
                );
                setSelectedDriver(prev => prev ? { ...prev, status: nextStatus } : null);
                addToast(`Driver ${selectedDriver.name} is now ${nextStatus}`, 'warning');
                addLog('driver', `Dispatcher overridden: ${selectedDriver.name} set to ${nextStatus}`, 'warning');
              }}
            >
              {selectedDriver.status === 'Suspended' ? 'Unsuspend Driver' : 'Suspend Road Dispatches'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => addToast('Simulating: Dispatch medical certification audit request.', 'info')}
            >
              Request Document Audit
            </Button>
          </div>
        </div>
      )}

      {/* Onboard Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl overflow-hidden bg-bg-secondary border border-white/10 shadow-2xl rounded-2xl flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Onboard Transit Operator</h3>
                <p className="text-[10px] text-white/50 font-medium">Add driver profile to the corporate database network</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Form content */}
            <form onSubmit={handleAddDriverSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[450px]">
              
              {/* Photo upload UI simulator */}
              <div className="p-4 border border-dashed border-white/10 rounded-xl text-center space-y-1.5 bg-black/10">
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center mx-auto text-white/40">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-xs text-white/60">Upload Operator Profile Photograph</div>
                <div className="text-[10px] text-white/30">Drag-and-drop or select JPG, PNG (Max 3MB)</div>
              </div>

              {/* Form grids */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Full name */}
                <Input
                  label="Full Name*"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />

                {/* Email */}
                <Input
                  label="Work Email*"
                  type="email"
                  required
                  placeholder="e.g. sarah@transitops.com"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                />

                {/* License category */}
                <Select
                  label="License Classification"
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  options={[
                    { value: 'Class A CDL', label: 'Class A CDL (Heavy tractor-trailer)' },
                    { value: 'Class B CDL', label: 'Class B CDL (Single-unit box truck)' },
                    { value: 'Class C CDL', label: 'Class C CDL (Local van driver)' }
                  ]}
                />

                {/* License Number */}
                <Input
                  label="CDL License Number*"
                  required
                  placeholder="CDL-TX-00000"
                  value={formLicenseNo}
                  onChange={e => setFormLicenseNo(e.target.value)}
                />

                {/* CDL Expiry Date */}
                <div className="space-y-1">
                  <label className="font-semibold text-white/60">CDL Expiry Date*</label>
                  <Input
                    type="date"
                    required
                    value={formExpiryDate}
                    onChange={e => setFormExpiryDate(e.target.value)}
                  />
                </div>

                {/* Phone */}
                <Input
                  label="Contact Number*"
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                />

                {/* Experience in years */}
                <Input
                  label="Years of Experience*"
                  type="number"
                  required
                  placeholder="e.g. 5"
                  value={formExperience}
                  onChange={e => setFormExperience(e.target.value)}
                />

                {/* Blood group */}
                <Select
                  label="Blood Group Config"
                  value={formBloodGroup}
                  onChange={e => setFormBloodGroup(e.target.value)}
                  options={[
                    { value: 'O+', label: 'O+' },
                    { value: 'O-', label: 'O-' },
                    { value: 'A+', label: 'A+' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B-', label: 'B-' },
                    { value: 'AB+', label: 'AB+' },
                    { value: 'AB-', label: 'AB-' }
                  ]}
                />
              </div>

              {/* Emergency Contact */}
              <Input
                label="Emergency Contact Details (Name, Relation, Phone)"
                placeholder="e.g. John Connor (Son) - +1 (555) 123-4567"
                value={formEmergencyContact}
                onChange={e => setFormEmergencyContact(e.target.value)}
              />

              {/* Home Address */}
              <Input
                label="Home Terminal Address"
                placeholder="Street, City, State, ZIP"
                value={formAddress}
                onChange={e => setFormAddress(e.target.value)}
              />

              {/* Notes */}
              <Textarea
                label="Compliance & Dispatch Notes"
                rows={2}
                placeholder="Hazmat certifications, driving restrictions, etc."
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
              />

            </form>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/5 flex justify-between items-center bg-black/15">
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
                  disabled={autoSaveActive}
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Onboard Contractor Node
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};