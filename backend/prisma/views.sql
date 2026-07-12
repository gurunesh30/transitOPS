CREATE OR REPLACE VIEW v_vehicles_realtime AS
SELECT 
    v.*,
    CASE 
        WHEN v.status = 'Retired' THEN 'Retired'
        WHEN EXISTS (SELECT 1 FROM "MaintenanceLog" m WHERE m.vehicle_id = v.id AND m.status = 'Open') THEN 'In_Shop'
        WHEN EXISTS (SELECT 1 FROM "Trip" t WHERE t.vehicle_id = v.id AND t.status = 'Dispatched') THEN 'On_Trip'
        ELSE 'Available'
    END AS computed_status
FROM "Vehicle" v;

CREATE OR REPLACE VIEW v_drivers_realtime AS
SELECT 
    d.*,
    CASE 
        WHEN d.status = 'Suspended' THEN 'Suspended'
        WHEN d.status = 'Off_Duty' THEN 'Off_Duty'
        WHEN EXISTS (SELECT 1 FROM "Trip" t WHERE t.driver_id = d.id AND t.status = 'Dispatched') THEN 'On_Trip'
        ELSE 'Available'
    END AS computed_status
FROM "Driver" d;