import React, { useState } from 'react';
import { AppContextProvider, useApp } from './context/AppContext';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { VehicleRegistryView } from './views/VehicleRegistryView';
import { DriverManagementView } from './views/DriverManagementView';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingTour } from './components/OnboardingTour';
import {
  LayoutDashboard,
  Truck,
  Users,
  Search,
  Bell,
  Palette,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  Compass,
  AlertTriangle,
  Info
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    theme,
    setTheme,
    activePage,
    setActivePage,
    sidebarCollapsed,
    setSidebarCollapsed,
    setCtrlKOpen,
    toasts,
    removeToast,
    sessionExpired,
    setSessionExpired,
    addToast
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // If user is not authenticated, render Login Gate
  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  // Sidebar navigation options
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'vehicles', label: 'Vehicles', icon: <Truck className="w-4 h-4" /> },
    { id: 'drivers', label: 'Drivers', icon: <Users className="w-4 h-4" /> }
  ] as const;

  // Active view router mapping
  const renderActiveView = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView />;
      case 'vehicles':
        return <VehicleRegistryView />;
      case 'drivers':
        return <DriverManagementView />;
      default:
        return <DashboardView />;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    addToast('Logged out of telemetry session.', 'info');
  };

  return (
    <div className="flex h-screen w-screen bg-[#0F1115] text-[#F3F4F6] overflow-hidden select-none">
      
      {/* LEFT PERSISTENT SIDEBAR PANEL */}
      <aside
        className={`bg-[#1B1E24]/90 border-r border-[#2A2E36] flex flex-col justify-between transition-all duration-300 relative z-20 shrink-0 ${
          sidebarCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 bg-black/10">
            {!sidebarCollapsed && (
              <span className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 animate-fade-in">
                <span className="p-1 rounded bg-amber-500 text-white shrink-0">
                  <Compass className="w-4 h-4" />
                </span>
                <span>Transit<span className="text-amber-500">Ops</span></span>
              </span>
            )}
            
            {sidebarCollapsed && (
              <span className="p-1 rounded bg-amber-500 text-white mx-auto">
                <Compass className="w-4 h-4" />
              </span>
            )}

            {/* Collapse toggle arrow */}
            {!sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Links list */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25 shadow-lg shadow-amber-500/5'
                      : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-amber-500' : 'text-white/40 group-hover:text-white'}>
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span className="animate-fade-in">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Collapsed sidebar open trigger */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white mx-auto mb-4"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Sidebar Footer User detail card */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-white/5 bg-black/10 flex flex-col gap-3 animate-fade-in shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-blue-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                AM
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-white/40 font-mono truncate">{currentUser.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-xs font-bold text-white/70 hover:text-red-400 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Terminal</span>
            </button>
          </div>
        )}
      </aside>

      {/* MAIN LAYOUT WORKING VIEW */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        
        {/* TOP NAV BAR CONTEXT */}
        <header className="h-16 bg-[#1B1E24]/80 backdrop-blur-md border-b border-[#2A2E36] flex items-center justify-between px-6 shrink-0 relative z-30 shadow-sm">
          {/* Left Area: Breadcrumbs & Universal Search trigger */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/40">
              <span className="hover:text-white cursor-pointer" onClick={() => setActivePage('dashboard')}>
                TransitOps
              </span>
              <span>/</span>
              <span className="text-white capitalize font-bold">{activePage}</span>
            </div>

            {/* Click-to-Search input box helper */}
            <button
              onClick={() => setCtrlKOpen(true)}
              className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/5 hover:border-white/10 bg-[#0F1115]/50 text-xs text-white/40 hover:text-white/60 transition-all cursor-pointer font-medium"
              id="search-shortcut"
            >
              <Search className="w-3.5 h-3.5 text-white/30" />
              <span>Search platform...</span>
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/5">
                Ctrl + K
              </span>
            </button>
          </div>

          {/* Right Area: Tools, Notifications pop, and Avatars */}
          <div className="flex items-center gap-4">
            {/* Quick date display */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-white/40 font-semibold font-mono">
              <Calendar className="w-3.5 h-3.5 text-white/30" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>

            {/* Live Notifications bell popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-white/10 bg-[#1B1E24] shadow-2xl p-4 z-40 space-y-3.5 animate-scale-up">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white">System Logs</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-white/40 hover:text-white text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    <div className="flex gap-2 text-xs items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <p className="text-white/70 leading-normal">
                        CDL license expiration threshold warning for driver Marcus Miller (expiring within 30 days).
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <p className="text-white/70 leading-normal">
                        Dave Rodriguez driver status suspended (expired CDL operations warning).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic theme switcher drop */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1.5"
                title="Select Theme"
              >
                <Palette className="w-4 h-4" />
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2.5 w-48 rounded-xl border border-white/10 bg-[#1B1E24] shadow-2xl p-2 z-40 space-y-1 animate-scale-up">
                  <div className="text-[10px] text-white/40 font-bold px-2.5 py-1 border-b border-white/5 uppercase">Select Theme</div>
                  
                  <button
                    onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                    className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                      theme === 'dark' ? 'bg-amber-500/10 text-amber-500 font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>Dark Professional</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  </button>

                  <button
                    onClick={() => { setTheme('midnight'); setShowThemeMenu(false); }}
                    className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                      theme === 'midnight' ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>Midnight Black</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                  </button>

                  <button
                    onClick={() => { setTheme('corporate'); setShowThemeMenu(false); }}
                    className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                      theme === 'corporate' ? 'bg-blue-500/10 text-blue-400 font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>Corporate Blue</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar & role badge */}
            <div className="flex items-center gap-2.5 border-l border-white/5 pl-4" id="role-badge">
              <span className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full font-bold text-white/80 select-none">
                {currentUser.role}
              </span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-blue-500 flex items-center justify-center font-bold text-white text-xs shrink-0 select-none">
                AM
              </div>
            </div>
          </div>
        </header>

        {/* View Main Content Container Panel */}
        <section className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto" id="reorder-widgets">
          {renderActiveView()}
        </section>

      </main>

      {/* UNIVERSAL OVERLAYS AND SIMULATION MODALS */}
      <CommandPalette />
      <OnboardingTour />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Simulated Session Expiration popup window modal */}
      {sessionExpired && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel border-amber-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">Terminal Session Expired</h2>
              <p className="text-xs text-white/60 leading-relaxed">
                For commercial transport security, operational tokens expire after inactivity. Re-verify your terminal access passkey.
              </p>
            </div>
            <button
              onClick={() => {
                setSessionExpired(false);
                setCurrentUser(null); // Force Login gate re-render
              }}
              className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors text-xs"
            >
              Re-Authenticate Terminal
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// Toast Notifications Container helper component
interface ToastContainerProps {
  toasts: any[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const typeMap: Record<'success' | 'warning' | 'danger' | 'info', { border: string; icon: React.ReactNode }> = {
          success: { border: 'border-emerald-500/20 bg-emerald-950/70 text-emerald-400', icon: <CheckCircle className="w-4 h-4 shrink-0" /> },
          warning: { border: 'border-amber-500/20 bg-amber-950/70 text-amber-400', icon: <AlertTriangle className="w-4 h-4 shrink-0" /> },
          danger: { border: 'border-red-500/20 bg-red-950/70 text-red-400', icon: <AlertTriangle className="w-4 h-4 shrink-0" /> },
          info: { border: 'border-blue-500/20 bg-blue-950/70 text-blue-400', icon: <Info className="w-4 h-4 shrink-0" /> }
        };
        const activeTheme = typeMap[toast.type as 'success' | 'warning' | 'danger' | 'info'] || typeMap.info;

        return (
          <div
            key={toast.id}
            className={`p-3.5 px-4 rounded-xl border backdrop-blur-md flex items-start justify-between gap-3 shadow-lg shadow-black/40 pointer-events-auto animate-slide-in ${activeTheme.border}`}
          >
            <div className="flex gap-2.5 items-start">
              <span className="mt-0.5">{activeTheme.icon}</span>
              <div className="text-xs">
                {toast.title && <p className="font-bold text-white">{toast.title}</p>}
                <p className="text-white/80 leading-relaxed mt-0.5">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  );
};

export default App;
