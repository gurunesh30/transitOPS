import React, { useState } from 'react';
import { AppContextProvider, useApp } from './context/AppContext';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { VehicleRegistryView } from './views/VehicleRegistryView';
import { DriverManagementView } from './views/DriverManagementView';
import { CommandPalette } from './components/CommandPalette';
import { OnboardingTour } from './components/OnboardingTour';
import { SidebarLayout } from './components/common/SidebarLayout';
import { ToastContainer } from './components/ui';
import { Search, Bell, Palette, Calendar } from 'lucide-react';

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
    addToast,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

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

  const user = {
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    initials: currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase(),
  };

  return (
    <SidebarLayout
      activePage={activePage}
      onNavigate={(page: string) => setActivePage(page as any)}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      user={user}
      onLogout={handleLogout}
    >
      {/* TOP NAV BAR */}
      <header className="h-16 bg-bg-secondary/80 backdrop-blur-md border-b border-border-primary flex items-center justify-between px-6 shrink-0 relative z-30 shadow-sm">
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
            className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/5 hover:border-white/10 bg-bg-primary/50 text-xs text-white/40 hover:text-white/60 transition-all cursor-pointer font-medium"
            id="search-shortcut"
            aria-label="Open command palette"
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
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {/* Static unread indicator */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-warning" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-white/10 bg-bg-secondary shadow-2xl p-4 z-40 space-y-3.5 animate-scale-up">
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
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-warning mt-1.5 shrink-0" />
                    <p className="text-white/70 leading-normal">
                      CDL license expiration threshold warning for driver Marcus Miller (expiring within 30 days).
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-danger mt-1.5 shrink-0" />
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
              <div className="absolute right-0 mt-2.5 w-48 rounded-xl border border-white/10 bg-bg-secondary shadow-2xl p-2 z-40 space-y-1 animate-scale-up">
                <div className="text-[10px] text-white/40 font-bold px-2.5 py-1 border-b border-white/5 uppercase">Select Theme</div>

                <button
                  onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
                  className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                    theme === 'dark' ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>Dark Professional</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary shrink-0" />
                </button>

                <button
                  onClick={() => { setTheme('midnight'); setShowThemeMenu(false); }}
                  className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                    theme === 'midnight' ? 'bg-brand-info/10 text-brand-info font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>Midnight Black</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-info shrink-0" />
                </button>

                <button
                  onClick={() => { setTheme('corporate'); setShowThemeMenu(false); }}
                  className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                    theme === 'corporate' ? 'bg-brand-secondary/10 text-brand-secondary font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>Corporate Blue</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-secondary shrink-0" />
                </button>
              </div>
            )}
          </div>

          {/* Profile Avatar & role badge */}
          <div className="flex items-center gap-2.5 border-l border-white/5 pl-4" id="role-badge">
            <span className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full font-bold text-white/80 select-none">
              {currentUser.role}
            </span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white text-xs shrink-0 select-none">
              {user.initials}
            </div>
          </div>
        </div>
      </header>

      {/* View Main Content Container Panel */}
      <section className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto" id="reorder-widgets">
        {renderActiveView()}
      </section>

      {/* UNIVERSAL OVERLAYS AND SIMULATION MODALS */}
      <CommandPalette />
      <OnboardingTour />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Simulated Session Expiration popup window modal */}
      {sessionExpired && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel border-brand-primary/30 rounded-2xl p-6 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="inline-flex items-center justify-center p-3.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <svg className="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
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
                setCurrentUser(null);
              }}
              className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary-hover transition-colors text-xs"
            >
              Re-Authenticate Terminal
            </button>
          </div>
        </div>
      )}
    </SidebarLayout>
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