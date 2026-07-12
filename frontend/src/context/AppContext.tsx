import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole, Trip } from '../types';
import { mockVehicles, mockDrivers, mockTrips, mockActivityLogs } from '../data/mockData';
import type { ExtendedVehicle, ExtendedDriver, ActivityLog } from '../data/mockData';
import { setAuthToken, vehiclesApi, driversApi, tripsApi, authApi } from '../services/api';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
}

interface AppContextProps {
  // Auth state
  currentUser: User | null;
  selectedRole: UserRole;
  setCurrentUser: (user: User | null) => void;
  setSelectedRole: (role: UserRole) => void;
  failedAttempts: number;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  lastLoginTime: string | null;
  setLastLoginTime: (time: string | null) => void;
  
  // Theme state
  theme: 'dark' | 'midnight' | 'corporate';
  setTheme: (theme: 'dark' | 'midnight' | 'corporate') => void;
  
  // Navigation
  activePage: 'dashboard' | 'vehicles' | 'drivers' | 'trips';
  setActivePage: (page: 'dashboard' | 'vehicles' | 'drivers' | 'trips') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Command palette
  ctrlKOpen: boolean;
  setCtrlKOpen: (open: boolean) => void;
  favorites: string[]; // vehicle IDs
  toggleFavorite: (vehicleId: string) => void;
  recentViews: { id: string; type: 'vehicle' | 'driver'; name: string; timestamp: string }[];
  addRecentView: (id: string, type: 'vehicle' | 'driver', name: string) => void;
  
  // Data lists
  vehicles: ExtendedVehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<ExtendedVehicle[]>>;
  drivers: ExtendedDriver[];
  setDrivers: React.Dispatch<React.SetStateAction<ExtendedDriver[]>>;
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  logs: ActivityLog[];
  addLog: (type: ActivityLog['type'], message: string, status: ActivityLog['status']) => void;
  
  // Personalization
  widgetOrder: string[];
  setWidgetOrder: (order: string[]) => void;
  
  // Simulation popups
  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  autoSaveActive: boolean;
  triggerAutoSave: () => void;
  
  // Onboarding tour
  tourActive: boolean;
  setTourActive: (active: boolean) => void;
  tourStep: number;
  setTourStep: (step: number) => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (message: string, type: Toast['type'], title?: string) => void;
  removeToast: (id: string) => void;

  // Auth API
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadAllData: () => Promise<void>;
  refreshVehicles: () => Promise<void>;
  refreshDrivers: () => Promise<void>;
  refreshTrips: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read theme from localStorage or default to 'dark'
  const [theme, setThemeState] = useState<'dark' | 'midnight' | 'corporate'>(
    (localStorage.getItem('transitops-theme') as any) || 'dark'
  );
  
  const setTheme = (newTheme: 'dark' | 'midnight' | 'corporate') => {
    setThemeState(newTheme);
    localStorage.setItem('transitops-theme', newTheme);
  };

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Fleet Manager');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lastLoginTime, setLastLoginTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Navigation
  const [activePage, setActivePage] = useState<'dashboard' | 'vehicles' | 'drivers' | 'trips'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Command palette & Search
  const [ctrlKOpen, setCtrlKOpen] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(['v1', 'v4']);
  const [recentViews, setRecentViews] = useState<AppContextProps['recentViews']>([]);

  const toggleFavorite = (vehicleId: string) => {
    setFavorites(prev => 
      prev.includes(vehicleId) ? prev.filter(id => id !== vehicleId) : [...prev, vehicleId]
    );
    addToast(
      favorites.includes(vehicleId) ? 'Removed from favorites' : 'Added to favorites',
      'info'
    );
  };

