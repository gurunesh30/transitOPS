const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('transitops_token', token);
  } else {
    localStorage.removeItem('transitops_token');
  }
};

export const getAuthToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem('transitops_token');
  }
  return authToken;
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      '/auth/login',
      { email, password }
    ),
};

export const vehiclesApi = {
  list: () =>
    api.get<
      Array<{
        id: string;
        registration_number: string;
        model: string;
        type: string;
        max_load_capacity: number;
        odometer: number;
        acquisition_cost: number;
        status: string;
        fuel_type: string;
        purchase_date: string;
        insurance_expiry: string;
        region: string;
      }>
    >('/vehicles'),
  create: (data: {
    registration_number: string;
    model: string;
    type: string;
    max_load_capacity: number;
    fuel_type: string;
    purchase_date: string;
    insurance_expiry: string;
    region: string;
  }) => api.post('/vehicles', data),
};

export const tripsApi = {
  list: () =>
    api.get<
      Array<{
        id: string;
        source: string;
        destination: string;
        status: string;
        cargo_weight: number;
        planned_distance: number;
        vehicle_id: string;
        driver_id: string;
        created_at: string;
        completed_at?: string;
      }>
    >('/trips'),
  create: (data: {
    source: string;
    destination: string;
    cargo_weight: number;
    planned_distance: number;
    vehicle_id: string;
    driver_id: string;
  }) => api.post('/trips', data),
  complete: (id: string) => api.post(`/trips/${id}/complete`, {}),
};

export const driversApi = {
  list: () =>
    api.get<
      Array<{
        id: string;
        name: string;
        license_number: string;
        license_category: string;
        license_expiry_date: string;
        contact_number: string;
        safety_score: number;
        status: string;
      }>
    >('/drivers'),
  create: (data: {
    name: string;
    license_number: string;
    license_category: string;
    license_expiry_date: string;
    contact_number: string;
  }) => api.post('/drivers', data),
};

export const reportsApi = {
  dashboard: () =>
    api.get<{
      total_vehicles: number;
      active_trips: number;
      available_drivers: number;
      maintenance_alerts: number;
      fleet_utilization: number;
      monthly_revenue: number;
      fuel_efficiency: number;
      safety_score: number;
    }>('/analytics/dashboard'),
  export: () => api.get('/analytics/export'),
};