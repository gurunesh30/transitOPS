import type { Vehicle, Driver, Trip, MaintenanceLog, FuelLog } from '../types';

// Let's extend the types locally or use intersection types for detailed attributes
export interface ExtendedVehicle extends Vehicle {
  fuel_type: string;
  purchase_date: string;
  insurance_expiry: string;
  photo: string;
  notes: string;
  region: string;
  timeline: { id: string; date: string; event: string; type: 'info' | 'warning' | 'success' }[];
  maintenance_history: { id: string; date: string; type: string; cost: number; notes: string }[];
  trip_history: { id: string; date: string; route: string; driver: string; distance: number; status: string }[];
  fuel_statistics: { avg_mpg: number; current_level: number; monthly_cost: number };
  isFavorite?: boolean;
}

export interface ExtendedDriver extends Driver {
  photo: string;
  email: string;
  address: string;
  experience: number;
  blood_group: string;
  emergency_contact: string;
  notes: string;
  completed_trips: number;
  violation_history: { id: string; date: string; type: string; points: number }[];
  documents: { name: string; status: 'valid' | 'missing' | 'expiring'; expiryDate?: string }[];
  rating: number; // safety score out of 5 stars derived
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'vehicle' | 'driver' | 'trip' | 'maintenance' | 'alert';
  message: string;
  status: 'success' | 'warning' | 'danger' | 'info';
  user: string;
}

