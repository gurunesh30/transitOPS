import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { FleetController } from '../controllers/fleet.controller';
import { TripController } from '../controllers/trip.controller';
import { ReportController } from '../controllers/report.controller';
import { getVehicles } from '../controllers/vehicleController';
import { authorizeUser } from '../middleware/auth';
import { checkPermissions } from '../middleware/rbac';

const router = Router();

// Open Auth Context
router.post('/auth/login', AuthController.login);

// Fleet Registry Bounds
router.post('/vehicles', authorizeUser, checkPermissions(['Fleet_Manager']), FleetController.registerVehicle);
router.get('/vehicles', authorizeUser, getVehicles);
router.post('/drivers', authorizeUser, checkPermissions(['Fleet_Manager', 'Safety_Officer']), FleetController.registerDriver);

// Trip Workflows
router.post('/trips', authorizeUser, checkPermissions(['Fleet_Manager', 'Driver']), TripController.dispatch);
router.post('/trips/:id/complete', authorizeUser, checkPermissions(['Fleet_Manager', 'Driver']), TripController.complete);

// Dashboard Intelligence & Exports
router.get('/analytics/dashboard', authorizeUser, ReportController.getDashboardMetrics);
router.get('/analytics/export', authorizeUser, checkPermissions(['Financial_Analyst', 'Fleet_Manager']), ReportController.exportCSV);

export default router;