  const addRecentView = (id: string, type: 'vehicle' | 'driver', name: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRecentViews(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => !(item.id === id && item.type === type));
      // Put at the front, limit to 5 items
      return [{ id, type, name, timestamp }, ...filtered].slice(0, 5);
    });
  };

  // Data lists
  const [vehicles, setVehicles] = useState<ExtendedVehicle[]>(mockVehicles);
  const [drivers, setDrivers] = useState<ExtendedDriver[]>(mockDrivers);
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [logs, setLogs] = useState<ActivityLog[]>(mockActivityLogs);

  const addLog = (type: ActivityLog['type'], message: string, status: ActivityLog['status']) => {
    const newLog: ActivityLog = {
      id: `l_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      status,
      user: currentUser?.name || 'System'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Draggable / reorderable dashboard widget order
  const [widgetOrder, setWidgetOrder] = useState<string[]>(['kpis', 'charts', 'timeline', 'widgets']);

  // Simulation popups
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [autoSaveActive, setAutoSaveActive] = useState<boolean>(false);

  const triggerAutoSave = () => {
    setAutoSaveActive(true);
    setTimeout(() => setAutoSaveActive(false), 800);
  };

  // Onboarding tour
  const [tourActive, setTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const addToast = (message: string, type: Toast['type'], title?: string) => {
    const id = `toast_${Date.now()}`;
    const newToast: Toast = { id, message, type, title };
    setToasts(prev => [...prev, newToast]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Failed attempts increment & account lock logic
  const incrementFailedAttempts = () => {
    setFailedAttempts(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setIsLocked(true);
        addToast('Account has been locked due to 5 failed attempts.', 'danger', 'Security Alert');
        addLog('alert', 'User account locked due to consecutive authentication failures.', 'danger');
      }
      return next;
    });
  };

  const resetFailedAttempts = () => {
    setFailedAttempts(0);
    setIsLocked(false);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCtrlKOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCtrlKOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulating a Session Expiration after 3 minutes of inactivity, or just trigger a periodic event
  useEffect(() => {
    if (!currentUser) return;
    
    // Set a timer for 120 seconds to simulate a session expiry trigger for demo
    const timer = setTimeout(() => {
      setSessionExpired(true);
      addToast('Your session has expired. Please authenticate again.', 'warning', 'Session Timeout');
    }, 150000); // 2.5 minutes
    
    return () => clearTimeout(timer);
  }, [currentUser]);

  // API integration functions
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user } = await authApi.login(email, password);
      setAuthToken(token);
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
      });
      setLastLoginTime(new Date().toISOString());
      resetFailedAttempts();
      await loadAllData();
      addToast(`Welcome back, ${user.name}!`, 'success', 'Login Successful');
      return true;
    } catch (error) {
      incrementFailedAttempts();
      addToast(error instanceof Error ? error.message : 'Invalid credentials', 'danger', 'Login Failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setCurrentUser(null);
    setLastLoginTime(null);
    setVehicles(mockVehicles);
    setDrivers(mockDrivers);
    setTrips(mockTrips);
    setLogs(mockActivityLogs);
    addToast('You have been logged out', 'info');
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      const [vehiclesData, driversData, tripsData] = await Promise.all([
        vehiclesApi.list(),
        driversApi.list(),
        tripsApi.list(),
      ]);
      
      setVehicles(vehiclesData.map((v: any) => ({
        ...v,
        fuel_type: v.fuel_type,
        purchase_date: v.purchase_date,
        insurance_expiry: v.insurance_expiry,
        photo: `https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=60`,
        notes: '',
        region: v.region,
        timeline: [],
        maintenance_history: [],
        trip_history: [],
        fuel_statistics: { avg_mpg: 7, current_level: 50, monthly_cost: 3000 },
      })));
      
      setDrivers(driversData.map((d: any) => ({
        ...d,
        photo: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60`,
        email: `${d.name.toLowerCase().replace(' ', '.')}@transitops.com`,
        address: '',
        experience: 5,
        blood_group: 'O+',
        emergency_contact: '',
        notes: '',
        completed_trips: 0,
        violation_history: [],
        documents: [],
        rating: 4.5,
      })));
      
      setTrips(tripsData.map((t: any) => ({
        id: t.id,
        source: t.source,
        destination: t.destination,
        status: t.status,
        cargo_weight: t.cargo_weight,
        planned_distance: t.planned_distance,
        vehicle_id: t.vehicle_id,
        driver_id: t.driver_id,
        created_at: t.created_at,
        completed_at: t.completed_at,
      })));
    } catch (error) {
      addToast('Failed to load data from server. Using mock data.', 'warning');
      setVehicles(mockVehicles);
      setDrivers(mockDrivers);
      setTrips(mockTrips);
    }
  }, []);

  const refreshVehicles = useCallback(async () => {
    try {
      const data = await vehiclesApi.list();
      setVehicles(data.map((v: any) => ({
        ...v,
        fuel_type: v.fuel_type,
        purchase_date: v.purchase_date,
        insurance_expiry: v.insurance_expiry,
        photo: `https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=60`,
        notes: '',
        region: v.region,
        timeline: [],
        maintenance_history: [],
        trip_history: [],
        fuel_statistics: { avg_mpg: 7, current_level: 50, monthly_cost: 3000 },
      })));
    } catch (error) {
      addToast('Failed to refresh vehicles', 'warning');
    }
  }, []);

  const refreshDrivers = useCallback(async () => {
    try {
      const data = await driversApi.list();
      setDrivers(data.map((d: any) => ({
        ...d,
        photo: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60`,
        email: `${d.name.toLowerCase().replace(' ', '.')}@transitops.com`,
        address: '',
        experience: 5,
        blood_group: 'O+',
        emergency_contact: '',
        notes: '',
        completed_trips: 0,
        violation_history: [],
        documents: [],
        rating: 4.5,
      })));
    } catch (error) {
      addToast('Failed to refresh drivers', 'warning');
    }
  }, []);

  const refreshTrips = useCallback(async () => {
    try {
      const data = await tripsApi.list();
      setTrips(data.map((t: any) => ({
        id: t.id,
        source: t.source,
        destination: t.destination,
        status: t.status,
        cargo_weight: t.cargo_weight,
        planned_distance: t.planned_distance,
        vehicle_id: t.vehicle_id,
        driver_id: t.driver_id,
        created_at: t.created_at,
        completed_at: t.completed_at,
      })));
    } catch (error) {
      addToast('Failed to refresh trips', 'warning');
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        selectedRole,
        setCurrentUser,
        setSelectedRole,
        failedAttempts,
        incrementFailedAttempts,
        resetFailedAttempts,
        isLocked,
        setIsLocked,
        lastLoginTime,
        setLastLoginTime,
        theme,
        setTheme,
        activePage,
        setActivePage,
        sidebarCollapsed,
        setSidebarCollapsed,
        ctrlKOpen,
        setCtrlKOpen,
        favorites,
        toggleFavorite,
        recentViews,
        addRecentView,
        vehicles,
        setVehicles,
        drivers,
        setDrivers,
        trips,
        setTrips,
        logs,
        addLog,
        widgetOrder,
        setWidgetOrder,
        sessionExpired,
        setSessionExpired,
        autoSaveActive,
        triggerAutoSave,
        tourActive,
        setTourActive,
        tourStep,
        setTourStep,
        toasts,
        addToast,
        removeToast,
        isLoading,
        login,
        logout,
        loadAllData,
        refreshVehicles,
        refreshDrivers,
        refreshTrips,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
};