export const mockVehicles: ExtendedVehicle[] = [
  {
    id: 'v1',
    registration_number: 'MH-12-TR-8920',
    model: 'Volvo FH16',
    type: 'Semi-Truck',
    max_load_capacity: 44000,
    odometer: 142050,
    acquisition_cost: 135000,
    status: 'On Trip',
    fuel_type: 'Diesel',
    purchase_date: '2023-04-12',
    insurance_expiry: '2026-10-15',
    photo: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=60',
    notes: 'Primary long-haul tractor. High fuel efficiency.',
    region: 'North',
    timeline: [
      { id: 't1', date: '2026-07-10', event: 'Dispatched on Trip #TR-102', type: 'info' },
      { id: 't2', date: '2026-07-02', event: 'Standard Brake Service completed', type: 'success' },
      { id: 't3', date: '2026-06-15', event: 'Failed emissions audit (resolved)', type: 'warning' }
    ],
    maintenance_history: [
      { id: 'm1', date: '2026-07-02', type: 'Brake Pad Replacement', cost: 1250, notes: 'Replaced front pads and rotors' },
      { id: 'm2', date: '2026-03-10', type: 'Engine Oil & Filter Change', cost: 450, notes: 'Routine synthetic service' }
    ],
    trip_history: [
      { id: 'th1', date: '2026-07-10', route: 'Delhi to Mumbai', driver: 'Marcus Miller', distance: 1400, status: 'Active' },
      { id: 'th2', date: '2026-06-28', route: 'Mumbai to Pune', driver: 'Marcus Miller', distance: 150, status: 'Completed' }
    ],
    fuel_statistics: { avg_mpg: 7.2, current_level: 68, monthly_cost: 4200 },
    isFavorite: true
  },
  {
    id: 'v2',
    registration_number: 'KA-03-FE-1040',
    model: 'Freightliner Cascadia',
    type: 'Semi-Truck',
    max_load_capacity: 40000,
    odometer: 98400,
    acquisition_cost: 120000,
    status: 'Available',
    fuel_type: 'Diesel',
    purchase_date: '2024-01-18',
    insurance_expiry: '2026-08-20',
    photo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=60',
    notes: 'Excellent driver feedback on cabin comfort.',
    region: 'West',
    timeline: [
      { id: 't4', date: '2026-07-11', event: 'Returned from Trip #TR-101', type: 'success' },
      { id: 't5', date: '2026-05-12', event: 'AC compressor checkup', type: 'info' }
    ],
    maintenance_history: [
      { id: 'm3', date: '2026-05-12', type: 'AC Compressor Service', cost: 720, notes: 'Recharged coolant and tightened belts' }
    ],
    trip_history: [
      { id: 'th3', date: '2026-07-08', route: 'Bangalore to Chennai', driver: 'Sarah Jenkins', distance: 350, status: 'Completed' }
    ],
    fuel_statistics: { avg_mpg: 6.8, current_level: 95, monthly_cost: 3800 },
    isFavorite: false
  },
  {
    id: 'v3',
    registration_number: 'WB-02-BO-4480',
    model: 'Isuzu NPR-HD',
    type: 'Box Truck',
    max_load_capacity: 14500,
    odometer: 64200,
    acquisition_cost: 65000,
    status: 'In Shop',
    fuel_type: 'Gasoline',
    purchase_date: '2023-09-05',
    insurance_expiry: '2026-07-28', // Expiring in 16 days!
    photo: 'https://images.unsplash.com/photo-1516576880881-148f766e9fcc?w=400&auto=format&fit=crop&q=60',
    notes: 'City delivery operations. Needs new starter motor.',
    region: 'East',
    timeline: [
      { id: 't6', date: '2026-07-11', event: 'Towed to Shop: Ignition Failure', type: 'warning' },
      { id: 't7', date: '2026-06-01', event: 'Tire rotation completed', type: 'success' }
    ],
    maintenance_history: [
      { id: 'm4', date: '2026-07-11', type: 'Starter Motor Diagnosis', cost: 180, notes: 'Diagnosing starting failure' },
      { id: 'm5', date: '2026-06-01', type: 'Full Tire Replacement & Alignment', cost: 1100, notes: '4 rear tires replaced' }
    ],
    trip_history: [
      { id: 'th4', date: '2026-07-05', route: 'Howrah to Kolkata', driver: 'Dave Rodriguez', distance: 20, status: 'Completed' }
    ],
    fuel_statistics: { avg_mpg: 11.5, current_level: 12, monthly_cost: 1600 },
    isFavorite: false
  },
  {
    id: 'v4',
    registration_number: 'TN-01-VA-2210',
    model: 'Ford Transit 350',
    type: 'Cargo Van',
    max_load_capacity: 3500,
    odometer: 42100,
    acquisition_cost: 45000,
    status: 'Available',
    fuel_type: 'Gasoline',
    purchase_date: '2024-06-20',
    insurance_expiry: '2027-06-20',
    photo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop&q=60',
    notes: 'Last-mile delivery van. Excellent steering responsiveness.',
    region: 'South',
    timeline: [
      { id: 't8', date: '2026-07-10', event: 'Completed multi-drop schedule', type: 'success' }
    ],
    maintenance_history: [],
    trip_history: [
      { id: 'th5', date: '2026-07-10', route: 'Chennai Metro Loop', driver: 'Emma Watson', distance: 80, status: 'Completed' }
    ],
    fuel_statistics: { avg_mpg: 16.2, current_level: 82, monthly_cost: 950 },
    isFavorite: true
  },
  {
    id: 'v5',
    registration_number: 'DL-01-SE-5030',
    model: 'Peterbilt 579',
    type: 'Semi-Truck',
    max_load_capacity: 45000,
    odometer: 185900,
    acquisition_cost: 145000,
    status: 'On Trip',
    fuel_type: 'Diesel',
    purchase_date: '2022-11-01',
    insurance_expiry: '2026-11-01',
    photo: 'https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?w=400&auto=format&fit=crop&q=60',
    notes: 'Heavy cargo configuration. Equipped with APU unit.',
    region: 'Central',
    timeline: [
      { id: 't9', date: '2026-07-09', event: 'Dispatched: Delhi to Jaipur', type: 'info' }
    ],
    maintenance_history: [
      { id: 'm6', date: '2026-05-20', type: 'Transmission Fluid Flush', cost: 890, notes: 'Routine preventative filter/fluid' }
    ],
    trip_history: [
      { id: 'th6', date: '2026-07-09', route: 'Delhi to Jaipur', driver: 'Robert Chen', distance: 270, status: 'Active' }
    ],
    fuel_statistics: { avg_mpg: 6.4, current_level: 54, monthly_cost: 4900 },
    isFavorite: false
  },
  {
    id: 'v6',
    registration_number: 'GJ-01-FL-7720',
    model: 'Kenworth T680',
    type: 'Semi-Truck',
    max_load_capacity: 42000,
    odometer: 112000,
    acquisition_cost: 130000,
    status: 'Available',
    fuel_type: 'Diesel',
    purchase_date: '2023-08-15',
    insurance_expiry: '2026-08-15',
    photo: 'https://images.unsplash.com/photo-1617469165786-8007eda3cac7?w=400&auto=format&fit=crop&q=60',
    notes: 'Fuel economy optimized trim. Predictive cruise control enabled.',
    region: 'West',
    timeline: [
      { id: 't10', date: '2026-07-08', event: 'Routine scheduled tire safety checks', type: 'success' }
    ],
    maintenance_history: [],
    trip_history: [
      { id: 'th7', date: '2026-07-05', route: 'Mumbai to Ahmedabad', driver: 'Sarah Jenkins', distance: 530, status: 'Completed' }
    ],
    fuel_statistics: { avg_mpg: 7.6, current_level: 89, monthly_cost: 3200 },
    isFavorite: false
  },
  {
    id: 'v7',
    registration_number: 'MH-14-RE-3310',
    model: 'Great Dane Reefer 53',
    type: 'Flatbed',
    max_load_capacity: 45000,
    odometer: 210400,
    acquisition_cost: 85000,
    status: 'Retired',
    fuel_type: 'Diesel',
    purchase_date: '2019-02-10',
    insurance_expiry: '2026-02-10',
    photo: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=60',
    notes: 'Exceeded useful life criteria. Decommissioned and parts harvested.',
    region: 'Central',
    timeline: [
      { id: 't11', date: '2026-04-01', event: 'Officially Retired from Fleet operations', type: 'warning' }
    ],
    maintenance_history: [
      { id: 'm7', date: '2026-01-05', type: 'Reefer Unit Decommissioning', cost: 300, notes: 'Drained cooling agent' }
    ],
    trip_history: [],
    fuel_statistics: { avg_mpg: 0, current_level: 0, monthly_cost: 0 },
    isFavorite: false
  }
];

