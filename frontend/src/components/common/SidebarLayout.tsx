import React from 'react';
import { LayoutDashboard, Truck, Users, Route, Wrench, IndianRupee } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  activePage: string;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, activePage }) => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Vehicles', icon: Truck, id: 'vehicles' },
    { name: 'Drivers', icon: Users, id: 'drivers' },
    { name: 'Trips', icon: Route, id: 'trips' },
    { name: 'Maintenance', icon: Wrench, id: 'maintenance' },
    { name: 'Expenses', icon: IndianRupee, id: 'expenses' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Persistent Sidebar */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="text-xl font-black tracking-wider pb-6 mb-6 border-b border-slate-700 text-blue-400">
            TransitOps
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <a
                  key={item.id}
                  href={`/${item.id}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-brand-primary text-white' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="text-xs text-slate-500 border-t border-slate-700 pt-4">
          Role: <span className="text-slate-300 font-semibold">Fleet Manager</span>
        </div>
      </aside>

      {/* Main Working View Context */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
          <h1 className="text-lg font-bold text-slate-800 capitalize">{activePage} Management</h1>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse"></span>
            <span className="text-sm font-medium text-slate-600">System Live</span>
          </div>
        </header>
        <section className="p-8 max-w-7xl w-full mx-auto">
          {children}
        </section>
      </main>
    </div>
  );
};