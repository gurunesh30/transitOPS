import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Sparkles, Truck, User as UserIcon, Settings, CornerDownLeft, Star, Clock } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    ctrlKOpen,
    setCtrlKOpen,
    vehicles,
    drivers,
    setActivePage,
    setTheme,
    favorites,
    recentViews,
    setSessionExpired,
    resetFailedAttempts,
    addToast
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ctrlKOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [ctrlKOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setCtrlKOpen(false);
      }
    };
    if (ctrlKOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ctrlKOpen]);

  if (!ctrlKOpen) return null;

  // Define static commands
  const commands = [
    { id: 'goto_dashboard', label: 'Go to Dashboard', category: 'Navigation', action: () => setActivePage('dashboard') },
    { id: 'goto_vehicles', label: 'Go to Vehicles', category: 'Navigation', action: () => setActivePage('vehicles') },
    { id: 'goto_drivers', label: 'Go to Drivers', category: 'Navigation', action: () => setActivePage('drivers') },
    { id: 'theme_dark', label: 'Switch to Dark Professional Theme', category: 'Settings', action: () => setTheme('dark') },
    { id: 'theme_midnight', label: 'Switch to Midnight Theme', category: 'Settings', action: () => setTheme('midnight') },
    { id: 'theme_corporate', label: 'Switch to Corporate Blue Theme', category: 'Settings', action: () => setTheme('corporate') },
    { id: 'sim_session', label: 'Simulate Session Expiry', category: 'Simulation', action: () => setSessionExpired(true) },
    { id: 'sim_reset_lockout', label: 'Reset Account Failed Attempts Lockout', category: 'Simulation', action: () => { resetFailedAttempts(); addToast('Auth failed attempts reset.', 'success'); } }
  ];

  // Filter vehicles, drivers and commands
  const filteredVehicles = query
    ? vehicles.filter(v =>
        v.model.toLowerCase().includes(query.toLowerCase()) ||
        v.registration_number.toLowerCase().includes(query.toLowerCase()) ||
        v.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredDrivers = query
    ? drivers.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.license_number.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredCommands = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const totalResults = [
    ...filteredCommands.map(c => ({ ...c, type: 'command' })),
    ...filteredVehicles.map(v => ({ id: v.id, label: `${v.model} (${v.registration_number})`, category: 'Vehicles', type: 'vehicle', item: v })),
    ...filteredDrivers.map(d => ({ id: d.id, label: `${d.name} - ${d.license_category}`, category: 'Drivers', type: 'driver', item: d }))
  ];

  // If query is empty, display favorites and recents
  const hasResults = totalResults.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (hasResults ? totalResults.length : 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (hasResults ? totalResults.length : 1)) % (hasResults ? totalResults.length : 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hasResults) {
        triggerAction(totalResults[selectedIndex]);
      }
    }
  };

  const triggerAction = (result: any) => {
    if (result.type === 'command') {
      result.action();
    } else if (result.type === 'vehicle') {
      setActivePage('vehicles');
      // For vehicle details drawer, we will highlight or select the vehicle in that view
      addToast(`Navigating to vehicle ${result.item.model}`, 'info');
    } else if (result.type === 'driver') {
      setActivePage('drivers');
      addToast(`Navigating to driver ${result.item.name}`, 'info');
    }
    setCtrlKOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        ref={containerRef}
        className="w-full max-w-2xl overflow-hidden glass-panel rounded-2xl border border-white/10 shadow-2xl shadow-black/80 flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-white/50 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search vehicles, drivers, commands... (e.g. 'Volvo', 'Sarah', 'Midnight')"
            className="w-full bg-transparent border-0 text-white placeholder-white/30 focus:outline-none focus:ring-0 text-md"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="flex items-center gap-1 shrink-0 bg-white/5 px-2 py-1 rounded text-xs text-white/40 border border-white/10">
            <span>ESC</span>
          </div>
        </div>

        {/* Search Results / Recents Dashboard */}
        <div className="max-h-[360px] overflow-y-auto p-2">
          {query === '' ? (
            <div className="p-2 space-y-4">
              {/* Favorites Panel */}
              {favorites.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Favorite Vehicles</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mt-2">
                    {vehicles.filter(v => favorites.includes(v.id)).map(v => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setActivePage('vehicles');
                          setCtrlKOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group border border-white/5 hover:border-white/15"
                      >
                        <div className="p-1.5 rounded bg-amber-500/10 text-amber-500 shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-white truncate">{v.model}</p>
                          <p className="text-xs text-white/50 font-mono truncate">{v.registration_number}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recently Viewed Panel */}
              {recentViews.length > 0 ? (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Recently Viewed</span>
                  </div>
                  <div className="space-y-1 mt-2">
                    {recentViews.map((item, idx) => (
                      <button
                        key={`${item.type}_${item.id}_${idx}`}
                        onClick={() => {
                          setActivePage(item.type === 'vehicle' ? 'vehicles' : 'drivers');
                          setCtrlKOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/0 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          {item.type === 'vehicle' ? (
                            <Truck className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-blue-400" />
                          )}
                          <span className="text-sm font-medium text-white/80">{item.name}</span>
                          <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-white/40 capitalize">{item.type}</span>
                        </div>
                        <span className="text-xs text-white/30">{item.timestamp}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-white/30 text-sm">
                  Type something to search, or press <span className="font-mono text-white/60">Ctrl + K</span> again to close.
                </div>
              )}
            </div>
          ) : (
            <div>
              {hasResults ? (
                totalResults.map((result, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={`${result.category}_${result.id || result.label}_${index}`}
                      onClick={() => triggerAction(result)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500/20 to-blue-500/20 border border-white/10 text-white pl-4'
                          : 'hover:bg-white/5 text-white/70 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {result.category === 'Navigation' && <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />}
                        {result.category === 'Settings' && <Settings className="w-4 h-4 text-blue-400 shrink-0" />}
                        {result.category === 'Simulation' && <Settings className="w-4 h-4 text-red-400 shrink-0" />}
                        {result.category === 'Vehicles' && <Truck className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {result.category === 'Drivers' && <UserIcon className="w-4 h-4 text-blue-400 shrink-0" />}
                        
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{result.label}</p>
                          <p className="text-xs text-white/40 truncate">{result.category}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-xs text-white/40 font-mono animate-pulse">
                          <span>Select</span>
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-white/30">
                  <p className="text-sm font-semibold">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs mt-1">Double check your spelling or search for something else</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-t border-white/10 text-xs text-white/40 shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">↑↓</span> Move
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">Enter</span> Select
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">Esc</span> Close
            </span>
          </div>
          <div>
            TransitOps Command Palette
          </div>
        </div>
      </div>
    </div>
  );
};