export const mockDrivers: ExtendedDriver[] = [
  {
    id: 'd1',
    name: 'Marcus Miller',
    license_number: 'DL-1420230088392',
    license_category: 'Class A CDL',
    license_expiry_date: '2026-08-15',
    contact_number: '+91 98765 43210',
    safety_score: 94,
    status: 'On Trip',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
    email: 'marcus.miller@transitops.com',
    address: '422 MG Road, Bangalore, KA 560001',
    experience: 8,
    blood_group: 'O+',
    emergency_contact: 'Lisa Sharma (Wife) - +91 98765 43211',
    notes: 'Experienced hazard-certified driver. Punctual and safety-conscious.',
    completed_trips: 342,
    violation_history: [
      { id: 'v_h1', date: '2025-11-12', type: 'Minor Speeding (65 in 55 zone)', points: 2 }
    ],
    documents: [
      { name: 'CDL License', status: 'expiring', expiryDate: '2026-08-15' },
      { name: 'DOT Medical Certificate', status: 'valid', expiryDate: '2027-04-12' },
      { name: 'TWIC Card', status: 'valid', expiryDate: '2029-01-20' }
    ],
    rating: 4.8
  },
  {
    id: 'd2',
    name: 'Sarah Jenkins',
    license_number: 'MH-1220240099381',
    license_category: 'Class A CDL',
    license_expiry_date: '2027-11-20',
    contact_number: '+91 87654 32109',
    safety_score: 98,
    status: 'Available',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60',
    email: 'sarah.jenkins@transitops.com',
    address: '811 Senapati Bapat Road, Pune, MH 411016',
    experience: 6,
    blood_group: 'A-',
    emergency_contact: 'David Jenkins (Father) - +91 87654 32108',
    notes: 'Perfect safety record over last 18 months. Highly valued team member.',
    completed_trips: 189,
    violation_history: [],
    documents: [
      { name: 'CDL License', status: 'valid', expiryDate: '2027-11-20' },
      { name: 'DOT Medical Certificate', status: 'valid', expiryDate: '2027-08-10' }
    ],
    rating: 5.0
  },
  {
    id: 'd3',
    name: 'Dave Rodriguez',
    license_number: 'WB-0220230041908',
    license_category: 'Class B CDL',
    license_expiry_date: '2026-05-10',
    contact_number: '+91 76543 21098',
    safety_score: 72,
    status: 'Suspended',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60',
    email: 'dave.rod@transitops.com',
    address: '104 Park Street, Kolkata, WB 700016',
    experience: 4,
    blood_group: 'B+',
    emergency_contact: 'Maria Rodriguez (Mother) - +91 76543 21097',
    notes: 'Temporarily suspended due to expired CDL licensing and recent hard braking occurrences.',
    completed_trips: 112,
    violation_history: [
      { id: 'v_h2', date: '2026-06-18', type: 'Hard Braking Infraction', points: 3 },
      { id: 'v_h3', date: '2026-05-10', type: 'Expired CDL operation warning', points: 4 }
    ],
    documents: [
      { name: 'CDL License', status: 'missing', expiryDate: '2026-05-10' },
      { name: 'DOT Medical Certificate', status: 'valid', expiryDate: '2027-02-14' }
    ],
    rating: 3.2
  },
  {
    id: 'd4',
    name: 'Emma Watson',
    license_number: 'TN-0120220077112',
    license_category: 'Class B CDL',
    license_expiry_date: '2028-03-14',
    contact_number: '+91 65432 10987',
    safety_score: 95,
    status: 'Available',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60',
    email: 'emma.watson@transitops.com',
    address: '332 Anna Salai, Chennai, TN 600002',
    experience: 5,
    blood_group: 'AB+',
    emergency_contact: 'John Watson (Brother) - +91 65432 10986',
    notes: 'Mainly handles Southern regional delivery routes. Dependable.',
    completed_trips: 96,
    violation_history: [],
    documents: [
      { name: 'CDL License', status: 'valid', expiryDate: '2028-03-14' },
      { name: 'DOT Medical Certificate', status: 'valid', expiryDate: '2026-12-05' }
    ],
    rating: 4.6
  },
  {
    id: 'd5',
    name: 'Robert Chen',
    license_number: 'DL-0320210033291',
    license_category: 'Class A CDL',
    license_expiry_date: '2029-06-22',
    contact_number: '+91 99887 76655',
    safety_score: 87,
    status: 'On Trip',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60',
    email: 'robert.chen@transitops.com',
    address: '772 Connaught Place, New Delhi, DL 110001',
    experience: 12,
    blood_group: 'O-',
    emergency_contact: 'Susan Chen (Wife) - +91 99887 76654',
    notes: 'Highly experienced in snowy and adverse driving conditions.',
    completed_trips: 512,
    violation_history: [
      { id: 'v_h4', date: '2026-02-14', type: 'Weight Station bypass infraction', points: 2 }
    ],
    documents: [
      { name: 'CDL License', status: 'valid', expiryDate: '2029-06-22' },
      { name: 'DOT Medical Certificate', status: 'valid', expiryDate: '2026-11-30' }
    ],
    rating: 4.2
  },
  {
    id: 'd6',
    name: 'James O\'Connor',
    license_number: 'GJ-0120230011442',
    license_category: 'Class A CDL',
    license_expiry_date: '2026-07-28',
    contact_number: '+91 88776 65544',
    safety_score: 91,
    status: 'Off Duty',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=60',
    email: 'james.oc@transitops.com',
    address: '1504 Ashram Road, Ahmedabad, GJ 380009',
    experience: 7,
    blood_group: 'A+',
    emergency_contact: 'Caitlin O\'Connor (Sister) - +91 88776 65543',
    notes: 'Takes rest periods seriously. Reliable log entries.',
    completed_trips: 204,
    violation_history: [],
    documents: [
      { name: 'CDL License', status: 'expiring', expiryDate: '2026-07-28' },
      { name: 'DOT Medical Certificate', status: 'valid', expiryDate: '2027-09-01' }
    ],
    rating: 4.5
  }
];

