import React from 'react';
import { LayoutDashboard, Truck, Users, Route, Wrench, IndianRupee, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  user?: {
    name: string;
    email: string;
    role: string;
    initials: string;
  };
  onLogout?: () => void;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  activePage,
  onNavigate,
  sidebarCollapsed = false,
  onToggleSidebar,
  user,
  onLogout,
}) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Vehicles', icon: Truck, id: 'vehicles' },
    { name: 'Drivers', icon: Users, id: 'drivers' },
    { name: 'Trips', icon: Route, id: 'trips' },
    { name: 'Maintenance', icon: Wrench, id: 'maintenance' },
    { name: 'Expenses', icon: IndianRupee, id: 'expenses' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      {/* Persistent Sidebar */}
      <aside
        className={`
          bg-bg-secondary/90 border-r border-border-primary
          flex flex-col justify-between
          transition-all duration-300 relative z-20 shrink-0
          ${sidebarCollapsed ? 'w-18' : 'w-64'}
        `}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 bg-black/10">
            {!sidebarCollapsed && (
              <span className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 animate-fade-in">
                <span className="p-1 rounded bg-brand-primary text-white shrink-0">
                  <Compass className="w-4 h-4" />
                </span>
                <span>Transit<span className="text-brand-primary">Ops</span></span>
              </span>
            )}

            {sidebarCollapsed && (
              <span className="p-1 rounded bg-brand-primary text-white mx-auto">
                <Compass className="w-4 h-4" />
              </span>
            )}

            {/* Collapse toggle arrow */}
            {!sidebarCollapsed && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Collapsed sidebar expand button — shown at top when collapsed */}
          {sidebarCollapsed && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-full py-2.5 mt-1 text-white/50 hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Navigation Links list */}
          <nav className="p-3 space-y-1">
            {menuItems.map(item => {
              const isActive = activePage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`
                    flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all
                    ${isActive
                      ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/25 shadow-lg shadow-brand-primary/5'
                      : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                    }
                  `}
                >
                  <span className={isActive ? 'text-brand-primary' : 'text-white/40 group-hover:text-white'}>
                    <Icon className="w-4 h-4" />
                  </span>
                  {!sidebarCollapsed && <span className="animate-fade-in">{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User detail card */}
        {!sidebarCollapsed && user && (
          <div className="p-4 border-t border-white/5 bg-black/10 flex flex-col gap-3 animate-fade-in shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white text-xs shrink-0">
                {user.initials}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-white/40 font-mono truncate">{user.email}</p>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-brand-danger/10 border border-white/5 hover:border-brand-danger/20 text-xs font-bold text-white/70 hover:text-brand-danger transition-all flex items-center justify-center gap-2"
              >
                <span className="w-3.5 h-3.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                <span>Disconnect Terminal</span>
              </button>
            )}
          </div>
        )}
      </aside>

      {/* MAIN LAYOUT WORKING VIEW */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {children}
      </main>
    </div>
  );
};