export const mockTrips: Trip[] = [
  {
    id: 'TR-101',
    source: 'Bangalore',
    destination: 'Chennai',
    status: 'Completed',
    cargo_weight: 38000,
    planned_distance: 350,
    vehicle_id: 'v2',
    driver_id: 'd2',
    created_at: '2026-07-08T08:00:00Z',
    completed_at: '2026-07-08T15:30:00Z'
  },
  {
    id: 'TR-102',
    source: 'Delhi',
    destination: 'Mumbai',
    status: 'Dispatched',
    cargo_weight: 42500,
    planned_distance: 1400,
    vehicle_id: 'v1',
    driver_id: 'd1',
    created_at: '2026-07-10T06:00:00Z'
  },
  {
    id: 'TR-103',
    source: 'Delhi',
    destination: 'Jaipur',
    status: 'Dispatched',
    cargo_weight: 41000,
    planned_distance: 270,
    vehicle_id: 'v5',
    driver_id: 'd5',
    created_at: '2026-07-11T12:00:00Z'
  },
  {
    id: 'TR-104',
    source: 'Mumbai',
    destination: 'Ahmedabad',
    status: 'Completed',
    cargo_weight: 12000,
    planned_distance: 530,
    vehicle_id: 'v6',
    driver_id: 'd2',
    created_at: '2026-07-05T09:00:00Z',
    completed_at: '2026-07-05T12:45:00Z'
  },
  {
    id: 'TR-105',
    source: 'Kolkata',
    destination: 'Patna',
    status: 'Draft',
    cargo_weight: 8500,
    planned_distance: 580,
    vehicle_id: 'v3',
    driver_id: 'd6',
    created_at: '2026-07-12T09:30:00Z'
  }
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'l1',
    timestamp: '2026-07-12T10:45:00Z',
    type: 'trip',
    message: 'Trip TR-102: GPS ping received. In-transit near Nagpur, Maharashtra.',
    status: 'info',
    user: 'System'
  },
  {
    id: 'l2',
    timestamp: '2026-07-12T09:12:00Z',
    type: 'vehicle',
    message: 'Vehicle WB-02-BO-4480 (Isuzu NPR) checked into maintenance bay 2.',
    status: 'warning',
    user: 'Dave Rodriguez'
  },
  {
    id: 'l3',
    timestamp: '2026-07-11T16:40:00Z',
    type: 'driver',
    message: 'Safety Score Warning issued for Dave Rodriguez: score fell to 72.',
    status: 'danger',
    user: 'Safety Officer'
  },
  {
    id: 'l4',
    timestamp: '2026-07-11T14:30:00Z',
    type: 'maintenance',
    message: 'AC Compressor Service completed on KA-03-FE-1040. Cost: ₹720.',
    status: 'success',
    user: 'Fleet Manager'
  },
  {
    id: 'l5',
    timestamp: '2026-07-10T18:15:00Z',
    type: 'trip',
    message: 'Trip TR-101 (Bangalore to Chennai) successfully marked Completed.',
    status: 'success',
    user: 'Dispatcher'
  },
  {
    id: 'l6',
    timestamp: '2026-07-09T08:00:00Z',
    type: 'vehicle',
    message: 'New Vehicle TN-01-VA-2210 (Ford Transit) added to the registry.',
    status: 'success',
    user: 'Fleet Manager'
  }
];

export const mockMaintenanceLogs: MaintenanceLog[] = [
  {
    id: 'm1',
    vehicle_id: 'v3',
    issue_description: 'Starter Motor Diagnosis',
    cost: 180,
    status: 'Open',
    opened_at: '2026-07-11T10:00:00Z',
  },
  {
    id: 'm2',
    vehicle_id: 'v1',
    issue_description: 'Brake Pad Replacement',
    cost: 1250,
    status: 'Closed',
    opened_at: '2026-07-01T08:00:00Z',
    closed_at: '2026-07-02T16:00:00Z',
  }
];

export const mockFuelLogs: FuelLog[] = [
  {
    id: 'f1',
    vehicle_id: 'v1',
    liters: 300,
    cost: 450,
    date: '2026-07-10T08:30:00Z',
    odometer: 141900,
  },
  {
    id: 'f2',
    vehicle_id: 'v2',
    liters: 250,
    cost: 375,
    date: '2026-07-08T09:15:00Z',
    odometer: 98150,
  }
];
